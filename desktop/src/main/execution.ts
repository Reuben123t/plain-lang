import * as path from "node:path";
import { fork, spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { RunSnapshot } from "../shared/contracts";
import type { ChildJob, ParentMessage } from "./execution-protocol";
import { HostError, LIMITS, record, text } from "./validation";

export interface ExecutionOptions extends ChildJob {
  timeoutMs: number;
  childFile: string;
  executable?: string;
  execArgv?: string[];
}
function problem(message: string): NonNullable<RunSnapshot["error"]> { return { kind: "RuntimeError", message, formatted: message }; }

/** The child stays alive after done so taskkill /T can still identify its descendants. */
export async function killProcessTree(pid: number): Promise<void> {
  if (!Number.isSafeInteger(pid) || pid <= 0 || pid === process.pid) throw new HostError("Invalid child process identifier.");
  if (process.platform === "win32") {
    const executable = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "taskkill.exe");
    await new Promise<void>((resolve, reject) => {
      const killer = spawn(executable, ["/PID", String(pid), "/T", "/F"], { windowsHide: true, shell: false, stdio: "ignore" });
      const timer = setTimeout(() => { killer.kill(); reject(new HostError("Process tree cleanup timed out.")); }, 10_000);
      killer.once("error", (error) => { clearTimeout(timer); reject(error); });
      killer.once("exit", (code) => {
        clearTimeout(timer);
        // 128 means the root already exited; there is no remaining root to kill.
        if (code === 0 || code === 128) resolve();
        else reject(new HostError(`Process tree cleanup failed (${code}).`));
      });
    });
  } else {
    try { process.kill(-pid, "SIGKILL"); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error; }
  }
}

export class NativeExecution {
  readonly id = randomUUID();
  readonly finished: Promise<RunSnapshot>;
  private resolveFinished!: (snapshot: RunSnapshot) => void;
  private readonly startedAt = Date.now();
  private endedAt?: number;
  private status: RunSnapshot["status"] = "running";
  private output = "";
  private outputBytes = 0;
  private inputBytes = 0;
  private input?: RunSnapshot["input"];
  private error?: RunSnapshot["error"];
  private readonly child: ChildProcess;
  private readonly timer: ReturnType<typeof setTimeout>;
  private finishing?: Promise<void>;
  settled = false;
  cleanupFailed = false;

