import { test } from "node:test";
import assert from "node:assert/strict";
import { DocumentStore, documentPathKey, preserveDocumentContent } from "../src/renderer/documents";
import type { SessionDocument } from "../src/shared/contracts";
import { AnalysisWorkerHandler, type AnalysisWorkerRequest, type WorkerOperation, type WorkerResults } from "../src/renderer/analysis-worker";
import { getBuiltin } from "../../src/tooling/catalog";

const document = (id: string, content = 'say "hello"\n', extra: Partial<SessionDocument> = {}): SessionDocument =>
  ({ id, name: `${id}.plain`, content, dirty: false, ...extra });

test("documents preserve id/path identity and never overwrite an existing dirty buffer", () => {
  const state = new DocumentStore();
  state.add(document("first", "saved", { path: "C:\\Work\\demo.plain", version: "v1" }));
  state.update("first", "editing");
  assert.equal(state.add(document("second", "disk", { path: "c:/work/./demo.plain" })).id, "first");
  assert.equal(state.add(document("first", "also disk")).content, "editing");
  assert.equal(state.documents.length, 1);
  assert.equal(state.activeId, "first");
  assert.equal(state.active?.version, "v1");
  assert.equal(documentPathKey("\\\\Server\\Share\\sub\\..\\file.plain"), "//server/share/file.plain");
  state.add(document("posix-upper", "", { path: "/Work/demo.plain" }));
  state.add(document("posix-lower", "", { path: "/work/demo.plain" }));
  assert.equal(state.documents.length, 3);
});

test("documents compare against the saved base, and undo clears dirty", () => {
  const state = new DocumentStore([document("one", "original", { version: "etag" })]);
  assert.equal(state.update("one", "changed")?.dirty, true);
  assert.equal(state.update("one", "original")?.dirty, false);
  assert.equal(state.active?.version, "etag");
  assert.equal(state.update("missing", "text"), undefined);
});

test("Monaco updates preserve BOM, CRLF, terminal newline and empty files", () => {
  const original = '\uFEFFsay "hello"\r\n';
  const state = new DocumentStore([document("one", original)]);
  assert.equal(state.update("one", 'say "hello"\n')?.dirty, false);
  assert.equal(state.active?.content, original);
  assert.equal(state.update("one", 'say "new"\n')?.content, '\uFEFFsay "new"\r\n');
  assert.equal(state.active?.dirty, true);
  assert.equal(state.update("one", 'say "hello"\n')?.dirty, false);
  assert.equal(state.update("one", "")?.content, "\uFEFF");
  assert.equal(state.update("one", 'say "hello"')?.dirty, true);
  assert.equal(preserveDocumentContent("", ""), "");
  assert.equal(preserveDocumentContent("a\nb\n", "a\r\nb\n"), "a\r\nb\n");
});

test("restored dirty sessions retain unknown saved base until saved", () => {
  const state = new DocumentStore([document("one", "recovered", { dirty: true })]);
  state.update("one", "another edit");
  assert.equal(state.update("one", "recovered")?.dirty, true);
  assert.equal(state.markSaved("one", { path: "/one.plain", name: "one.plain", version: "v2", content: "recovered" })?.dirty, false);
  state.update("one", "after save");
  assert.equal(state.update("one", "recovered")?.dirty, false);
});

test("save-as retains document id and pending edits while adopting saved metadata", () => {
  const state = new DocumentStore([document("untitled", "initial", { dirty: true })]);
  state.update("untitled", "newer edit");
  const saved = state.markSaved("untitled", { path: "C:/work/saved.plain", name: "saved.plain", version: "v3", content: "initial" })!;
  assert.equal(saved.id, "untitled");
  assert.equal(saved.name, "saved.plain");
  assert.equal(saved.path, "C:/work/saved.plain");
  assert.equal(saved.version, "v3");
  assert.equal(saved.content, "newer edit");
  assert.equal(saved.dirty, true);
  assert.equal(state.update("untitled", "initial")?.dirty, false);
  assert.equal(state.add(document("reopen", "initial", { path: "c:\\work\\saved.plain" })).id, "untitled");
});

