import { test, describe } from "node:test";
import assert from "node:assert";
import { Lexer } from "../src/lexer/lexer";
import { Parser } from "../src/parser/parser";

function parse(input: string) {
  const lexer = new Lexer(input);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens, input);
  return parser.parse();
}

describe("Parser", () => {
  test("parses hello world and variables", () => {
    const input = `say "Hello, world!"\nset name to "Alex"\nset age to 15`;
    const program = parse(input);

    assert.strictEqual(program.body.length, 3);
    assert.strictEqual(program.body[0].type, "SayStatement");
    assert.strictEqual(program.body[1].type, "SetStatement");
    assert.strictEqual((program.body[1] as any).name, "name");
  });

  test("parses if condition with otherwise and end", () => {
    const input = `
if age is at least 13 then
    say "You can use this feature."
otherwise
    say "This feature is not available."
end
`;
    const program = parse(input);
    assert.strictEqual(program.body.length, 1);
    const ifStmt = program.body[0] as any;
    assert.strictEqual(ifStmt.type, "IfStatement");
    assert.strictEqual(ifStmt.condition.type, "BinaryExpression");
    assert.strictEqual(ifStmt.condition.operator, ">=");
    assert.strictEqual(ifStmt.consequent.length, 1);
    assert.strictEqual(ifStmt.alternate.length, 1);
  });

  test("parses repeat loops", () => {
    const input = `
repeat 3 times
    say "Fun!"
end

repeat while lives is greater than 0
    say lives
end
`;
    const program = parse(input);
    assert.strictEqual(program.body.length, 2);
    assert.strictEqual(program.body[0].type, "RepeatTimesStatement");
    assert.strictEqual(program.body[1].type, "RepeatWhileStatement");
  });

  test("parses for each loop", () => {
    const input = `
for each score in scores
    say score
end
`;
    const program = parse(input);
    assert.strictEqual(program.body.length, 1);
    const loop = program.body[0] as any;
    assert.strictEqual(loop.type, "ForEachStatement");
    assert.strictEqual(loop.itemVariable, "score");
  });

  test("parses function definition and calls", () => {
    const input = `
to add first and second
    give back first plus second
end

set result to add 4 and 6
say result
`;
    const program = parse(input);
    assert.strictEqual(program.body.length, 3);
    const fnDef = program.body[0] as any;
    assert.strictEqual(fnDef.type, "FunctionDefStatement");
    assert.strictEqual(fnDef.name, "add");
    assert.deepStrictEqual(fnDef.parameters, ["first", "second"]);
  });

  test("parses list indexing and list add/remove", () => {
    const input = `
set colors to ["red", "green", "blue"]
say item 2 of colors
add "yellow" to colors
remove "green" from colors
`;
    const program = parse(input);
    assert.strictEqual(program.body.length, 4);
    assert.strictEqual(program.body[1].type, "SayStatement");
    const sayExpr = (program.body[1] as any).value;
    assert.strictEqual(sayExpr.type, "ItemOfExpression");
    assert.strictEqual(program.body[2].type, "ListAddStatement");
    assert.strictEqual(program.body[3].type, "ListRemoveStatement");
  });
});

