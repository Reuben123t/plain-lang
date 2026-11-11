import { test, describe } from "node:test";
import assert from "node:assert";
import { runPlain } from "../src/index";

describe("Interpreter", () => {
  test("runs hello world and say statement", async () => {
    const outputs: string[] = [];
    await runPlain('say "Hello, world!"', {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["Hello, world!"]);
  });

  test("runs variables and arithmetic with english operators", async () => {
    const outputs: string[] = [];
    const code = `
set first to 12
set second to 8
set answer to first plus second
say answer
say 20 minus 5
say 4 times 5
say 20 divided by 4
say 17 remainder of 5
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["20", "15", "20", "5", "2"]);
  });

  test("runs if / otherwise branches", async () => {
    const outputs: string[] = [];
    const code = `
set age to 15
if age is at least 18 then
    say "Adult"
otherwise
    say "Minor"
end

set score to 95
if score is greater than 90 then
    say "Grade A"
otherwise if score is greater than 80 then
    say "Grade B"
otherwise
    say "Grade C"
end
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["Minor", "Grade A"]);
  });

  test("runs repeat N times", async () => {
    const outputs: string[] = [];
    const code = `
repeat 3 times
    say "Loop"
end
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["Loop", "Loop", "Loop"]);
  });

  test("runs repeat while", async () => {
    const outputs: string[] = [];
    const code = `
set lives to 3
repeat while lives is greater than 0
    say lives
    set lives to lives minus 1
end
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["3", "2", "1"]);
  });

  test("runs for each loop over list", async () => {
    const outputs: string[] = [];
    const code = `
set scores to [80, 95, 72]
for each s in scores
    say s
end
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["80", "95", "72"]);
  });

  test("runs user-defined functions", async () => {
    const outputs: string[] = [];
    const code = `
to greet person
    say "Hello " plus person
end

greet "Alex"

to double number
    give back number times 2
end

say double 12

to add first and second
    give back first plus second
end

set result to add 4 and 6
say result
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["Hello Alex", "24", "10"]);
  });

  test("handles list operations: item N of, add, remove, average, highest", async () => {
    const outputs: string[] = [];
    const code = `
set scores to [80, 90, 70, 100]
say item 2 of scores
say average(scores)
say highest(scores)
say lowest(scores)
say count(scores)

add 110 to scores
say highest(scores)

remove 80 from scores
say count(scores)
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["90", "85", "100", "70", "4", "110", "4"]);
  });

  test("handles text functions", async () => {
    const outputs: string[] = [];
    const code = `
say uppercase("hello")
say lowercase("WORLD")
say length("plain")
say replace("cat", "c", "b")
say trim("  hello  ")
say contains("hello", "ell")
say starts_with("plain", "pl")
say ends_with("plain", "in")
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, [
      "HELLO",
      "world",
      "5",
      "bat",
      "hello",
      "true",
      "true",
      "true"
    ]);
  });

  test("handles math functions", async () => {
    const outputs: string[] = [];
    const code = `
say round(4.6)
say floor(4.9)
say ceiling(4.1)
say absolute(-8)
say minimum(3, 8, 2)
say maximum(3, 8, 2)
say to_number("42") plus 8
`;
    await runPlain(code, {
      onSay: (s) => outputs.push(s)
    });
    assert.deepStrictEqual(outputs, ["5", "4", "5", "8", "2", "8", "50"]);
  });
});

