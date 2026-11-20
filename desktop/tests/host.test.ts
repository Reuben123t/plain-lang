import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { FileAccess } from "../src/main/files";
import { ProfileStore } from "../src/main/profile";
import { DesktopHost, type NativeDialogs } from "../src/main/host";
import { DEFAULT_SETTINGS } from "../src/shared/contracts";
import { LIMITS, localPath, validateRun, validateSession } from "../src/main/validation";
import { initialFileArguments, isOfflineResource, isRendererURL } from "../src/main/security";

async function temporary(t: { after: (callback: () => Promise<void>) => void }): Promise<string> {
  const directory = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), "plain-host-test-")));
  t.after(() => fs.rm(directory, { recursive: true, force: true, maxRetries: 3 }));
  return directory;
}
function dialogs(overrides: Partial<NativeDialogs> = {}): NativeDialogs {
  return { openFiles: async () => undefined, openFolder: async () => undefined, saveFile: async () => undefined, confirmClose: async () => "cancel", trust: async () => false, ...overrides };
}
function host(directory: string, overrides: Partial<NativeDialogs> = {}, initialFiles: string[] = []): DesktopHost {
  return new DesktopHost({ userData: directory, version: "test-version", platform: process.platform, examples: [{ id: "fixture", title: "Fixture", description: "Fixture", category: "test", code: "say 1" }], childFile: "unused.cjs", dialogs: dialogs(overrides), initialFiles });
}

test("individual file grants do not grant sibling files or containing directories", async (t) => {
  const root = await temporary(t);
  const first = path.join(root, "first.plain"), second = path.join(root, "second.plain");
  await fs.writeFile(first, "say 1"); await fs.writeFile(second, "say 2");
  const access = new FileAccess();
  await assert.rejects(access.read(first));
  const granted = await access.grantFile(first);
  assert.equal((await access.read(granted)).content, "say 1");
  await assert.rejects(access.read(second), /not been granted/);
  await assert.rejects(access.list(root), /not been granted/);
  await assert.rejects(access.save(second, "changed"), /not been granted/);
});

test("directory grants are bounded and do not follow escaping symlinks or junctions", async (t) => {
  const root = await temporary(t);
  const workspace = path.join(root, "workspace"), outside = path.join(root, "outside");
  await fs.mkdir(workspace); await fs.mkdir(outside);
  await fs.writeFile(path.join(workspace, "safe.plain"), "say 1");
  await fs.writeFile(path.join(outside, "secret.plain"), "secret");
  await fs.symlink(outside, path.join(workspace, "escape"), process.platform === "win32" ? "junction" : "dir");
  const access = new FileAccess(); const granted = await access.grantDirectory(workspace);
  assert.deepEqual((await access.list(granted)).map((entry) => entry.name), ["safe.plain"]);
  await assert.rejects(access.read(path.join(workspace, "escape", "secret.plain")), /not been granted/);
  await assert.rejects(access.list(path.join(workspace, "escape")), /not been granted/);
  await assert.rejects(access.save(path.join(workspace, "escape", "new.plain"), "bad"), /not been granted/);
});

test("directory aliases return usable canonical grants without allowing retargeted escapes", async (t) => {
  const root = await temporary(t);
  const workspace = path.join(root, "workspace"), outside = path.join(root, "outside");
  const alias = path.join(root, "workspace-alias");
  await fs.mkdir(workspace); await fs.mkdir(outside);
  await fs.writeFile(path.join(workspace, "safe.plain"), "say 1");
  await fs.writeFile(path.join(outside, "secret.plain"), "secret");
  const kind = process.platform === "win32" ? "junction" : "dir";
  await fs.symlink(workspace, alias, kind);
  const access = new FileAccess();
  const granted = await access.grantDirectory(alias);
  assert.equal(granted, await fs.realpath(workspace));
  assert.deepEqual((await access.list(granted + path.sep)).map((entry) => entry.name), ["safe.plain"]);
  assert.equal((await access.read(path.join(granted, "safe.plain"))).content, "say 1");
  await fs.unlink(alias);
  await fs.symlink(outside, alias, kind);
  await assert.rejects(access.read(path.join(alias, "secret.plain")), /not been granted/);
  await assert.rejects(access.list(alias), /not been granted/);
  await assert.rejects(access.save(path.join(alias, "new.plain"), "changed"), /not been granted/);
});

