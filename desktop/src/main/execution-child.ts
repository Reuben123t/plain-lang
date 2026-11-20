import { runPlain } from "../../../src/index";
import { formatError } from "../../../src/errors/formatter";
import { PlainError } from "../../../src/errors/plain-error";
import type { ChildJob, ChildMessage } from "./execution-protocol";
import { LIMITS, record, text, validateRun } from "./validation";

// This entry is only launched by the native host, with Electron acting as Node.
// It is process isolation and resource limiting, not an OS security sandbox.
if (!process.send) throw new Error("The execution child requires an IPC parent.");
let job: ChildJob | undefined;
let started = false;
let done = false;
let outputBytes = 0;
let nextInput = 0;
let pending: { id: number; resolve: (value: string) => void } | undefined;
let bufferedOutput = "";
let scheduled: NodeJS.Immediate | undefined;

function post(event: ChildMessage): void {
  if (process.connected) process.send!(event, (error) => { if (error) process.exitCode = 1; });
}
function flush(): void {
  if (scheduled) { clearImmediate(scheduled); scheduled = undefined; }
  if (bufferedOutput) { post({ type: "output", text: bufferedOutput }); bufferedOutput = ""; }
}
function output(value: string): void {
  if (!job || done) return;
  const line = `${value}\n`;
  outputBytes += Buffer.byteLength(line);
  if (outputBytes > job.maxOutputBytes) throw new PlainError(`Output limit reached (${job.maxOutputBytes} bytes).`, { line: 1, column: 1 }, { kind: "RuntimeError" });
  bufferedOutput += line;
  if (Buffer.byteLength(bufferedOutput) >= 16 * 1024) flush();
  else scheduled ??= setImmediate(flush);
}
function ask(prompt: string): Promise<string> {
  if (!job || pending || done || ++nextInput > 10_000) throw new Error("Input request limit reached.");
  flush();
  const bounded = Buffer.from(prompt).subarray(0, Math.max(0, job.maxInputBytes - 4)).toString("utf8");
  return new Promise((resolve) => { pending = { id: nextInput, resolve }; post({ type: "input", id: nextInput, prompt: bounded }); });
}
function bounded(value: string, bytes: number): string { return Buffer.from(value).subarray(0, bytes - 4).toString("utf8"); }
async function execute(current: ChildJob): Promise<void> {
  try {
    await runPlain(current.code, {
      filename: current.filename, baseDir: current.baseDir, args: current.args,
      onSay: output, onShow: output, onAsk: ask,
      onClear: () => { flush(); post({ type: "clear" }); }
    });
    flush(); done = true; post({ type: "done" });
  } catch (error) {
    flush(); done = true;
    post({ type: "done", error: {
      kind: error instanceof PlainError ? error.kind : "RuntimeError",
      message: bounded(error instanceof Error ? error.message : String(error), 4096),
      formatted: bounded(formatError(error, current.code), 16_384),
      ...(error instanceof PlainError ? { location: error.location } : {})
    } });
  }
  // Do NOT exit on completion. Parent must kill this still-live root and its descendants.
}
process.on("message", (value: unknown) => {
  try {
    const message = record(value);
    if (message.type === "start" && !started) {
      started = true;
      const source = record(message.job);
      const request = validateRun(source);
      const baseDir = text(source.baseDir, "Execution directory", LIMITS.path, false);
      if (source.maxOutputBytes !== LIMITS.outputBytes || source.maxInputBytes !== LIMITS.inputBytes) throw new Error("Invalid execution limits.");
      job = { code: request.code, args: request.args, filename: request.filename ?? "Untitled.plain", baseDir, maxOutputBytes: LIMITS.outputBytes, maxInputBytes: LIMITS.inputBytes };
      void execute(job);
    } else if (message.type === "input" && pending && message.id === pending.id) {
      const answer = text(message.value, "Input", job!.maxInputBytes);
      const resolve = pending.resolve; pending = undefined; resolve(answer);
    }
  } catch (error) {
    done = true;
    const message = error instanceof Error ? error.message : String(error);
    post({ type: "done", error: { kind: "RuntimeError", message, formatted: message } });
  }
});
// RSS catches buffers/native allocations as well as V8's explicit 128 MiB heap cap.
setInterval(() => {
  if (!done && process.memoryUsage().rss > 256 * 1024 * 1024) {
    done = true;
    post({ type: "done", error: { kind: "RuntimeError", message: "Execution memory limit reached.", formatted: "Execution memory limit reached (256 MiB)." } });
  }
}, 100).unref();
// Keep the root available to taskkill even if trusted code leaves no handles.
setInterval(() => undefined, 60_000);
process.on("disconnect", () => process.exit(1));
