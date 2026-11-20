import { test, describe } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { runPlain } from "../src/index";
import { Environment } from "../src/runtime/environment";
import { PlainFunction, getPlainTypeName, isPlainFunction, isPlainObject } from "../src/runtime/values";

async function outputOf(source: string): Promise<string[]> {
  const output: string[] = [];
  await runPlain(source, { onSay: (text) => output.push(text) });
  return output;
}

async function withModules(files: Record<string, string>, action: (baseDir: string) => Promise<void>): Promise<void> {
  const baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "plain-runtime-"));
  try {
    for (const [name, source] of Object.entries(files)) {
      const filename = path.join(baseDir, name);
      fs.mkdirSync(path.dirname(filename), { recursive: true });
      fs.writeFileSync(filename, source);
    }
    await action(baseDir);
  } finally {
    fs.rmSync(baseDir, { recursive: true, force: true });
  }
}

describe("Runtime regressions", () => {
  test("power binds more tightly than multiplication and associates to the right", async () => {
    assert.deepEqual(await outputOf("say 2 * 3 ** 2\nsay 2 ** 3 ** 2\nsay 20 // 2 ** 2"), ["18", "512", "5"]);
  });

  test("unary minus binds outside power but is accepted in its exponent", async () => {
    assert.deepEqual(await outputOf("say -2 ** 2\nsay (-2) ** 2\nsay 2 ** -2\nsay -2 ** -2"), ["-4", "4", "0.25", "-0.25"]);
  });

  test("not applies to comparisons before and/or", async () => {
    assert.deepEqual(await outputOf("say not 1 == 2\nsay not 2 > 1\nsay not false and false\nsay not not true"), ["true", "false", "false", "true"]);
  });

  test("new assignments stay local while existing ancestor variables are updated", () => {
    const root = new Environment();
    root.define("Shared", 1);
    const child = new Environment(root);
    const grandchild = new Environment(child);
    child.assign("Local", 2);
    grandchild.assign("LOCAL", 3);
    grandchild.assign("SHARED", 4);
    assert.equal(root.has("local"), false);
    assert.equal(child.lookup("local"), 3);
    assert.equal(root.lookup("shared"), 4);
  });

  test("function locals do not leak and closures retain their own state", async () => {
    const runtime = await runPlain(`
shared = 0
def make_counter(seed)
    count_value = seed
    def next_value()
        count_value += 1
        shared += 1
        return count_value
    end
    return next_value
end
first_counter = make_counter(10)
second_counter = make_counter(20)
a = first_counter()
b = second_counter()
c = first_counter()
`);
    const env = runtime.getGlobalEnvironment();
    assert.equal(env.has("count_value"), false);
    assert.equal(env.has("next_value"), false);
    assert.deepEqual([env.lookup("a"), env.lookup("b"), env.lookup("c"), env.lookup("shared")], [11, 21, 12, 3]);
  });

  test("overlapping async calls keep separate parameter environments", async () => {
    const runtime = await runPlain(`
def task(label)
    pause()
    return label
end
`);
    const releases: Array<() => void> = [];
    const env = runtime.getGlobalEnvironment();
    env.define("pause", { type: "function", name: "pause", parameters: [], nativeFn: () => new Promise<void>((resolve) => releases.push(resolve)) });
    const fn = env.lookup("task") as PlainFunction;
    const calls = [runtime.callFunction(fn, ["first"]), runtime.callFunction(fn, ["second"])];
    const settled = Promise.allSettled(calls);
    for (let i = 0; i < 20 && releases.length < 2; i++) {
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
    assert.equal(releases.length, 2);
    releases[0]();
    await new Promise<void>((resolve) => setImmediate(resolve));
    releases[1]();
    assert.deepEqual(await settled, [
      { status: "fulfilled", value: "first" },
      { status: "fulfilled", value: "second" }
    ]);
  });

  test("member and index assignments support every arithmetic compound operator", async () => {
    assert.deepEqual(await outputOf(`
record = {"values": [9, 2], "total": 10}
record.total += 5
record.values[0] %= 4
record.values[1] **= 3
record.total //= 4
record.values[-1] += record.total
say record.total
say record.values
`), ["3", "[1, 11]"]);
  });

  test("assignment targets and index expressions are evaluated once", async () => {
    assert.deepEqual(await outputOf(`
object_calls = 0
index_calls = 0
values = [5]
def get_values()
    object_calls += 1
    return values
end
def next_index()
    index_calls += 1
    return 0
end
get_values()[next_index()] += 7
say values
say object_calls
say index_calls
`), ["[12]", "1", "1"]);
  });

  test("out-of-range list writes report a runtime diagnostic", async () => {
    await assert.rejects(runPlain("values = [1]\nvalues[1] = 2"), (error: any) => error.kind === "RuntimeError" && /out of range/i.test(error.message));
  });

  test("break and continue apply to the innermost loop", async () => {
    assert.deepEqual(await outputOf(`
result = []
for n in [1, 2, 3]
    if n == 2
        continue
    end
    repeat 3 times
        add n to result
        break
    end
end
say result
`), ["[1, 3]"]);
  });

  test("dictionaries do not expose Object.prototype properties", async () => {
    assert.deepEqual(await outputOf('record = {}\nsay record.constructor\nsay record["toString"]\nsay record["__proto__"]'), ["nothing", "nothing", "nothing"]);
  });

  test("a dictionary saying type=function is still data, not a callable", async () => {
    const value = { type: "function", name: "pretend", parameters: [] };
    assert.equal(isPlainFunction(value), false);
    assert.equal(isPlainObject(value), true);
    assert.equal(getPlainTypeName(value), "dictionary");
    await assert.rejects(runPlain('pretend = {"type": "function"}\npretend()'), /not a function/i);
  });

  test("local modules export only local declarations and execute once per interpreter", async () => {
    await withModules({ "helpers.plain": 'say "loaded"\nvalue = 42\ndef read_value()\n return value\nend' }, async (baseDir) => {
      const output: string[] = [];
      const runtime = await runPlain('import "helpers" as first_module\nimport "./helpers.plain" as second_module\nsay second_module.read_value()', { baseDir, onSay: (text) => output.push(text) });
      const exports = runtime.getGlobalEnvironment().lookup("first_module") as Record<string, unknown>;
      assert.deepEqual(Object.keys(exports).sort(), ["read_value", "value"]);
      assert.equal(exports, runtime.getGlobalEnvironment().lookup("second_module"));
      assert.deepEqual(output, ["loaded", "42"]);
    });
  });

  test("missing modules and imported symbols produce named diagnostics", async () => {
    await assert.rejects(runPlain("import definitely_missing_module"), /module.*definitely_missing_module|definitely_missing_module.*module/i);
    await assert.rejects(runPlain("from math import definitely_missing_symbol"), /definitely_missing_symbol/);
    await withModules({ "only.plain": "value = 1" }, async (baseDir) => {
      await assert.rejects(runPlain('from "only.plain" import missing_value', { baseDir }), /missing_value/);
    });
  });
});
