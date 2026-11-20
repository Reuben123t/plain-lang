import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const root = path.resolve(__dirname, "..");
const cli = path.join(root, "src", "cli", "cli.ts");
const tsx = pathToFileURL(require.resolve("tsx")).href;

function run(args: string[], cwd: string, input?: string) {
  const child = spawnSync(process.execPath, ["--import", tsx, cli, ...args], {
    cwd,
    input,
    encoding: "utf8",
    timeout: 20_000,
    windowsHide: true,
    env: { ...process.env, NO_COLOR: "1", CI: "1" }
  });
  assert.equal(child.error, undefined, child.error?.message);
  return child;
}

function temporary(t: { after: (fn: () => void) => void }): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plain-cli-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

test("CLI init creates a non-destructive runnable starter and assertions", (t) => {
  const dir = temporary(t);
  const created = run(["init", "project"], dir);
  assert.equal(created.status, 0, created.stderr);
  const project = path.join(dir, "project");
  assert.ok(fs.existsSync(path.join(project, "main.plain")));
  const testFiles = fs.readdirSync(path.join(project, "tests")).filter((name) => name.endsWith(".plain"));
  assert.ok(testFiles.length > 0);
  assert.match(fs.readFileSync(path.join(project, "tests", testFiles[0]), "utf8"), /assert_equal\(/);
  assert.equal(run(["test"], project).status, 0);
  assert.equal(run(["run", "main.plain"], project).status, 0);
  fs.writeFileSync(path.join(project, "main.plain"), 'say "keep me"\n');
  const second = run(["init", "project"], dir);
  assert.equal(second.status, 0, second.stderr);
  assert.equal(fs.readFileSync(path.join(project, "main.plain"), "utf8"), 'say "keep me"\n');
});

test("CLI check JSON is structured, non-executing and returns failure statuses", (t) => {
  const dir = temporary(t);
  fs.writeFileSync(path.join(dir, "helper.plain"), 'write_file("marker.txt", "bad")\n');
  fs.writeFileSync(path.join(dir, "valid.plain"), 'import "helper.plain" as helper\nSet label = Main\nsay missing\n');
  const good = run(["check", "--json", "valid.plain"], dir);
  assert.equal(good.status, 0, good.stderr);
  assert.deepEqual(JSON.parse(good.stdout).diagnostics, []);
  assert.equal(JSON.parse(good.stdout).ok, true);
  assert.equal(fs.existsSync(path.join(dir, "marker.txt")), false);
  fs.writeFileSync(path.join(dir, "bad.plain"), 'say 1\nset value to\n');
  const bad = run(["check", "bad.plain", "--json"], dir);
  assert.equal(bad.status, 1);
  const report = JSON.parse(bad.stdout);
  assert.equal(report.ok, false);
  assert.equal(report.diagnostics[0].range.start.line, 1);
  assert.equal(report.diagnostics[0].code, "ParserError");
  const missing = run(["check", "--json", "missing.plain"], dir);
  assert.equal(missing.status, 1);
  assert.equal(JSON.parse(missing.stdout).ok, false);
  assert.equal(run(["check"], dir).status, 1);
});

test("CLI fmt check is non-writing, formatting is stable and directories are deterministic", (t) => {
  const dir = temporary(t);
  const original = 'if true:\r\nsay "hello" # keep\r\nend\r\n';
  fs.writeFileSync(path.join(dir, "main.plain"), original);
  const check = run(["fmt", "--check", "main.plain"], dir);
  assert.equal(check.status, 1);
  assert.equal(fs.readFileSync(path.join(dir, "main.plain"), "utf8"), original);
  const format = run(["fmt", "main.plain"], dir);
  assert.equal(format.status, 0, format.stderr);
  const formatted = fs.readFileSync(path.join(dir, "main.plain"), "utf8");
  assert.equal(formatted, 'if true:\r\n    say "hello" # keep\r\nend\r\n');
  assert.equal(run(["fmt", "--check"], dir).status, 0);
  assert.equal(run(["fmt", "missing.plain"], dir).status, 1);
});

test("CLI test discovers deterministic file names, uses fresh runtimes and reports failures", (t) => {
  const dir = temporary(t);
  fs.mkdirSync(path.join(dir, "tests", "nested"), { recursive: true });
  fs.writeFileSync(path.join(dir, "tests", "test_a.plain"), 'hidden = 42\nassert_equal(2 + 2, 4)\n');
  fs.writeFileSync(path.join(dir, "tests", "nested", "b.test.plain"), 'copy = hidden\nassert_equal(copy, "hidden")\n');
  fs.writeFileSync(path.join(dir, "tests", "ignore.plain"), 'assert(false)\n');
  const passing = run(["test"], dir);
  assert.equal(passing.status, 0, passing.stderr + passing.stdout);
  assert.match(passing.stdout, /2 passed/);
  assert.ok(passing.stdout.indexOf("nested") < passing.stdout.indexOf("test_a"));
  fs.writeFileSync(path.join(dir, "tests", "test_failure.plain"), 'assert_equal(1, 2)\n');
  const failing = run(["test"], dir);
  assert.equal(failing.status, 1);
  assert.match(failing.stdout + failing.stderr, /1 failed/);
  assert.match(failing.stdout + failing.stderr, /test_failure/);
  assert.equal(run(["test", "missing"], dir).status, 1);
});

test("CLI eval and script arguments work, runtime errors fail", (t) => {
  const dir = temporary(t);
  const evaluated = run(["eval", 'say "evaluated"'], dir);
  assert.equal(evaluated.status, 0, evaluated.stderr);
  assert.equal(evaluated.stdout.trim(), "evaluated");
  const expression = run(["eval", "2 + 3"], dir);
  assert.equal(expression.status, 0, expression.stderr);
  assert.equal(expression.stdout.trim(), "5");
  fs.writeFileSync(path.join(dir, "args.plain"), 'say args()\n');
  const argumentsResult = run(["run", "args.plain", "--", "hello world", "--flag"], dir);
  assert.equal(argumentsResult.status, 0, argumentsResult.stderr);
  assert.match(argumentsResult.stdout, /hello world/);
  assert.match(argumentsResult.stdout, /--flag/);
  assert.equal(run(["eval", "say 1 / 0"], dir).status, 1);
  assert.equal(run(["run"], dir).status, 1);
  assert.equal(run(["eval"], dir).status, 1);
  assert.equal(run(["run", "args.plain", "unexpected"], dir).status, 1);
});

test("CLI hashes original binary bytes", (t) => {
  const dir = temporary(t);
  const bytes = Buffer.from([0, 1, 127, 128, 200, 254, 255, 13, 10]);
  fs.writeFileSync(path.join(dir, "binary.dat"), bytes);
  const result = run(["hash", "binary.dat"], dir);
  assert.equal(result.status, 0, result.stderr);
  for (const algorithm of ["md5", "sha1", "sha256"]) {
    assert.ok(result.stdout.includes(createHash(algorithm).update(bytes).digest("hex")));
  }
});

test("CLI validates ports and unknown arguments before any server or scan work", (t) => {
  const dir = temporary(t);
  for (const args of [
    ["playground", "123abc"], ["deploy", "65536"], ["playground", "0"],
    ["ide", "--port", "bad"], ["scan", "127.0.0.1", "70000"],
    ["scan", "127.0.0.1", "22,nope"], ["--not-an-option"],
    ["fmt", "--unknown"], ["test", "--unknown"], ["version", "extra"]
  ]) {
    const result = run(args, dir);
    assert.equal(result.status, 1, args.join(" ") + "\n" + result.stdout + result.stderr);
  }
});

test("CLI help describes actual commands and does not load an updater on startup", (t) => {
  const dir = temporary(t);
  const result = run(["help"], dir);
  assert.equal(result.status, 0, result.stderr);
  for (const command of ["init", "fmt", "test", "eval", "--json", "--check"]) {
    assert.ok(result.stdout.includes(command));
  }
  assert.ok(!fs.readFileSync(cli, "utf8").includes("promptUpdateIfAvailable"));
});

test("REPL serializes piped asynchronous statements and drains work before exit", (t) => {
  const dir = temporary(t);
  const result = run(["repl"], dir, 'wait 0.02\nvalue = 1\nvalue += 2\nsay value\nexit\n');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /(?:^|\n)3(?:\r?\n|$)/);
  assert.ok(!result.stderr.includes("NameError"));
});

test("REPL multiline handling is lexer aware and preserves its environment", (t) => {
  const dir = temporary(t);
  const input = [
    'def answer(value): # end in comment',
    'say "end"',
    'return value',
    'end # real close',
    'items = [',
    '40,',
    '2',
    ']',
    'say answer(sum(items))',
    'quit',
    ''
  ].join("\n");
  const result = run(["repl"], dir, input);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /(?:^|\n)42(?:\r?\n|$)/);
  assert.equal(result.stderr, "");
});

test("REPL handles EOF with incomplete input and errors without forced process exits", (t) => {
  const dir = temporary(t);
  const incomplete = run(["repl"], dir, 'def unfinished(value):\n');
  assert.equal(incomplete.status, 1);
  assert.match(incomplete.stderr, /end|incomplete/i);
  const recovered = run(["repl"], dir, 'say 1 / 0\nsay "still here"\nexit\n');
  assert.match(recovered.stdout, /still here/);
  assert.equal(recovered.status, 1);
});
