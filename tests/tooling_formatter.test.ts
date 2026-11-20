import { test } from "node:test";
import assert from "node:assert/strict";
import { Lexer } from "../src/lexer/lexer";
import { Parser } from "../src/parser/parser";
import { formatSource } from "../src/tooling/formatter";

function tree(source: string): unknown {
  return JSON.parse(JSON.stringify(new Parser(new Lexer(source).tokenize(), source).parse(), (key, value) => key === "location" ? undefined : value));
}

test("formatter indents English/Python blocks and branches without rewriting syntax", () => {
  const source = [
    "def choose(value):",
    "if value > 2:",
    'say "yes # end"  # keep  spaces',
    "otherwise if value == 2 then",
    'say "two"',
    "else:",
    "repeat 2 times",
    'say "no"',
    "end",
    "end",
    "end",
    ""
  ].join("\n");
  const expected = [
    "def choose(value):",
    "    if value > 2:",
    '        say "yes # end"  # keep  spaces',
    "    otherwise if value == 2 then",
    '        say "two"',
    "    else:",
    "        repeat 2 times",
    '            say "no"',
    "        end",
    "    end",
    "end",
    ""
  ].join("\n");
  assert.equal(formatSource(source), expected);
  assert.deepEqual(tree(source), tree(expected));
  assert.equal(formatSource(expected), expected);
});

test("formatter preserves CRLF, BOM, blank-line whitespace, comments and escaped strings", () => {
  const source = '\uFEFFif true then\r\n\t \r\n# inside\r\nsay "a\\\" # end" # unchanged\r\nend';
  const expected = '\uFEFFif true then\r\n\t \r\n  # inside\r\n  say "a\\\" # end" # unchanged\r\nend';
  assert.equal(formatSource(source, { insertSpaces: true, tabSize: 2 }), expected);
  assert.equal(formatSource(expected, { insertSpaces: true, tabSize: 2 }), expected);
  assert.deepEqual(tree(source), tree(expected));
});

test("formatter handles multiline delimiters without treating words in strings as blocks", () => {
  const source = [
    "to build",
    "items = [",
    '"if",',
    "[1, 2],",
    '"end"',
    "]",
    "result = {",
    '"key": items,',
    '"other": [',
    "1,",
    "2",
    "]",
    "}",
    "end"
  ].join("\n");
  const expected = [
    "to build",
    "\titems = [",
    '\t\t"if",',
    "\t\t[1, 2],",
    '\t\t"end"',
    "\t]",
    "\tresult = {",
    '\t\t"key": items,',
    '\t\t"other": [',
    "\t\t\t1,",
    "\t\t\t2",
    "\t\t]",
    "\t}",
    "end"
  ].join("\n");
  assert.equal(formatSource(source, { insertSpaces: false, tabSize: 4 }), expected);
  assert.deepEqual(tree(source), tree(expected));
  assert.equal(formatSource(expected, { insertSpaces: false }), expected);
});

test("formatter handles elif without creating an extra block", () => {
  const source = 'if true:\nsay 1\nelif false:\nsay 2\nelse:\nsay 3\nend';
  const expected = 'if true:\n    say 1\nelif false:\n    say 2\nelse:\n    say 3\nend';
  assert.equal(formatSource(source), expected);
  assert.equal(formatSource(expected), expected);
});

test("formatter is conservative for malformed lines and preserves trailing whitespace", () => {
  const source = 'if true\nsay "not closed   \n# end\nend  \n\n  \n';
  const formatted = formatSource(source);
  assert.ok(formatted.includes('say "not closed   \n'));
  assert.ok(formatted.endsWith('end  \n\n  \n'));
  assert.equal(formatSource(formatted), formatted);
  assert.equal(formatSource(""), "");
  assert.equal(formatSource("  \r\n\t\n"), "  \r\n\t\n");
});

test("formatter respects multiline function headers and closing delimiters", () => {
  const source = 'def select(\nfirst,\nsecond\n):\nreturn first\nend\nsay select(\n1,\n2\n)';
  const expected = 'def select(\n    first,\n    second\n):\n    return first\nend\nsay select(\n    1,\n    2\n)';
  assert.equal(formatSource(source), expected);
  assert.deepEqual(tree(source), tree(expected));
  assert.equal(formatSource(expected), expected);
});
