import { test } from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { build } from "esbuild";
import { ExecutionHost, NativeExecution, type ExecutionOptions } from "../src/main/execution";
import { LIMITS } from "../src/main/validation";
import { DesktopHost } from "../src/main/host";
import { DEFAULT_SETTINGS } from "../src/shared/contracts";

const root = path.resolve(__dirname, "..");
async function setup(t: { after: (callback: () => Promise<void>) => void }): Promise<{ directory: string; childFile: string }> {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "plain-execution-test-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true, maxRetries: 3 }));
  const childFile = path.join(directory, "execution-child.cjs");
  await build({ entryPoints: [path.join(root, "src/main/execution-child.ts")], outfile: childFile, platform: "node", target: "node22", bundle: true, logLevel: "silent" });
  return { directory, childFile };
}
function options(directory: string, childFile: string, code: string, extra: Partial<ExecutionOptions> = {}): ExecutionOptions {
  return { code, filename: "fixture.plain", baseDir: directory, args: [], childFile, timeoutMs: 5000, maxOutputBytes: LIMITS.outputBytes, maxInputBytes: LIMITS.inputBytes, ...extra };
}
async function until(check: () => boolean, timeout = 5000): Promise<void> {
  const started = Date.now();
  while (!check()) {
    if (Date.now() - started > timeout) throw new Error("Condition timed out.");
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
function alive(pid: number): boolean { try { process.kill(pid, 0); return true; } catch { return false; } }

test("bundled child runs Plain callbacks and leaves parent working directory unchanged", async (t) => {
  const { directory, childFile } = await setup(t), cwd = process.cwd();
  const run = new NativeExecution(options(directory, childFile, 'say "hello native"'));
  t.after(async () => { await run.stop(); });
  const result = await run.finished;
  assert.equal(result.status, "completed", result.error?.formatted);
  assert.equal(result.output, "hello native\n");
  assert.equal(run.settled, true);
  assert.equal(process.cwd(), cwd);
});

test("interactive input is id checked, bounded and reflected in polling", async (t) => {
  const { directory, childFile } = await setup(t);
  const run = new NativeExecution(options(directory, childFile, 'ask "Name?" and save as name\nsay name'));
  t.after(async () => { await run.stop(); });
  await until(() => run.snapshot().status === "waiting" || run.settled);
  const waiting = run.snapshot();
  assert.equal(waiting.status, "waiting", waiting.error?.formatted);
  assert.equal(waiting.input?.prompt, "Name?");
  assert.throws(() => run.answer(waiting.input!.id + 1, "wrong"), /no longer waiting/);
  assert.throws(() => run.answer(waiting.input!.id, "x".repeat(LIMITS.inputBytes + 1)), /size limit/);
  run.answer(waiting.input!.id, "Ada");
  const result = await run.finished;
  assert.equal(result.status, "completed", result.error?.formatted);
  assert.equal(result.output, "Ada\n");
  assert.throws(() => run.answer(waiting.input!.id, "again"), /no longer waiting/);
});

test("syntax failures preserve structured runtime location", async (t) => {
  const { directory, childFile } = await setup(t);
  const run = new NativeExecution(options(directory, childFile, "say missing_variable"));
  t.after(async () => { await run.stop(); });
  const result = await run.finished;
  assert.equal(result.status, "failed");
  assert.match(result.error!.message, /missing_variable/);
  assert.equal(result.error!.location?.line, 1);
  assert.ok(result.error!.formatted.length > 0);
});

test("tight loops time out and cannot block parent polling or stopping", async (t) => {
  const { directory, childFile } = await setup(t);
  const run = new NativeExecution(options(directory, childFile, "repeat while true\n  set x to 1\nend", { timeoutMs: 250 }));
  t.after(async () => { await run.stop(); });
  const result = await run.finished;
  assert.equal(result.status, "timeout", result.error?.formatted);
  assert.equal(run.settled, true);
});

test("lifetime output budget applies even when a program clears its output", async (t) => {
  const { directory, childFile } = await setup(t);
  const run = new NativeExecution(options(directory, childFile, `repeat 10000 times\n  say "${"x".repeat(128)}"\nend`));
  t.after(async () => { await run.stop(); });
  const result = await run.finished;
  assert.equal(result.status, "failed");
  assert.match(result.error!.message, /Output limit/);
  assert.ok(Buffer.byteLength(result.output) <= LIMITS.outputBytes);
});

test("execution host allows only one active run and terminal snapshots imply cleanup settled", async (t) => {
  const { directory, childFile } = await setup(t);
  const execution = new ExecutionHost(); t.after(() => execution.close());
  const run = execution.start(options(directory, childFile, 'ask "Wait" and save as answer'));
  assert.throws(() => execution.start(options(directory, childFile, "say 1")), /already running/);
  await until(() => run.snapshot().status === "waiting");
  const stopping = run.stop();
  assert.equal(run.snapshot().status, "running");
  assert.throws(() => execution.start(options(directory, childFile, "say 2")), /already running/);
  const result = await stopping;
  assert.equal(result.status, "stopped");
  assert.equal(run.settled, true);
  const next = execution.start(options(directory, childFile, "say 3"));
  assert.equal((await next.finished).output, "3\n");
});

test("native host uses current timeout settings and trust resets with workspace/session", async (t) => {
  const { directory, childFile } = await setup(t);
  let trusts = 0;
  const service = new DesktopHost({
    userData: directory, version: "test", platform: process.platform, examples: [], childFile,
    dialogs: { openFiles: async () => undefined, openFolder: async () => directory, saveFile: async () => undefined, confirmClose: async () => "cancel", trust: async () => { trusts++; return true; } }
  });
  await service.initialize(); t.after(() => service.close());
  await service.profile.settings({ ...DEFAULT_SETTINGS, timeoutSeconds: 1 });
  const workspace = await service.openFolder();
  const request = { code: 'ask "Wait" and save as answer', workspace, args: [] };
  const started = await service.startRun(request);
  const result = await service.execution.get(started!.id).finished;
  assert.equal(result.status, "timeout");
  assert.match(result.error!.message, /1000 ms/);
  assert.equal(trusts, 1);
  const second = await service.startRun({ ...request, code: "say 1" });
  await service.execution.get(second!.id).finished;
  assert.equal(trusts, 1);
  await service.openFolder();
  const third = await service.startRun({ ...request, code: "say 2" });
  await service.execution.get(third!.id).finished;
  assert.equal(trusts, 2);
});

for (const mode of ["stop", "complete", "timeout"] as const) {
  test(`process fixture ${mode} kills its child and grandchild`, { timeout: 20_000 }, async (t) => {
    const { directory } = await setup(t);
    const fixture = path.join(directory, "tree-fixture.cjs");
    const pidFile = path.join(directory, "descendant.pid");
    const grandchildFile = path.join(directory, "grandchild.pid");
    const descendantSource = `const fs=require('node:fs');const {spawn}=require('node:child_process');fs.writeFileSync(${JSON.stringify(pidFile)},String(process.pid));const child=spawn(process.execPath,['-e',${JSON.stringify(`require('node:fs').writeFileSync(${JSON.stringify(grandchildFile)},String(process.pid));setInterval(()=>{},1000);`)}],{stdio:'ignore',env:{...process.env,ELECTRON_RUN_AS_NODE:'1'}});setInterval(()=>{},1000);`;
    await fs.writeFile(fixture, `const {spawn}=require('node:child_process');process.on('message',message=>{if(message.type!=='start')return;spawn(process.execPath,['-e',${JSON.stringify(descendantSource)}],{stdio:'ignore',env:{...process.env,ELECTRON_RUN_AS_NODE:'1'}});${mode === "complete" ? "setTimeout(()=>process.send({type:'done'}),800);" : ""}});setInterval(()=>{},1000);`);
    const run = new NativeExecution(options(directory, fixture, "", { timeoutMs: mode === "timeout" ? 1500 : 10_000 }));
    t.after(async () => { await run.stop(); });
    let descendant = 0, grandchild = 0;
    const started = Date.now();
    while (!grandchild && Date.now() - started < 5000) {
      descendant = Number(await fs.readFile(pidFile, "utf8").catch(() => "0"));
      grandchild = Number(await fs.readFile(grandchildFile, "utf8").catch(() => "0"));
      if (!grandchild) await new Promise((resolve) => setTimeout(resolve, 20));
    }
    assert.ok(descendant > 0 && grandchild > 0, "fixture descendants started");
    const result = mode === "stop" ? await run.stop() : await run.finished;
    assert.equal(result.status, mode === "complete" ? "completed" : mode === "timeout" ? "timeout" : "stopped", result.error?.formatted);
    await until(() => !alive(descendant) && !alive(grandchild));
    assert.equal(alive(descendant), false); assert.equal(alive(grandchild), false);
  });
}