  constructor(private readonly options: ExecutionOptions) {
    this.finished = new Promise((resolve) => { this.resolveFinished = resolve; });
    this.child = fork(options.childFile, [], {
      execPath: options.executable ?? process.execPath,
      execArgv: options.execArgv ?? ["--max-old-space-size=128", "--stack-size=4096"],
      env: { ...process.env, ELECTRON_RUN_AS_NODE: "1", NODE_OPTIONS: "" },
      cwd: options.baseDir, detached: true, windowsHide: true,
      stdio: ["ignore", "pipe", "pipe", "ipc"], serialization: "json"
    });
    this.timer = setTimeout(() => { void this.finish("timeout", problem(`Execution stopped after ${options.timeoutMs} ms.`)); }, options.timeoutMs);
    this.timer.unref();
    this.child.on("message", (message: unknown) => this.onMessage(message));
    this.child.stdout?.on("data", (data: Buffer) => this.append(data.toString("utf8")));
    this.child.stderr?.on("data", (data: Buffer) => this.append(data.toString("utf8")));
    this.child.once("error", (error) => { void this.finish("failed", problem(`Executor error: ${error.message}`)); });
    this.child.once("exit", (code, signal) => {
      if (this.active) void this.finish("failed", problem(`The executor exited unexpectedly (${signal ?? code}).`));
    });
    this.send({ type: "start", job: {
      code: options.code, filename: options.filename, baseDir: options.baseDir, args: options.args,
      maxOutputBytes: options.maxOutputBytes, maxInputBytes: options.maxInputBytes
    } });
  }
  get active(): boolean { return !this.finishing && (this.status === "running" || this.status === "waiting"); }
  snapshot(): RunSnapshot {
    return {
      id: this.id, status: this.status, output: this.output, durationMs: (this.endedAt ?? Date.now()) - this.startedAt,
      ...(this.input ? { input: { ...this.input } } : {}), ...(this.error ? { error: structuredClone(this.error) } : {})
    };
  }
  private send(message: ParentMessage): void {
    if (!this.child.connected) { void this.finish("failed", problem("Executor communication closed.")); return; }
    this.child.send(message, (error) => { if (error && this.active) void this.finish("failed", problem(`Executor communication failed: ${error.message}`)); });
  }
  answer(inputId: number, value: unknown): void {
    if (!this.active || !this.input || inputId !== this.input.id) throw new HostError("This input request is no longer waiting.");
    const answer = text(value, "Program input", this.options.maxInputBytes);
    this.inputBytes += Buffer.byteLength(answer);
    if (this.inputBytes > 1024 * 1024) throw new HostError("The run's total input limit has been reached.");
    this.input = undefined; this.status = "running";
    this.send({ type: "input", id: inputId, value: answer });
  }
  async stop(): Promise<RunSnapshot> { await this.finish("stopped", problem("Execution stopped.")); return this.finished; }
  private append(value: string): void {
    if (!this.active) return;
    this.outputBytes += Buffer.byteLength(value, "utf8");
    if (this.outputBytes > this.options.maxOutputBytes) {
      void this.finish("failed", problem(`Output limit reached (${this.options.maxOutputBytes} bytes).`)); return;
    }
    this.output += value;
  }
  private onMessage(message: unknown): void {
    if (!this.active) return;
    try {
      const event = record(message);
      if (event.type === "output") this.append(text(event.text, "Output", this.options.maxOutputBytes));
      else if (event.type === "clear") this.output = ""; // Lifetime output budget deliberately survives clear.
      else if (event.type === "input") {
        if (this.input || !Number.isSafeInteger(event.id) || Number(event.id) <= 0 || Number(event.id) > 10_000) throw new HostError("Invalid input sequence.");
        this.input = { id: Number(event.id), prompt: text(event.prompt, "Input prompt", this.options.maxInputBytes) };
        this.status = "waiting";
      } else if (event.type === "done") {
        let error: RunSnapshot["error"];
        if (event.error !== undefined) {
          const source = record(event.error);
          error = { message: text(source.message, "Error", 4096), formatted: text(source.formatted, "Formatted error", 16_384), kind: text(source.kind, "Error kind", 128) };
          if (source.location) {
            const location = record(source.location);
            if (Number.isSafeInteger(location.line) && Number(location.line) > 0 && Number.isSafeInteger(location.column) && Number(location.column) > 0) {
              error.location = { line: Number(location.line), column: Number(location.column), ...(typeof location.sourceFile === "string" ? { sourceFile: location.sourceFile.slice(0, LIMITS.path) } : {}) };
            }
          }
        }
        void this.finish(error ? "failed" : "completed", error);
      } else throw new HostError("Unknown executor message.");
    } catch (error) { void this.finish("failed", problem(error instanceof Error ? error.message : "Invalid executor message.")); }
  }
  private finish(status: RunSnapshot["status"], error?: RunSnapshot["error"]): Promise<void> {
    if (this.finishing) return this.finishing;
    this.input = undefined; this.status = "running"; clearTimeout(this.timer);
    // Publish terminal status only after the complete process tree has been cleaned up.
    this.finishing = (async () => {
      let finalStatus = status;
      let finalError = error;
      try { if (this.child.pid) await killProcessTree(this.child.pid); }
      catch (error) {
        this.cleanupFailed = true; finalStatus = "failed";
        finalError = problem(`Process cleanup failed: ${error instanceof Error ? error.message : String(error)}. Close Plain before running another program.`);
        this.child.kill("SIGKILL");
      } finally {
        if (this.child.connected) this.child.disconnect();
        this.child.stdout?.destroy(); this.child.stderr?.destroy();
        this.status = finalStatus; this.error = finalError; this.endedAt = Date.now();
        this.settled = true; this.resolveFinished(this.snapshot());
      }
    })();
    return this.finishing;
  }
}

export class ExecutionHost {
  private readonly runs = new Map<string, NativeExecution>();
  private closing = false;
  start(options: ExecutionOptions): NativeExecution {
    if (this.closing) throw new HostError("The application is closing.");
    if ([...this.runs.values()].some((run) => !run.settled || run.cleanupFailed)) throw new HostError("A program is already running or its process tree could not be cleaned up.");
    while (this.runs.size >= 8) this.runs.delete(this.runs.keys().next().value!);
    const run = new NativeExecution(options); this.runs.set(run.id, run); return run;
  }
  get(value: unknown): NativeExecution {
    const id = text(value, "Run id", 128, false);
    const run = this.runs.get(id);
    if (!run) throw new HostError("This run is no longer retained.");
    return run;
  }
  async close(): Promise<void> {
    this.closing = true;
    await Promise.all([...this.runs.values()].map((run) => run.stop()));
  }
}
