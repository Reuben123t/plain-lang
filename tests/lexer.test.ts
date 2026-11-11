import { test, describe } from "node:test";
import assert from "node:assert";
import { Lexer } from "../src/lexer/lexer";
import { TokenType } from "../src/lexer/token";

describe("Lexer", () => {
  test("tokenizes say statement and numbers", () => {
    const input = 'say "Hello, world!"\nset age to 15';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    assert.strictEqual(tokens[0].type, TokenType.Say);
    assert.strictEqual(tokens[1].type, TokenType.String);
    assert.strictEqual(tokens[1].value, "Hello, world!");
    assert.strictEqual(tokens[2].type, TokenType.Newline);
    assert.strictEqual(tokens[3].type, TokenType.Set);
    assert.strictEqual(tokens[4].type, TokenType.Identifier);
    assert.strictEqual(tokens[4].value, "age");
    assert.strictEqual(tokens[5].type, TokenType.To);
    assert.strictEqual(tokens[6].type, TokenType.Number);
    assert.strictEqual(tokens[6].value, 15);
  });

  test("handles arithmetic and english operators", () => {
    const input = "10 plus 5 minus 2 times 3 divided by 4";
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    const types = tokens.map((t) => t.type);
    assert.ok(types.includes(TokenType.Plus));
    assert.ok(types.includes(TokenType.Minus));
    assert.ok(types.includes(TokenType.Times));
    assert.ok(types.includes(TokenType.Divided));
    assert.ok(types.includes(TokenType.By));
  });

  test("handles comparisons", () => {
    const input = "is greater than is at least is equal to";
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    assert.strictEqual(tokens[0].type, TokenType.Is);
    assert.strictEqual(tokens[1].type, TokenType.Greater);
    assert.strictEqual(tokens[2].type, TokenType.Than);
  });

  test("skips comments", () => {
    const input = '# This is a comment\nsay "Visible"\n// Another comment';
    const lexer = new Lexer(input);
    const tokens = lexer.tokenize();

    assert.strictEqual(tokens[0].type, TokenType.Say);
    assert.strictEqual(tokens[1].value, "Visible");
  });
});
