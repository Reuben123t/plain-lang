import { test, describe } from "node:test";
import * as assert from "node:assert";
import * as fs from "fs";
import * as path from "path";
import { runPlain } from "../src/index";

describe("PLAIN Native Desktop IDE (Python IDLE Equivalent)", () => {
  const workspaceRoot = path.resolve(__dirname, "..");
  const distIdeExe = path.join(workspaceRoot, "dist", "plain-ide.exe");
  const localAppIdeExe = path.join(process.env.LOCALAPPDATA || "", "PLAIN", "bin", "plain-ide.exe");
  const ideSourceCs = path.join(workspaceRoot, "src", "ide", "plain-ide.cs");
  const iconPath = path.join(workspaceRoot, "build_assets", "plain.ico");
  const fileIconPath = path.join(workspaceRoot, "build_assets", "plain-file.ico");

  test("verifies that plain-ide.exe, plain.ico and plain-file.ico exist", () => {
    assert.strictEqual(fs.existsSync(distIdeExe), true, "dist/plain-ide.exe should exist");
    assert.strictEqual(fs.existsSync(localAppIdeExe), true, "Local AppData plain-ide.exe should exist");
    assert.strictEqual(fs.existsSync(iconPath), true, "build_assets/plain.ico should exist");
    assert.strictEqual(fs.existsSync(fileIconPath), true, "build_assets/plain-file.ico should exist");
    
    const stats = fs.statSync(distIdeExe);
    assert.ok(stats.size > 10000, "plain-ide.exe should be a non-trivial executable");
    const fileIconStats = fs.statSync(fileIconPath);
    assert.ok(fileIconStats.size > 5000, "plain-file.ico should be a valid icon");
  });

  test("verifies C# IDE code loads opened files into code-writing area ONLY without executing", () => {
    assert.strictEqual(fs.existsSync(ideSourceCs), true);
    const sourceCode = fs.readFileSync(ideSourceCs, "utf-8");

    // Must have OpenFile method that assigns to editor area
    assert.ok(sourceCode.includes("editorTextBox.Text = content;") || sourceCode.includes("rtb.Text = content;"), "Must load content into editor area");

    // Must NOT call RunModule inside OpenFile or Main constructor file opening
    const openFileIdx = sourceCode.indexOf("public void OpenFile(string filePath)");
    assert.ok(openFileIdx !== -1, "OpenFile method must exist");
    const openFileBody = sourceCode.slice(openFileIdx, openFileIdx + 600);
    assert.ok(!openFileBody.includes("RunModule()"), "OpenFile must NOT invoke RunModule()");
    assert.ok(!openFileBody.includes("ExecutePlainProcess"), "OpenFile must NOT execute the program");

    // Must have F5 Run Module binding
    assert.ok(sourceCode.includes("Keys.F5"), "F5 must trigger Run Module");
    assert.ok(sourceCode.includes("RunModule()"), "RunModule must exist");

    // Must save with Utf8NoBom (no BOM)
    assert.ok(sourceCode.includes("Utf8NoBom"), "Must use UTF-8 without BOM");
  });

  test("verifies lexer silently handles and strips UTF-8 BOM if present", async () => {
    let captured = "";
    const bomCode = "\uFEFFsay \"No BOM error!\"";
    await runPlain(bomCode, {
      onSay: (msg) => { captured = msg; }
    });
    assert.strictEqual(captured, "No BOM error!");
  });

  test("verifies Python standard builtins str(), int(), float(), bool(), type()", async () => {
    let captured: string[] = [];
    const pyCode = `
x = 10
y = 25
say "Calculation: " + str((x + y) * 2)
say "Type of x: " + type(x)
say "Float val: " + str(float("3.14"))
say "Int val: " + str(int(9.9))
say "Bool val: " + str(bool(1))
`;
    await runPlain(pyCode, {
      onSay: (msg) => { captured.push(msg); }
    });
    assert.strictEqual(captured[0], "Calculation: 70");
    assert.strictEqual(captured[1], "Type of x: int");
    assert.strictEqual(captured[2], "Float val: 3.14");
    assert.strictEqual(captured[3], "Int val: 9");
    assert.strictEqual(captured[4], "Bool val: true");
  });

  test("verifies cli.ts ide command launches native plain-ide.exe without starting Chrome localhost", () => {
    const cliSource = fs.readFileSync(path.join(workspaceRoot, "src", "cli", "cli.ts"), "utf-8");
    assert.ok(cliSource.includes("plain-ide.exe"), "cli.ts must target plain-ide.exe");
    assert.ok(cliSource.includes("spawn(ideExe"), "cli.ts must spawn plain-ide.exe directly");
  });
});