test("directory listing rejects overflow instead of allocating an unbounded result", async (t) => {
  const root = await temporary(t);
  await Promise.all(Array.from({ length: LIMITS.entries + 1 }, (_, id) => fs.writeFile(path.join(root, `${id}.plain`), "")));
  const access = new FileAccess(); const granted = await access.grantDirectory(root);
  await assert.rejects(access.list(granted), /entry limit/);
});

test("optimistic atomic saves preserve originals on stale versions and deletion", async (t) => {
  const root = await temporary(t), file = path.join(root, "sample.plain");
  await fs.writeFile(file, "original");
  const access = new FileAccess(); const granted = await access.grantFile(file);
  const opened = await access.read(granted);
  const saved = await access.save(granted, "saved", opened.version);
  assert.equal(await fs.readFile(file, "utf8"), "saved");
  await fs.writeFile(file, "external edit");
  await assert.rejects(access.save(granted, "editor recovery", saved.version), /Save conflict/);
  assert.equal(await fs.readFile(file, "utf8"), "external edit");
  await fs.unlink(file);
  await assert.rejects(access.save(granted, "editor recovery", saved.version), /file was removed/);
  assert.deepEqual(await fs.readdir(root), []);
});

test("concurrent saves with one expected version allow only one writer", async (t) => {
  const root = await temporary(t), file = path.join(root, "sample.plain");
  await fs.writeFile(file, "original");
  const access = new FileAccess(); const granted = await access.grantFile(file);
  const opened = await access.read(granted);
  const results = await Promise.allSettled([access.save(granted, "first", opened.version), access.save(granted, "second", opened.version)]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(await fs.readFile(file, "utf8"), "first");
});

test("oversized files are rejected before reading them into memory", async (t) => {
  const root = await temporary(t), file = path.join(root, "large.plain");
  const handle = await fs.open(file, "w"); await handle.truncate(LIMITS.fileBytes + 1); await handle.close();
  const access = new FileAccess(); const granted = await access.grantFile(file);
  await assert.rejects(access.read(granted), /no larger/);
});

test("cancelled native Save As returns undefined without changing profile or disk", async (t) => {
  const root = await temporary(t); const service = host(root); await service.initialize();
  const before = service.profile.snapshot();
  assert.equal(await service.saveFile({ name: "draft.plain", content: "unsaved" }), undefined);
  assert.deepEqual(service.profile.snapshot(), before);
  assert.equal(await fs.readFile(path.join(root, "draft.plain"), "utf8").catch(() => undefined), undefined);
});

test("native Save As can replace the explicitly chosen destination and later versions are guarded", async (t) => {
  const root = await temporary(t), file = path.join(root, "sample.plain");
  await fs.writeFile(file, "old");
  const service = host(root, { saveFile: async () => file }); await service.initialize();
  const saved = await service.saveFile({ name: "sample.plain", content: "new" });
  assert.equal(saved?.content, "new");
  assert.equal(await fs.readFile(file, "utf8"), "new");
  await assert.rejects(service.saveFile({ path: saved!.path, name: "sample.plain", content: "overwrite without version" }), /Save conflict/);
});

test("Save As refuses an already open different document before changing disk", async (t) => {
  const root = await temporary(t), file = path.join(root, "open.plain");
  await fs.writeFile(file, "original");
  const service = host(root, { saveFile: async () => file }); await service.initialize();
  const opened = (await service.openPaths([file]))[0];
  await service.saveSession({ documents: [{ id: "other", path: opened.path, name: opened.name, content: "dirty other buffer", version: opened.version, dirty: true }] });
  await assert.rejects(service.saveFile({ documentId: "source", name: "draft.plain", content: "unwanted overwrite" }), /already open/);
  assert.equal(await fs.readFile(file, "utf8"), "original");
  const saved = await service.saveFile({ documentId: "other", name: "open.plain", content: "same document" });
  assert.equal(saved?.content, "same document");
});

test("profile persists validated settings, bounded recents and dirty recovery atomically", async (t) => {
  const root = await temporary(t);
  const store = new ProfileStore(root); await store.load();
  await Promise.all([
    store.settings({ ...DEFAULT_SETTINGS, theme: "light", timeoutSeconds: 2 }),
    store.session({ documents: [{ id: "draft", name: "Untitled.plain", content: "dirty recovery", dirty: true }], activeId: "draft" }),
    ...Array.from({ length: 25 }, (_, id) => store.openedFile(path.join(root, `${id}.plain`)))
  ]);
  const recovered = new ProfileStore(root); await recovered.load();
  assert.equal(recovered.snapshot().settings.theme, "light");
  assert.equal(recovered.snapshot().session?.documents[0].content, "dirty recovery");
  assert.equal(recovered.snapshot().recentFiles.length, LIMITS.recent);
  assert.deepEqual((await fs.readdir(root)).filter((name) => name.endsWith(".tmp")), []);
  await assert.rejects(store.settings({ ...DEFAULT_SETTINGS, timeoutSeconds: 0 }));
  assert.equal(store.snapshot().settings.timeoutSeconds, 2);
});

test("malformed and oversized profiles recover safe defaults", async (t) => {
  const root = await temporary(t);
  await fs.writeFile(path.join(root, "desktop-state.json"), "{invalid");
  let store = new ProfileStore(root); await store.load();
  assert.deepEqual(store.snapshot().settings, DEFAULT_SETTINGS);
  const handle = await fs.open(path.join(root, "desktop-state.json"), "w"); await handle.truncate(LIMITS.profileBytes + 1); await handle.close();
  store = new ProfileStore(root); await store.load();
  assert.deepEqual(store.snapshot().recentFiles, []);
});

test("session cannot manufacture filesystem grants and startup retains dirty text", async (t) => {
  const root = await temporary(t), outside = await temporary(t), file = path.join(outside, "code.plain");
  await fs.writeFile(file, "on disk");
  const service = host(root); await service.initialize();
  await assert.rejects(service.saveSession({ workspace: outside, documents: [] }), /not been granted/);
  await assert.rejects(service.saveSession({ documents: [{ id: "bad", path: file, name: "code.plain", content: "injected", dirty: false }] }), /not been granted/);
  const opened = (await service.openPaths([file]))[0];
  await service.saveSession({ documents: [{ id: "kept", path: opened.path, name: opened.name, content: "dirty recovery", version: opened.version, dirty: true }], activeId: "kept" });
  const recovered = host(root, {}, [file]); await recovered.initialize();
  assert.equal(recovered.bootstrap().version, "test-version");
  assert.equal(recovered.bootstrap().examples[0].id, "fixture");
  assert.equal(recovered.bootstrap().session?.documents.length, 1);
  assert.equal(recovered.bootstrap().session?.documents[0].content, "dirty recovery");
  await fs.unlink(file);
  const missing = host(root); await missing.initialize();
  assert.equal(missing.bootstrap().session?.documents[0].path, undefined);
  assert.equal(missing.bootstrap().session?.documents[0].content, "dirty recovery");
  assert.equal(missing.bootstrap().session?.documents[0].dirty, true);
});

test("declining trust never starts a process, including test-mode profiles", async (t) => {
  const root = await temporary(t); let asked = 0;
  const service = host(root, { trust: async () => { asked++; return false; } }); await service.initialize();
  assert.equal(await service.startRun({ code: "say 1", args: [] }), undefined);
  assert.equal(await service.startRun({ code: "say 2", args: [] }), undefined);
  assert.equal(asked, 2);
  await assert.rejects(service.startRun({ code: "say 1", args: [], workspace: os.tmpdir() }), /not been granted/);
});

test("local path and IPC input validation rejects URLs, shares, duplicates and excessive input", () => {
  for (const value of ["https://example.test/a", "file:///tmp/a", "relative.plain", "\\\\server\\share\\a", "//server/share/a", "a\0b"]) assert.throws(() => localPath(value));
  assert.throws(() => validateRun({ code: "say 1", args: Array(129).fill("") }));
  assert.throws(() => validateRun({ code: "a".repeat(LIMITS.fileBytes + 1), args: [] }));
  assert.throws(() => validateSession({ documents: [{ id: "same", name: "a", content: "", dirty: true }, { id: "same", name: "b", content: "", dirty: false }] }));
});

test("renderer security accepts only the local entry and packaged offline resources", () => {
  const root = path.resolve(os.tmpdir(), "renderer"), index = path.join(root, "index.html");
  const url = pathToFileURL(index).href;
  assert.equal(isRendererURL(url, index), true);
  assert.equal(isRendererURL(`${url}#view`, index), true);
  assert.equal(isRendererURL(`${url}?bad=1`, index), false);
  assert.equal(isRendererURL("https://example.test", index), false);
  assert.equal(isOfflineResource(pathToFileURL(path.join(root, "app.js")).href, root), true);
  assert.equal(isOfflineResource(pathToFileURL(path.join(root, "..", "secret")).href, root), false);
  assert.equal(isOfflineResource("https://cdn.example.test/app.js", root), false);
  assert.deepEqual(initialFileArguments(["electron", "app", "--test-mode", "sample.plain"], false, os.tmpdir()), [path.join(os.tmpdir(), "sample.plain")]);
});
