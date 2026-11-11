import { test, describe } from "node:test";
import assert from "node:assert";
import { runPlain, formatError, PlainError } from "../src/index";

describe("Error handling and formatting", () => {
  test("catches division by zero with friendly message", async () => {
    let capturedError: any;
    try {
      await runPlain("set x to 10 divided by 0");
    } catch (err) {
      capturedError = err;
    }

    assert.ok(capturedError instanceof PlainError);
    assert.strictEqual(capturedError.message, "Cannot divide by zero.");
    assert.strictEqual(capturedError.location.line, 1);
    const formatted = formatError(capturedError, "set x to 10 divided by 0");
    assert.ok(formatted.includes("Cannot divide by zero."));
    assert.ok(formatted.includes("^"));
  });

  test("suggests misspelled variable name", async () => {
    let capturedError: any;
    const code = `set username to "Alex"\nsay usename`;
    try {
      await runPlain(code);
    } catch (err) {
      capturedError = err;
    }

    assert.ok(capturedError instanceof PlainError);
    assert.ok(capturedError.suggestion?.includes("username"));
    const formatted = formatError(capturedError, code);
    assert.ok(formatted.includes("Did you mean 'username'?"));
  });

  test("reports unclosed string quote", async () => {
    let capturedError: any;
    try {
      await runPlain('say "Unclosed string\n');
    } catch (err) {
      capturedError = err;
    }

    assert.ok(capturedError instanceof PlainError);
    assert.strictEqual(capturedError.kind, "LexerError");
  });

  test("reports empty list average error", async () => {
    let capturedError: any;
    try {
      await runPlain("set empty to []\nsay average(empty)");
    } catch (err) {
      capturedError = err;
    }

    assert.ok(capturedError instanceof PlainError);
    assert.ok(capturedError.message.includes("empty list"));
  });

  test("reports 1-based indexing out of bounds error", async () => {
    let capturedError: any;
    try {
      await runPlain('set colors to ["red", "blue"]\nsay item 5 of colors');
    } catch (err) {
      capturedError = err;
    }

    assert.ok(capturedError instanceof PlainError);
    assert.ok(capturedError.message.includes("out of range"));
    assert.ok(capturedError.suggestion?.includes("1-based indexing"));
  });
});
