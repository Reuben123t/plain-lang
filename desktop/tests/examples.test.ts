import { test } from "node:test";
import assert from "node:assert/strict";
import { EXAMPLES } from "../src/shared/examples";
import { runPlain } from "../../src/index";
import { analyzeSource } from "../../src/tooling/analyzer";

test("curated desktop examples parse and run without external services", async () => {
  assert.equal(new Set(EXAMPLES.map((example) => example.id)).size, EXAMPLES.length);
  for (const example of EXAMPLES) {
    assert.deepEqual(analyzeSource(example.code).diagnostics, [], example.id);
    const output: string[] = [];
    await runPlain(example.code, { filename: `${example.id}.plain`, onSay: (value) => output.push(value), onAsk: async () => "Studio" });
    assert.ok(output.length, `${example.id} should demonstrate output`);
    if (example.id === "conversation") assert.ok(output.some((line) => line.includes("Studio")));
  }
});
