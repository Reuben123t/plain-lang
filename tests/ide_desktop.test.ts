import { test, describe } from "node:test";
import * as assert from "node:assert";
import * as fs from "fs";
import * as path from "path";

describe("PLAIN Native Desktop IDE (Python IDLE Equivalent)", () => {
  const workspaceRoot = path.resolve(__dirname, "..");
  const distIdeExe = path.join(workspaceRoot, "dist", "plain-ide.exe");
  const localAppIdeExe = path.join(process.env.LOCALAPPDATA || "", "PLAIN", "bin", "plain-ide.exe");
  const ideSourceCs = path.join(workspaceRoot, "src", "ide", "plain-ide.cs");

  test("verifies that plain-ide.exe binary is compiled and exists", () => {
    assert.strictEqual(fs.existsSync(distIdeExe), true, "dist/plain-ide.exe should exist");
    assert.strictEqual(fs.existsSync(localAppIdeExe), true, "Local AppData plain-ide.exe should exist");
    
    const stats = fs.statSync(distIdeExe);
    assert.ok(stats.size > 10000, "plain-ide.exe should be a non-trivial executable");
  });

  test("verifies C# IDE code loads opened files into code-writing area ONLY without executing", () => {
    assert.strictEqual(fs.existsSync(ideSourceCs), true);
    const sourceCode = fs.readFileSync(ideSourceCs, "utf-8");

    // Must have OpenFile method that assigns to editorTextBox.Text
    assert.ok(sourceCode.includes("editorTextBox.Text = content;"), "Must load content into editorTextBox.Text");

    // Must NOT call RunModule inside OpenFile or Main constructor file opening
    const openFileIdx = sourceCode.indexOf("public void OpenFile(string filePath)");
    assert.ok(openFileIdx !== -1, "OpenFile method must exist");
    const openFileBody = sourceCode.slice(openFileIdx, openFileIdx + 600);
    assert.ok(!openFileBody.includes("RunModule()"), "OpenFile must NOT invoke RunModule()");
    assert.ok(!openFileBody.includes("ExecutePlainProcess"), "OpenFile must NOT execute the program");

    // Must have F5 Run Module binding
    assert.ok(sourceCode.includes("Keys.F5"), "F5 must trigger Run Module");
    assert.ok(sourceCode.includes("RunModule()"), "RunModule must exist");

    // Must display Author: Reuben
    assert.ok(sourceCode.includes("Author: Reuben"), "Must attribute Author: Reuben");
  });

  test("verifies cli.ts ide command launches native plain-ide.exe without starting Chrome localhost", () => {
    const cliSource = fs.readFileSync(path.join(workspaceRoot, "src", "cli", "cli.ts"), "utf-8");
    assert.ok(cliSource.includes("plain-ide.exe"), "cli.ts must target plain-ide.exe");
    assert.ok(cliSource.includes("spawn(ideExe"), "cli.ts must spawn plain-ide.exe directly");
  });
});