test("close selects the next then previous tab and missing ids do not change selection", () => {
  const state = new DocumentStore([document("a"), document("b"), document("c")], "b");
  assert.equal(state.activeId, "b");
  assert.equal(state.close("missing"), undefined);
  assert.equal(state.activeId, "b");
  state.close("b");
  assert.equal(state.activeId, "c");
  state.close("c");
  assert.equal(state.activeId, "a");
  state.close("a");
  assert.equal(state.active, undefined);
  assert.equal(state.activeId, undefined);
  assert.deepEqual(state.snapshot(), []);
});

test("document snapshots cannot mutate internal identity, contents or dirty state", () => {
  const state = new DocumentStore([document("one", "original")]);
  const snapshot = state.snapshot();
  snapshot[0].content = "injected";
  snapshot[0].id = "different";
  state.active!.dirty = true;
  assert.deepEqual(state.get("one"), document("one", "original"));
  assert.equal(state.open("missing"), undefined);
  assert.equal(state.activeId, "one");
});

test("save-as refuses to duplicate an open file's canonical path", () => {
  const state = new DocumentStore([document("a", "first", { path: "C:/a.plain" }), document("b", "second")]);
  assert.throws(() => state.markSaved("b", { path: "c:\\a.plain", name: "a.plain", version: "v1", content: "second" }), /already open/);
  assert.equal(state.get("b")?.path, undefined);
  assert.equal(state.get("b")?.content, "second");
});

test("approved external reload replaces edits, saved base, format and metadata without changing identity", () => {
  const state = new DocumentStore([document("one", "original", { path: "/one.plain", version: "v1" })]);
  state.update("one", "local edits");
  const file = { path: "/renamed.plain", name: "renamed.plain", content: '\uFEFFsay "disk"\r\n', version: "v2" };
  assert.deepEqual(state.reload("one", file), { ...file, id: "one", dirty: false });
  assert.equal(state.activeId, "one");
  assert.equal(state.update("one", 'say "disk"\n')?.dirty, false);
  assert.equal(state.update("one", 'say "edit"\n')?.content, '\uFEFFsay "edit"\r\n');
  assert.equal(state.update("one", 'say "disk"\n')?.dirty, false);
  assert.equal(state.reload("missing", file), undefined);
});

test("acknowledging an external version preserves local edits and an unknown dirty baseline until save", () => {
  const state = new DocumentStore([document("one", "original", { path: "/one.plain", version: "v1" })]);
  state.update("one", "local edits");
  assert.deepEqual(state.acknowledgeExternal("one", "v2"), document("one", "local edits", { path: "/one.plain", version: "v2", dirty: true }));
  assert.equal(state.update("one", "original")?.dirty, true);
  assert.equal(state.update("one", "local edits")?.dirty, true);
  assert.equal(state.markSaved("one", { path: "/one.plain", name: "one.plain", version: "v3", content: "local edits" })?.dirty, false);
  assert.equal(state.acknowledgeExternal("missing", "v2"), undefined);
});

function workerDocument(source: string) {
  const handler = new AnalysisWorkerHandler();
  let id = 0;
  const request = <K extends WorkerOperation>(operation: K, extra: Partial<AnalysisWorkerRequest> = {}) => handler.handle({
    id: ++id, operation, source, uri: "plain-test:/one.plain", version: 1, filename: "one.plain", ...extra
  });
  const query = <K extends WorkerOperation>(operation: K, extra: Partial<AnalysisWorkerRequest> = {}): WorkerResults[K] => {
    const response = structuredClone(request(operation, extra));
    assert.equal(response.error, undefined);
    return response.result as WorkerResults[K];
  };
  return { request, query };
}

