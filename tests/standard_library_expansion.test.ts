import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { runPlain } from "../src/index";

describe("Expanded text and collection helpers", () => {
  it("adds collection ordering, grouping and pairing helpers", async () => {
    const output: string[] = [];
    const source = 'items = [1, 2, 3]\nsay rotate(items, 1)\nsay enumerate(items)\nsay adjacent_pairs(items)\nsay interleave([1, 3], [2, 4])\npeople = [{"team": "red"}, {"team": "blue"}, {"team": "red"}]\nsay count(group_by(people, "team").red)';
    await runPlain(source, { onSay: (text) => output.push(text) });
    assert.deepEqual(output, ["[2, 3, 1]", "[[1, 1], [2, 2], [3, 3]]", "[[1, 2], [2, 3]]", "[1, 2, 3, 4]", "2"]);
  });

  it("adds text cleanup, truncation, substring and HTML helpers", async () => {
    const output: string[] = [];
    const source = 'say normalize_whitespace("  many  words\\n together ")\nsay truncate_text("abcdefgh", 5)\nsay count_substring("banana", "an")\nsay strip_prefix("plain-language", "plain-")\nsay strip_suffix("main.plain", ".plain")\nsay escape_html("<tag>&")\nsay unescape_html("&lt;tag&gt;&amp;")';
    await runPlain(source, { onSay: (text) => output.push(text) });
    assert.deepEqual(output, ["many words together", "abcd…", "2", "language", "main", "&lt;tag&gt;&amp;", "<tag>&"]);
  });

  it("encodes and decodes UTF-8 Base64 in browser and Node runtimes", async () => {
    const output: string[] = [];
    await runPlain('encoded = base64_encode("PLAIN 🌱")\nsay base64_decode(encoded)', { onSay: (text) => output.push(text) });
    assert.deepEqual(output, ["PLAIN 🌱"]);
  });
});
