import * as path from "node:path";
import { randomBytes } from "node:crypto";
import { Worker } from "node:worker_threads";
import type { ExecutionSnapshot, ExecutionStatus, RuntimeErrorInfo, RuntimeEvent } from "../browser/protocol";
import { HttpError } from "./http";

export interface ExecutionOptions {
  code: string;
  filename: string;
  workspaceDir: string;
  timeoutMs: number;
  maxOutputBytes: number;
  maxInputBytes: number;
  inputs?: string[];
  interactive: boolean;
}

const ACTIVE = new Set<ExecutionStatus>(["running", "waiting"]);

/** Thread isolation keeps a tight interpreter loop from blocking HTTP or Stop. It is not an OS sandbox. */
export class LocalExecution {
  readonly id = randomBytes(16).toString("hex");
  readonly finished: Promise<ExecutionSnapshot>;
  private resolveFinished!: (snapshot: ExecutionSnapshot) => void;
  private readonly startedAt = Date.now();
  private finishedAt?: number;
  private status: ExecutionStatus = "running";
  private output = "";
  private outputBytes = 0;
  private input?: { id: number; prompt: string };
  private error?: RuntimeErrorInfo;
  private worker: Worker;
  private timer: ReturnType<typeof setTimeout>;

  constructor(private readonly options: ExecutionOptions) {
    this.finished = new Promise((resolve) => { this.resolveFinished = resolve; });
    const sourceMode = __filename.endsWith(".ts");
    const file = path.join(__dirname, `execution-worker.${sourceMode ? "ts" : "js"}`);
    const workerOptions = {
      workerData: sourceMode ? { ...options, bootstrap: require.resolve("tsx/cjs"), file } : options,
      execArgv: [],
      resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 32, stackSizeMb: 4 }
    };
    this.worker = sourceMode
      ? new Worker("const { workerData } = require('node:worker_threads'); require(workerData.bootstrap); require(workerData.file);", { ...workerOptions, eval: true, workerData: workerOptions.workerData })
      : new Worker(file, workerOptions);
    this.timer = setTimeout(() => {
      void this.finish("timeout", this.problem(`Execution stopped after ${options.timeoutMs} ms.`, "Try a smaller program or a loop that ends."));
    }, options.timeoutMs);
    this.timer.unref();
    this.worker.on("message", (event: RuntimeEvent) => this.onMessage(event));
    this.worker.on("error", (error) => { void this.finish("failed", this.problem(`Executor error: ${error.message}`)); });
    this.worker.on("exit", (code) => {
      if (this.active) void this.finish("failed", this.problem(`The executor exited before completing (code ${code}).`));
    });
  }

  get active(): boolean { return ACTIVE.has(this.status); }

  snapshot(): ExecutionSnapshot {
    return {
      id: this.id, status: this.status, output: this.output,
      durationMs: (this.finishedAt ?? Date.now()) - this.startedAt,
      ...(this.input ? { input: this.input } : {}),
      ...(this.error ? { error: this.error } : {})
    };
  }

  answer(id: number, value: string): void {
    if (!this.active || !this.input || this.input.id !== id) throw new HttpError(409, "This input request is no longer waiting.");
    if (Buffer.byteLength(value, "utf8") > this.options.maxInputBytes) throw new HttpError(413, "Input is too long.");
    this.input = undefined;
    this.status = "running";
    this.worker.postMessage({ type: "input", id, value });
  }

  async stop(): Promise<ExecutionSnapshot> {
    await this.finish("stopped", this.problem("Execution stopped."));
    return this.finished;
  }

  private problem(message: string, suggestion?: string): RuntimeErrorInfo {
    return { kind: "RuntimeError", message, formatted: suggestion ? `${message}\n${suggestion}` : message };
  }

  private onMessage(event: RuntimeEvent): void {
    if (!this.active || !event || typeof event !== "object") return;
    if (event.type === "output" && typeof event.text === "string") {
      const size = Buffer.byteLength(event.text, "utf8");
      if (this.outputBytes + size > this.options.maxOutputBytes) {
        void this.finish("failed", this.problem(`Output limit reached (${this.options.maxOutputBytes} bytes).`));
        return;
      }
      this.outputBytes += size;
      this.output += event.text;
    } else if (event.type === "clear") {
      this.output = ""; // The lifetime output budget deliberately does not reset.
    } else if (event.type === "input") {
      this.input = { id: event.id, prompt: event.prompt.slice(0, this.options.maxInputBytes) };
      this.status = "waiting";
    } else if (event.type === "done") {
      let error = event.error;
      if (error) {
        error = { ...error, message: error.message.slice(0, 4096), formatted: error.formatted.slice(0, 16_384) };
      }
      void this.finish(error ? "failed" : "completed", error);
    }
  }

  private async finish(status: ExecutionStatus, error?: RuntimeErrorInfo): Promise<void> {
    if (!this.active) return;
    this.status = status;
    this.error = error;
    this.input = undefined;
    this.finishedAt = Date.now();
    clearTimeout(this.timer);
    // Always terminate, even after "done": a trusted program can start timers or servers.
    try { await this.worker.terminate(); }
    finally { this.resolveFinished(this.snapshot()); }
  }
}

export class ExecutionPool {
  private jobs = new Map<string, LocalExecution>();
  private closing = false;

  start(options: ExecutionOptions): LocalExecution {
    if (this.closing) throw new HttpError(503, "The local server is closing.");
    if ([...this.jobs.values()].filter((job) => job.active).length >= 4) {
      throw new HttpError(429, "Too many programs are running. Stop a program before starting another.");
    }
    // Bound retained completed output. No unbounded per-session history.
    for (const [id, job] of this.jobs) {
      if (this.jobs.size < 16) break;
      if (!job.active) this.jobs.delete(id);
    }
    if (this.jobs.size >= 16) throw new HttpError(429, "The execution queue is full.");
    const job = new LocalExecution(options);
    this.jobs.set(job.id, job);
    return job;
  }

  get(id: string): LocalExecution {
    const job = this.jobs.get(id);
    if (!job) throw new HttpError(404, "Execution not found or no longer retained.");
    return job;
  }

  async close(): Promise<void> {
    this.closing = true;
    await Promise.all([...this.jobs.values()].map((job) => job.stop()));
    this.jobs.clear();
  }
}
