import { runPlain } from "../index";
import { BROWSER_LIMITS, type WorkerRequest } from "./protocol";

interface BrowserWorkerScope {
  postMessage: (message: unknown) => void;
  addEventListener: (type: "message", listener: (event: MessageEvent<WorkerRequest>) => void) => void;
}
const port = self as unknown as BrowserWorkerScope;
let pendingInput: { id: number; resolve: (value: string) => void } | undefined;
port.addEventListener("message", (event: MessageEvent<WorkerRequest>) => {
  if (event.data?.type === "input" && pendingInput?.id === event.data.id) {
    pendingInput.resolve(event.data.value);
    pendingInput = undefined;
  }
  if (event.data?.type === "run") void run(event.data.code, event.data.filename || "browser.plain");
});

async function run(code: string, filename: string): Promise<void> {
  if (new TextEncoder().encode(code).byteLength > BROWSER_LIMITS.maxSourceBytes) {
    port.postMessage({ type: "done", error: `Source exceeds ${BROWSER_LIMITS.maxSourceBytes} bytes.` });
    return;
  }
  let outputBytes = 0;
  const output = (text: string) => {
    const line = text + "\n";
    outputBytes += new TextEncoder().encode(line).byteLength;
    if (outputBytes > BROWSER_LIMITS.maxOutputBytes) throw new Error(`Output exceeds ${BROWSER_LIMITS.maxOutputBytes} bytes.`);
    port.postMessage({ type: "output", text: line });
  };
  try {
    await runPlain(code, {
      filename, baseDir: "/browser", onSay: output, onShow: output,
      onClear: () => port.postMessage({ type: "clear" }),
      onAsk: (prompt) => new Promise<string>((resolve) => {
        const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        pendingInput = { id, resolve };
        port.postMessage({ type: "input", id, prompt });
      })
    });
    port.postMessage({ type: "done" });
  } catch (error) {
    port.postMessage({ type: "done", error: error instanceof Error ? error.message : String(error) });
  }
}
