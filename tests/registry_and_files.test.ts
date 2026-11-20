import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { createStandardEnvironment, getBuiltinModule } from "../src/builtins";
import { createBrowserEnvironment, getBrowserModule } from "../src/builtins/browser";
import { FileSystemSandbox } from "../src/builtins/file";
import { BUILTIN_CATALOG, getBuiltin, getModuleBuiltins } from "../src/tooling/catalog";
import { isPlainFunction } from "../src/runtime/values";

function temporaryWorkspace() {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), "plain-files-"));
  const root = path.join(base, "project");
  const outside = path.join(base, "outside");
  fs.mkdirSync(root);
  fs.mkdirSync(outside);
  return { base, root, outside };
}

describe("Shared standard-library metadata", () => {
  it("describes every registered module and callable without inventing APIs", () => {
    const env = createStandardEnvironment();
    for (const entry of BUILTIN_CATALOG) {
      const module = getBuiltinModule(entry.module, env);
      assert.ok(module, entry.module);
      assert.ok(isPlainFunction(module[entry.name]), `${entry.module}.${entry.name}`);
      assert.ok(entry.signature.startsWith(entry.name + "("));
    }
    for (const name of env.getAllVariableNames()) assert.ok(getBuiltin(name), `Missing metadata for ${name}`);
    assert.equal(getBuiltin("neural_network"), undefined);
    assert.equal(getBuiltinModule("not_a_module", env), undefined);
    assert.equal(getBuiltinModule("constructor", env), undefined);
  });

  it("keeps module capabilities separate and browser metadata honest", () => {
    const node = createStandardEnvironment();
    const browser = createBrowserEnvironment();
    assert.equal(getBuiltinModule("math", node)?.run_command, undefined);
    assert.equal(getBuiltinModule("cyber", node)?.write_file, undefined);
    assert.equal(getBrowserModule("cyber", browser), undefined);
    for (const name of ["run_command", "http_get", "ai_chat", "write_file", "port_scan", "update_software"]) {
      assert.equal(browser.has(name), false, name);
    }
    for (const entry of BUILTIN_CATALOG.filter((candidate) => candidate.browserSafe)) {
      assert.ok(isPlainFunction(getBrowserModule(entry.module, browser)?.[entry.name]), entry.name);
    }
    assert.ok(getModuleBuiltins("statistics").some((entry) => entry.name === "median"));
    assert.equal(getBuiltin("ai.nn_train")?.name, "train_neural_network");
  });

  it("does not overwrite canonical banner or sort with unrelated aliases", () => {
    const env = createStandardEnvironment();
    assert.match((env.lookup("banner") as any).nativeFn("trophy"), /./);
    assert.deepEqual((env.lookup("sort") as any).nativeFn(["z", "a"]), ["a", "z"]);
    assert.equal(getBuiltin("base64_encode")?.module, "text");
    assert.throws(() => (env.lookup("range_list") as any).nativeFn(1, 3, 0), /Step cannot be zero/);
    assert.throws(() => (env.lookup("range_list") as any).nativeFn(1, Infinity), /finite/);
    assert.throws(() => (env.lookup("fill_list") as any).nativeFn(0, Infinity), /finite/);
  });

  it("provides copied arguments and useful assertion helpers", () => {
    const args = ["alpha", "space value"];
    const env = createStandardEnvironment({ args });
    const getArgs = (env.lookup("args") as any).nativeFn;
    const copy = getArgs();
    copy.push("changed");
    assert.deepEqual(getArgs(), args);
    assert.equal((env.lookup("assert_equal") as any).nativeFn({ answer: [42] }, { answer: [42] }), true);
    assert.throws(() => (env.lookup("assert") as any).nativeFn(false, "Expected success"), /Expected success/);
    assert.throws(() => (env.lookup("assert_equal") as any).nativeFn(1, 2), /Expected 2, received 1/);
  });
});

describe("Project filesystem boundaries", () => {
  it("rejects traversal, permits dot-prefixed names, and roots new nested files", () => {
    const { base, root, outside } = temporaryWorkspace();
    try {
      const sandbox = new FileSystemSandbox(root);
      sandbox.writeFile("nested/hello.txt", "hello");
      sandbox.writeFile("..notes", "inside");
      assert.equal(sandbox.readFile("nested/hello.txt"), "hello");
      assert.equal(sandbox.readFile("..notes"), "inside");
      assert.throws(() => sandbox.resolvePath("../outside/secret.txt"), /outside the project/);
      assert.throws(() => sandbox.resolvePath(path.join(outside, "secret.txt")), /outside the project/);
      if (process.platform === "win32") {
        const drive = path.parse(root).root.toUpperCase().startsWith("Z:") ? "Y:" : "Z:";
        assert.throws(() => sandbox.resolvePath(`${drive}\\outside.txt`), /outside the project/);
      }
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("rejects symlink escapes, including writes through a linked parent", (context) => {
    const { base, root, outside } = temporaryWorkspace();
    try {
      fs.writeFileSync(path.join(outside, "secret.txt"), "private");
      try {
        fs.symlinkSync(outside, path.join(root, "linked"), process.platform === "win32" ? "junction" : "dir");
      } catch (error: any) {
        if (error.code === "EPERM" || error.code === "EACCES") return context.skip("Symlinks unavailable on this host");
        throw error;
      }
      const sandbox = new FileSystemSandbox(root);
      assert.throws(() => sandbox.readFile("linked/secret.txt"), /outside the project/);
      assert.throws(() => sandbox.writeFile("linked/new/created.txt", "no"), /outside the project/);
      assert.equal(fs.existsSync(path.join(outside, "new")), false);
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("applies the same root to CSV, automation and checksum helpers", () => {
    const { base, root, outside } = temporaryWorkspace();
    try {
      fs.writeFileSync(path.join(root, "inside.txt"), "hello");
      fs.writeFileSync(path.join(outside, "secret.txt"), "secret");
      const env = createStandardEnvironment({ baseDir: root });
      const call = (name: string, ...args: any[]) => (env.lookup(name) as any).nativeFn(...args);
      call("copy_file", "inside.txt", "nested/copied.txt");
      assert.equal(fs.readFileSync(path.join(root, "nested", "copied.txt"), "utf8"), "hello");
      assert.equal(call("checksum_file", "inside.txt", "sha256"), "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824");
      for (const name of ["read_file", "read_csv", "checksum_file", "parse_env_file", "walk_directory"]) {
        assert.throws(() => call(name, "../outside/secret.txt"), /outside the project/, name);
      }
      assert.throws(() => call("copy_file", "inside.txt", "../outside/overwrite.txt"), /outside the project/);
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });
});
