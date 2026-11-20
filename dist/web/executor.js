"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionPool = exports.LocalExecution = void 0;
const path = __importStar(require("node:path"));
const node_crypto_1 = require("node:crypto");
const node_worker_threads_1 = require("node:worker_threads");
const http_1 = require("./http");
const ACTIVE = new Set(["running", "waiting"]);
/** Thread isolation keeps a tight interpreter loop from blocking HTTP or Stop. It is not an OS sandbox. */
class LocalExecution {
    options;
    id = (0, node_crypto_1.randomBytes)(16).toString("hex");
    finished;
    resolveFinished;
    startedAt = Date.now();
    finishedAt;
    status = "running";
    output = "";
    outputBytes = 0;
    input;
    error;
    worker;
    timer;
    constructor(options) {
        this.options = options;
        this.finished = new Promise((resolve) => { this.resolveFinished = resolve; });
        const sourceMode = __filename.endsWith(".ts");
        const file = path.join(__dirname, `execution-worker.${sourceMode ? "ts" : "js"}`);
        const workerOptions = {
            workerData: sourceMode ? { ...options, bootstrap: require.resolve("tsx/cjs"), file } : options,
            execArgv: [],
            resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 32, stackSizeMb: 4 }
        };
        this.worker = sourceMode
            ? new node_worker_threads_1.Worker("const { workerData } = require('node:worker_threads'); require(workerData.bootstrap); require(workerData.file);", { ...workerOptions, eval: true, workerData: workerOptions.workerData })
            : new node_worker_threads_1.Worker(file, workerOptions);
        this.timer = setTimeout(() => {
            void this.finish("timeout", this.problem(`Execution stopped after ${options.timeoutMs} ms.`, "Try a smaller program or a loop that ends."));
        }, options.timeoutMs);
        this.timer.unref();
        this.worker.on("message", (event) => this.onMessage(event));
        this.worker.on("error", (error) => { void this.finish("failed", this.problem(`Executor error: ${error.message}`)); });
        this.worker.on("exit", (code) => {
            if (this.active)
                void this.finish("failed", this.problem(`The executor exited before completing (code ${code}).`));
        });
    }
    get active() { return ACTIVE.has(this.status); }
    snapshot() {
        return {
            id: this.id, status: this.status, output: this.output,
            durationMs: (this.finishedAt ?? Date.now()) - this.startedAt,
            ...(this.input ? { input: this.input } : {}),
            ...(this.error ? { error: this.error } : {})
        };
    }
    answer(id, value) {
        if (!this.active || !this.input || this.input.id !== id)
            throw new http_1.HttpError(409, "This input request is no longer waiting.");
        if (Buffer.byteLength(value, "utf8") > this.options.maxInputBytes)
            throw new http_1.HttpError(413, "Input is too long.");
        this.input = undefined;
        this.status = "running";
        this.worker.postMessage({ type: "input", id, value });
    }
    async stop() {
        await this.finish("stopped", this.problem("Execution stopped."));
        return this.finished;
    }
    problem(message, suggestion) {
        return { kind: "RuntimeError", message, formatted: suggestion ? `${message}\n${suggestion}` : message };
    }
    onMessage(event) {
        if (!this.active || !event || typeof event !== "object")
            return;
        if (event.type === "output" && typeof event.text === "string") {
            const size = Buffer.byteLength(event.text, "utf8");
            if (this.outputBytes + size > this.options.maxOutputBytes) {
                void this.finish("failed", this.problem(`Output limit reached (${this.options.maxOutputBytes} bytes).`));
                return;
            }
            this.outputBytes += size;
            this.output += event.text;
        }
        else if (event.type === "clear") {
            this.output = ""; // The lifetime output budget deliberately does not reset.
        }
        else if (event.type === "input") {
            this.input = { id: event.id, prompt: event.prompt.slice(0, this.options.maxInputBytes) };
            this.status = "waiting";
        }
        else if (event.type === "done") {
            let error = event.error;
            if (error) {
                error = { ...error, message: error.message.slice(0, 4096), formatted: error.formatted.slice(0, 16_384) };
            }
            void this.finish(error ? "failed" : "completed", error);
        }
    }
    async finish(status, error) {
        if (!this.active)
            return;
        this.status = status;
        this.error = error;
        this.input = undefined;
        this.finishedAt = Date.now();
        clearTimeout(this.timer);
        // Always terminate, even after "done": a trusted program can start timers or servers.
        try {
            await this.worker.terminate();
        }
        finally {
            this.resolveFinished(this.snapshot());
        }
    }
}
exports.LocalExecution = LocalExecution;
class ExecutionPool {
    jobs = new Map();
    closing = false;
    start(options) {
        if (this.closing)
            throw new http_1.HttpError(503, "The local server is closing.");
        if ([...this.jobs.values()].filter((job) => job.active).length >= 4) {
            throw new http_1.HttpError(429, "Too many programs are running. Stop a program before starting another.");
        }
        // Bound retained completed output. No unbounded per-session history.
        for (const [id, job] of this.jobs) {
            if (this.jobs.size < 16)
                break;
            if (!job.active)
                this.jobs.delete(id);
        }
        if (this.jobs.size >= 16)
            throw new http_1.HttpError(429, "The execution queue is full.");
        const job = new LocalExecution(options);
        this.jobs.set(job.id, job);
        return job;
    }
    get(id) {
        const job = this.jobs.get(id);
        if (!job)
            throw new http_1.HttpError(404, "Execution not found or no longer retained.");
        return job;
    }
    async close() {
        this.closing = true;
        await Promise.all([...this.jobs.values()].map((job) => job.stop()));
        this.jobs.clear();
    }
}
exports.ExecutionPool = ExecutionPool;
//# sourceMappingURL=executor.js.map