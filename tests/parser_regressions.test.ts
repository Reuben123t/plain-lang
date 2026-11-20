import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { Lexer } from "../src/lexer/lexer";
import { Parser } from "../src/parser/parser";

function parse(source: string) {
  return new Parser(new Lexer(source, "regression.plain").tokenize(), source, "regression.plain").parse();
}

describe("Parser regressions", () => {
  test("break and continue are rejected outside loops", () => {
    for (const source of ["break", "continue", "if true\n break\nend"]) {
      assert.throws(() => parse(source), (error: any) => error.kind === "ParserError" && /loop/i.test(error.message));
    }
  });

  test("loop control cannot cross a nested function boundary", () => {
    for (const keyword of ["break", "continue"]) {
      assert.throws(() => parse(`repeat 1 times\n def escape()\n  ${keyword}\n end\nend`), (error: any) => error.kind === "ParserError" && /loop/i.test(error.message));
    }
  });

  test("loops inside a function can use loop control", () => {
    const program = parse("def task()\n while true\n  continue\n  break\n end\nend");
    const definition = program.body[0] as any;
    assert.equal(definition.body[0].body[0].type, "ContinueStatement");
    assert.equal(definition.body[0].body[1].type, "BreakStatement");
  });

  test("general assignment retains its target expression", () => {
    const program = parse("record.values[0] **= 2");
    const statement = program.body[0] as any;
    assert.equal(statement.type, "AssignmentStatement");
    assert.equal(statement.operator, "**=");
    assert.equal(statement.target.type, "IndexExpression");
    assert.equal(statement.target.object.type, "MemberAccessExpression");
  });

  test("invalid assignment targets are diagnosed", () => {
    assert.throws(() => parse("(1 + 2) = 3"), (error: any) => error.kind === "ParserError" && /assign|target/i.test(error.message));
  });
});