test("analysis worker keeps lexical indexes in cache and serializes only query results", () => {
  const source = 'value = 1\r\ndef combine(first, second):\r\n  return first + second + value\r\nend\r\nsay combine(value, 2)\r\n';
  const { query } = workerDocument(source);
  assert.deepEqual(query("analyze"), { diagnostics: [] });
  const use = source.lastIndexOf("value");
  const definition = query("definition", { position: use })!;
  assert.equal(source.slice(definition.start.offset, definition.end.offset), "value");
  assert.equal(query("references", { position: use }).length, 3);
  assert.equal(query("rename", { position: use, newName: "amount" }).length, 3);
  assert.equal(query("prepareRename", { position: use })?.text, "value");
  const signature = query("signature", { position: source.indexOf("value, 2") + 8 })!;
  assert.deepEqual(signature.parameters, ["first", "second"]);
  assert.equal(signature.activeParameter, 1);
  assert.ok(query("symbols").some((symbol) => symbol.name === "combine"));
  assert.ok(query("folds").some((fold) => fold.startLine === 1 && fold.endLine === 3));
});

test("worker validates rename and retains UTF-16 positions across Unicode and CRLF", () => {
  const source = 'say "😀"\r\nx = 1\r\ndef change(x):\r\n  y = 2\r\n  return X + y\r\nend\r\nsay x\r\n';
  const { query, request } = workerDocument(source);
  const definition = query("definition", { position: source.indexOf("X +") })!;
  assert.equal(definition.start.line, 2);
  assert.equal(definition.start.character, 11);
  assert.match(request("rename", { position: source.indexOf("X +"), newName: "y" }).error ?? "", /conflict|capture/);
  assert.match(request("rename", { position: source.indexOf("X +"), newName: "if" }).error ?? "", /keyword|identifier/);
});

test("worker suggestions are canonical and resolve imported module aliases and local scopes", () => {
  const source = 'import math as numbers\ndef outer(private_value):\n  return private_value\nend\nnumbers.\n';
  const { query } = workerDocument(source);
  const members = query("completion", { position: source.length - 1 });
  assert.ok(members.some((entry) => entry.name === "sqrt"));
  assert.ok(members.every((entry) => !!getBuiltin(`math.${entry.name}`)));
  const global = query("completion", { position: source.indexOf("numbers.") });
  assert.ok(global.some((entry) => entry.name === "outer"));
  assert.ok(!global.some((entry) => entry.name === "private_value"));
  const local = query("completion", { position: source.indexOf("return private_value") + 10 });
  assert.ok(local.some((entry) => entry.name === "private_value"));
  assert.ok(global.filter((entry) => entry.kind === "function" && entry.name !== "outer").every((entry) => getBuiltin(entry.name)));
  assert.deepEqual(workerDocument('say "hello" # sqrt').query("completion", { position: 18 }), []);
});

test("worker hover resolves builtins, module aliases and same-document symbols", () => {
  const source = 'import math as numbers\nx = 1\nsay numbers.sqrt(x)\nsay length([1])\n';
  const { query } = workerDocument(source);
  assert.match(query("hover", { position: source.indexOf("sqrt") + 2 })?.code ?? "", /numbers\.sqrt/);
  assert.match(query("hover", { position: source.indexOf("length") + 2 })?.description ?? "", /./);
  assert.equal(query("hover", { position: source.indexOf("x)") })?.code, "variable x");
});

test("worker rejects stale versions and releases cached indexes on close", () => {
  const { query, request } = workerDocument("x = 1\nsay x\n");
  query("analyze", { version: 5 });
  assert.match(request("definition", { version: 4, position: 10 }).error ?? "", /stale/i);
  query("close", { version: 5 });
  assert.equal(query("definition", { version: 1, position: 10 })?.start.offset, 0);
});

test("worker formatter preserves source encodings, and analysis does not execute imports", () => {
  const source = '\uFEFFif true then\r\nsay "yes"\r\nend\r\n';
  const { query } = workerDocument(source);
  assert.equal(query("format", { formatOptions: { tabSize: 2, insertSpaces: true } }), '\uFEFFif true then\r\n  say "yes"\r\nend\r\n');
  const neverRun = workerDocument('import "this-file-does-not-exist.plain" as untouched\nsay unknown\n');
  assert.deepEqual(neverRun.query("analyze"), { diagnostics: [] });
  assert.ok(neverRun.query("symbols").some((symbol) => symbol.name === "untouched"));
});
