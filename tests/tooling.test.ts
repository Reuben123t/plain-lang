import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  analyzeSource,
  definitionAt,
  offsetAt,
  positionAt,
  referencesAt,
  renameAt,
  signatureAt,
  symbolAt
} from "../src/tooling/analyzer";

const textAt = (source: string, range: { start: { offset: number }; end: { offset: number } }) =>
  source.slice(range.start.offset, range.end.offset);

test("tooling reports real syntax diagnostics with UTF-16 source ranges", () => {
  const source = '\uFEFFsay "hello"\r\nset total to\r\n';
  const result = analyzeSource(source, "broken.plain");
  assert.equal(result.diagnostics.length, 1);
  assert.equal(result.diagnostics[0].code, "ParserError");
  assert.equal(result.diagnostics[0].filename, "broken.plain");
  assert.equal(result.diagnostics[0].range.start.line, 1);
  const total = result.tokens.find((token) => token.raw === "total")!;
  assert.equal(textAt(source, total.range), "total");
  assert.equal(total.range.start.character, 4);
  assert.deepEqual(positionAt(result, total.range.start.offset), total.range.start);
  assert.equal(offsetAt(result, total.range.start), total.range.start.offset);
  assert.equal(result.tokens[0].range.start.offset, 1);
});

test("tooling never executes source or imports while analyzing", (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plain-analyze-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const marker = path.join(dir, "executed.txt");
  const helper = path.join(dir, "helper.plain");
  fs.writeFileSync(helper, `write_file(${JSON.stringify(marker)}, "bad")\n`);
  const result = analyzeSource(`import ${JSON.stringify(helper.replace(/\\/g, "/"))} as helper\nsay unknown_name\n`, path.join(dir, "main.plain"));
  assert.deepEqual(result.diagnostics, []);
  assert.equal(fs.existsSync(marker), false);
  assert.equal(result.symbols.find((symbol) => symbol.name === "helper")?.kind, "import");
});

test("tooling resolves case-insensitive lexical scopes and excludes strings, comments and members", () => {
  const source = [
    "value = 1",
    "def outer(Value):",
    "    def inner(other):",
    "        return VALUE + other",
    "    end",
    "    return inner(value)",
    "end",
    'say "value" # VALUE is only a comment',
    'record = { value: 4 }',
    "say record.value",
    "say value"
  ].join("\n");
  const result = analyzeSource(source);
  assert.deepEqual(result.diagnostics, []);
  const parameter = symbolAt(result, source.indexOf("VALUE +"))!;
  assert.equal(parameter.kind, "parameter");
  assert.equal(parameter.name, "Value");
  assert.equal(textAt(source, definitionAt(result, source.indexOf("VALUE +"))!), "Value");
  assert.deepEqual(referencesAt(result, source.indexOf("VALUE +")).map((range) => textAt(source, range)), ["Value", "VALUE", "value"]);
  assert.equal(referencesAt(result, source.lastIndexOf("value")).length, 2);
  assert.equal(symbolAt(result, source.indexOf('"value"') + 2), undefined);
  assert.equal(symbolAt(result, source.indexOf("# VALUE") + 3), undefined);
  assert.equal(symbolAt(result, source.indexOf("record.value") + 8), undefined);
  assert.equal(symbolAt(result, source.indexOf("{ value") + 3), undefined);
});

test("tooling records declaration and write ranges without redeclaring assignments", () => {
  const source = "set score to 1\nscore += 2\nif true then\n  set score to 3\nend\nsay SCORE\n";
  const result = analyzeSource(source);
  assert.equal(result.symbols.filter((symbol) => symbol.name.toLowerCase() === "score").length, 1);
  const references = result.references.filter((reference) => reference.name.toLowerCase() === "score");
  assert.equal(references.length, 4);
  assert.equal(references.filter((reference) => reference.isDeclaration).length, 1);
  assert.equal(references.filter((reference) => reference.isWrite).length, 3);
  assert.deepEqual(referencesAt(result, source.lastIndexOf("SCORE"), false).map((range) => textAt(source, range)), ["score", "score", "SCORE"]);
});

