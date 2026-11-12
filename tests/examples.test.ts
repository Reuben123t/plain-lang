import { test, describe } from "node:test";
import assert from "node:assert";
import * as fs from "fs";
import * as path from "path";
import { runPlain } from "../src/index";

describe("Example programs suite", () => {
  const examplesDir = path.join(__dirname, "..", "examples");

  test("runs 01_hello.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "01_hello.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.deepStrictEqual(outputs, ["Hello, world!"]);
  });

  test("runs 02_calculator.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "02_calculator.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.deepStrictEqual(outputs, ["20"]);
  });

  test("runs 03_age_check.plain with adult input", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "03_age_check.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, {
      onSay: (s) => outputs.push(s),
      onAsk: async () => "20"
    });
    assert.deepStrictEqual(outputs, ["You are an adult."]);
  });

  test("runs 03_age_check.plain with minor input", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "03_age_check.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, {
      onSay: (s) => outputs.push(s),
      onAsk: async () => "15"
    });
    assert.deepStrictEqual(outputs, ["You are under 18."]);
  });

  test("runs 04_custom_function.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "04_custom_function.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.deepStrictEqual(outputs, ["24"]);
  });

  test("runs 05_list_average.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "05_list_average.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.deepStrictEqual(outputs, ["85"]);
  });

  test("runs 06_guessing_game.plain with correct guess", async () => {
    const code = `
set secret to 7
set lives to 3
set won to false

repeat while lives is greater than 0
    ask "Guess:" and save as guess_text
    set guess to to number(guess_text)

    if guess is equal to secret then
        say "Correct!"
        set won to true
        set lives to 0
    otherwise
        set lives to lives minus 1
    end
end
`;
    const outputs: string[] = [];
    await runPlain(code, {
      onSay: (s) => outputs.push(s),
      onAsk: async () => "7"
    });
    assert.deepStrictEqual(outputs, ["Correct!"]);
  });

  test("runs 07_todo_list.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "07_todo_list.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.ok(outputs.includes("Updated tasks (total: 3):"));
    assert.ok(outputs.includes("- Walk the dog"));
  });

  test("runs 09_student_science.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "09_student_science.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.ok(outputs[0].includes("PLAIN Student Science"));
    assert.ok(outputs[outputs.length - 1].includes("Successfully"));
  });

  test("runs 10_web_server.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "10_web_server.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.ok(outputs[0].includes("Web Development Suite"));
    if (fs.existsSync("student_portal.html")) fs.unlinkSync("student_portal.html");
  });

  test("runs 11_data_science.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "11_data_science.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.ok(outputs[0].includes("Data Science Suite"));
  });

  test("runs 12_machine_learning.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "12_machine_learning.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.ok(outputs[0].includes("Artificial Intelligence & ML Suite"));
  });

  test("runs 13_task_automation.plain", async () => {
    const code = fs.readFileSync(path.join(examplesDir, "13_task_automation.plain"), "utf-8");
    const outputs: string[] = [];
    await runPlain(code, { onSay: (s) => outputs.push(s) });
    assert.ok(outputs[0].includes("Task Automation Suite"));
  });
});

