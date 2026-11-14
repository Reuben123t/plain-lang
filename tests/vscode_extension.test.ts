import { describe, test } from "node:test";
import assert from "node:assert";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

describe("PLAIN VS Code Extension Package (.vsix)", () => {
  const root = path.resolve(__dirname, "..");
  const vscodeDir = path.join(root, "editors", "vscode");
  const vsixFile = path.join(vscodeDir, "plain-language-support-1.3.0.vsix");
  const distVsix = path.join(root, "dist", "plain-language-support-1.3.0.vsix");

  test("verifies .vsix package files exist and have non-trivial size", () => {
    assert.strictEqual(fs.existsSync(vsixFile), true, "VSIX file must exist in editors/vscode");
    assert.strictEqual(fs.existsSync(distVsix), true, "VSIX file must exist in dist/");
    const stats = fs.statSync(vsixFile);
    assert.ok(stats.size > 20000, `VSIX package size (${stats.size}) should be > 20KB`);
  });

  test("verifies package.json contributes languages, grammars, snippets and commands", () => {
    const pkgPath = path.join(vscodeDir, "package.json");
    assert.strictEqual(fs.existsSync(pkgPath), true);
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    assert.strictEqual(pkg.name, "plain-language-support");
    assert.strictEqual(pkg.version, "1.3.0");
    assert.ok(pkg.contributes.languages.some((l: any) => l.id === "plain" && l.extensions.includes(".plain")));
    assert.ok(pkg.contributes.grammars.some((g: any) => g.language === "plain"));
    assert.ok(pkg.contributes.snippets.some((s: any) => s.language === "plain"));
    assert.ok(pkg.contributes.commands.some((c: any) => c.command === "plain.runFile"));
    assert.ok(pkg.contributes.commands.some((c: any) => c.command === "plain.runCyberScan"));
    assert.ok(pkg.contributes.commands.some((c: any) => c.command === "plain.openInIde"));
  });

  test("verifies syntax grammar highlights Set ABC, cybersecurity, AI and standard operators", () => {
    const tmLangPath = path.join(vscodeDir, "syntaxes", "plain.tmLanguage.json");
    assert.strictEqual(fs.existsSync(tmLangPath), true);
    const grammar = JSON.parse(fs.readFileSync(tmLangPath, "utf-8"));

    const repo = grammar.repository;
    assert.ok(repo.set_abc_statement, "Must have set_abc_statement repository");
    assert.ok(repo.cyber_functions, "Must have cyber_functions repository");
    assert.ok(repo.ai_functions, "Must have ai_functions repository");
    assert.ok(repo.operators, "Must have operators repository");
  });

  test("verifies snippets contain starter template, cybersecurity, and neural network", () => {
    const snippetsPath = path.join(vscodeDir, "snippets", "plain.json");
    assert.strictEqual(fs.existsSync(snippetsPath), true);
    const snippets = JSON.parse(fs.readFileSync(snippetsPath, "utf-8"));

    assert.ok(snippets["PLAIN Starter Template"]);
    assert.ok(snippets["Cybersecurity Port Scanner"]);
    assert.ok(snippets["AI Neural Network Training"]);
    assert.ok(snippets["Web Server Deployment"]);
  });

  test("verifies compiled extension bundle exists", () => {
    const bundlePath = path.join(vscodeDir, "dist", "extension.js");
    assert.strictEqual(fs.existsSync(bundlePath), true);
    const content = fs.readFileSync(bundlePath, "utf-8");
    assert.ok(content.includes("plain.runFile"));
    assert.ok(content.includes("PlainCompletionProvider"));
    assert.ok(content.includes("PlainHoverProvider"));
  });

  test("verifies extension is installed in user's VS Code extensions directory", () => {
    const userExtDir = path.join(os.homedir(), ".vscode", "extensions", "plain-lang.plain-language-support-1.3.0");
    assert.strictEqual(fs.existsSync(userExtDir), true, "Extension must be installed in .vscode/extensions");
  });
});
