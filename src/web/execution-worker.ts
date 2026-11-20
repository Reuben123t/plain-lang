import { parentPort, workerData } from "node:worker_threads";
import { runPlain } from "../index";
import { formatError } from "../errors/formatter";
import { PlainError } from "../errors/plain-error";
import type { RuntimeEvent, RuntimeErrorInfo } from "../browser/protocol";

interface Job {
  code: string;
  filename: string;
  workspaceDir: string;
  maxOutputBytes: number;
  maxInputBytes: number;
  inputs?: string[];
  interactive: boolean;
}

const port = parentPort;
if (!port) throw new Error("The local executor must run inside a worker thread.");
const job = workerData as Job;
let outputBytes = 0;
let nextInputId = 0;
let pendingInput: { id: number; resolve: (answer: string) => void } | undefined;
const inputs = [...(job.inputs || [])];

function post(message: RuntimeEvent): void { port!.postMessage(message); }
function output(text: string): void {
  const line = `${text}\n`;
  outputBytes += Buffer.byteLength(line, "utf8");
  if (outputBytes > job.maxOutputBytes) {
    throw new PlainError(`Output limit reached (${job.maxOutputBytes} bytes).`, { line: 1, column: 1 }, {
      kind: "RuntimeError", suggestion: "Print fewer values, then run again."
    });
  }
  post({ type: "output", text: line });
}

port.on("message", (message: { type?: string; id?: number; value?: unknown }) => {
  if (message?.type !== "input" || !pendingInput || message.id !== pendingInput.id || typeof message.value !== "string") return;
  if (Buffer.byteLength(message.value, "utf8") > job.maxInputBytes) return;
  const resolve = pendingInput.resolve;
  pendingInput = undefined;
  resolve(message.value);
});

async function ask(prompt: string): Promise<string> {
  if (inputs.length > 0) return inputs.shift()!;
  if (!job.interactive) {
    throw new PlainError("This program needs input. Supply an inputs array or use the interactive editor.", { line: 1, column: 1 }, {
      kind: "RuntimeError"
    });
  }
  const id = ++nextInputId;
  return new Promise<string>((resolve) => {
    pendingInput = { id, resolve };
    post({ type: "input", id, prompt: prompt.slice(0, job.maxInputBytes) });
  });
}

function describeError(error: unknown): RuntimeErrorInfo {
  return {
    message: error instanceof Error ? error.message : String(error),
    formatted: formatError(error, job.code),
    kind: error instanceof PlainError ? error.kind : "RuntimeError",
    ...(error instanceof PlainError ? { location: error.location } : {})
  };
}

void (async () => {
  try {
    await runPlain(job.code, {
      filename: job.filename,
      baseDir: job.workspaceDir,
      onSay: output,
      onShow: output,
      onAsk: ask,
      onClear: () => post({ type: "clear" })
    });
    post({ type: "done" });
  } catch (error) {
    post({ type: "done", error: describeError(error) });
  } finally {
    port.close();
  }
})();