test("tooling indexes multiline and English parameters and nested function extent", () => {
  const source = [
    "def outer(",
    "  alpha,",
    "  beta",
    "):",
    "  to combine first and second",
    "    give back first plus second",
    "  end # inner",
    "  return combine(alpha, beta)",
    "end # outer"
  ].join("\n");
  const result = analyzeSource(source);
  assert.deepEqual(result.diagnostics, []);
  const outer = result.symbols.find((symbol) => symbol.name === "outer")!;
  const combine = result.symbols.find((symbol) => symbol.name === "combine")!;
  assert.deepEqual(outer.parameters, ["alpha", "beta"]);
  assert.deepEqual(combine.parameters, ["first", "second"]);
  assert.equal(outer.range.end.line, 8);
  assert.equal(combine.range.end.line, 6);
  assert.ok(result.foldingRanges.some((range) => range.startLine === 0 && range.endLine === 8));
  assert.ok(result.foldingRanges.some((range) => range.startLine === 4 && range.endLine === 6));
  assert.equal(result.symbols.filter((symbol) => symbol.kind === "parameter").length, 4);
});

test("tooling preserves useful symbols before and after lexical errors and incomplete blocks", () => {
  const source = 'before = 1\nsay "unterminated\nafter = 2\ndef pending(value):\n  say value\n';
  const result = analyzeSource(source);
  assert.ok(result.diagnostics.some((diagnostic) => diagnostic.code === "LexerError"));
  assert.ok(result.symbols.some((symbol) => symbol.name === "before"));
  assert.ok(result.symbols.some((symbol) => symbol.name === "after"));
  assert.ok(result.symbols.some((symbol) => symbol.name === "pending"));
  assert.equal(symbolAt(result, source.lastIndexOf("value"))?.kind, "parameter");
  assert.ok(result.tokens.every((token) => token.range.start.offset >= 0 && token.range.end.offset <= source.length));
});

test("tooling leaves intentional bare identifier assignment fallback unresolved", () => {
  const source = "Set label = Main\nMain = 42\nsay main\n";
  const result = analyzeSource(source);
  assert.deepEqual(result.diagnostics, []);
  assert.equal(symbolAt(result, source.indexOf("Main")), undefined);
  const edits = renameAt(result, source.lastIndexOf("main"), "answer");
  assert.equal(edits.length, 2);
  assert.ok(edits.every((edit) => edit.range.start.offset > source.indexOf("Main")));
});

test("tooling rename is lexical, validates names and rejects capture", () => {
  const source = "x = 1\ndef change(x):\n  y = 2\n  return X + y\nend\nsay x\n";
  const result = analyzeSource(source);
  const at = source.indexOf("X +");
  assert.deepEqual(renameAt(result, at, "amount").map((edit) => [textAt(source, edit.range), edit.newText]), [["x", "amount"], ["X", "amount"]]);
  assert.throws(() => renameAt(result, at, "y"), /conflict|capture|already|collision/i);
  assert.throws(() => renameAt(result, at, "if"), /identifier|name|keyword/i);
  assert.throws(() => renameAt(result, at, "bad name"), /identifier|name/i);
  assert.deepEqual(renameAt(analyzeSource("say length([])"), 5, "size"), []);
});

test("tooling signatures count only call-level commas and support builtin module aliases", () => {
  const source = "def combine(first, second):\n return first\nend\ncombine([1, 2], combine(3, 4))\nimport math as numbers\nsay numbers.sqrt(9)\n";
  const result = analyzeSource(source);
  const nestedAt = source.indexOf("3, 4") + 4;
  assert.equal(signatureAt(result, nestedAt)?.activeParameter, 1);
  assert.deepEqual(signatureAt(result, nestedAt)?.parameters, ["first", "second"]);
  const outerAt = source.indexOf("], combine") + 3;
  assert.equal(signatureAt(result, outerAt)?.name, "combine");
  assert.equal(signatureAt(result, outerAt)?.activeParameter, 1);
  assert.match(signatureAt(result, source.indexOf("sqrt(9") + 6)?.signature ?? "", /sqrt/i);
  assert.equal(signatureAt(analyzeSource('say "combine(1, 2)" # combine('), 17), undefined);
});

test("tooling positions clamp correctly across CRLF and Unicode", () => {
  const result = analyzeSource('say "\ud83d\ude03"\r\nx = 1\n');
  assert.deepEqual(positionAt(result, 0), { line: 0, character: 0, offset: 0 });
  assert.equal(offsetAt(result, { line: 1, character: 0 }), 10);
  assert.equal(offsetAt(result, { line: 0, character: 500 }), 8);
  assert.equal(offsetAt(result, { line: 999, character: 0 }), result.source.length);
  assert.equal(positionAt(result, 999).offset, result.source.length);
});
