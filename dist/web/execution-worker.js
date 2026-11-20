"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_worker_threads_1 = require("node:worker_threads");
const index_1 = require("../index");
const formatter_1 = require("../errors/formatter");
const plain_error_1 = require("../errors/plain-error");
const port = node_worker_threads_1.parentPort;
if (!port)
    throw new Error("The local executor must run inside a worker thread.");
const job = node_worker_threads_1.workerData;
let outputBytes = 0;
let nextInputId = 0;
let pendingInput;
const inputs = [...(job.inputs || [])];
function post(message) { port.postMessage(message); }
function output(text) {
    const line = `${text}\n`;
    outputBytes += Buffer.byteLength(line, "utf8");
    if (outputBytes > job.maxOutputBytes) {
        throw new plain_error_1.PlainError(`Output limit reached (${job.maxOutputBytes} bytes).`, { line: 1, column: 1 }, {
            kind: "RuntimeError", suggestion: "Print fewer values, then run again."
        });
    }
    post({ type: "output", text: line });
}
port.on("message", (message) => {
    if (message?.type !== "input" || !pendingInput || message.id !== pendingInput.id || typeof message.value !== "string")
        return;
    if (Buffer.byteLength(message.value, "utf8") > job.maxInputBytes)
        return;
    const resolve = pendingInput.resolve;
    pendingInput = undefined;
    resolve(message.value);
});
async function ask(prompt) {
    if (inputs.length > 0)
        return inputs.shift();
    if (!job.interactive) {
        throw new plain_error_1.PlainError("This program needs input. Supply an inputs array or use the interactive editor.", { line: 1, column: 1 }, {
            kind: "RuntimeError"
        });
    }
    const id = ++nextInputId;
    return new Promise((resolve) => {
        pendingInput = { id, resolve };
        post({ type: "input", id, prompt: prompt.slice(0, job.maxInputBytes) });
    });
}
function describeError(error) {
    return {
        message: error instanceof Error ? error.message : String(error),
        formatted: (0, formatter_1.formatError)(error, job.code),
        kind: error instanceof plain_error_1.PlainError ? error.kind : "RuntimeError",
        ...(error instanceof plain_error_1.PlainError ? { location: error.location } : {})
    };
}
void (async () => {
    try {
        await (0, index_1.runPlain)(job.code, {
            filename: job.filename,
            baseDir: job.workspaceDir,
            onSay: output,
            onShow: output,
            onAsk: ask,
            onClear: () => post({ type: "clear" })
        });
        post({ type: "done" });
    }
    catch (error) {
        post({ type: "done", error: describeError(error) });
    }
    finally {
        port.close();
    }
})();
//# sourceMappingURL=execution-worker.js.map