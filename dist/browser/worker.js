"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
const protocol_1 = require("./protocol");
const port = self;
let pendingInput;
port.addEventListener("message", (event) => {
    if (event.data?.type === "input" && pendingInput?.id === event.data.id) {
        pendingInput.resolve(event.data.value);
        pendingInput = undefined;
    }
    if (event.data?.type === "run")
        void run(event.data.code, event.data.filename || "browser.plain");
});
async function run(code, filename) {
    if (new TextEncoder().encode(code).byteLength > protocol_1.BROWSER_LIMITS.maxSourceBytes) {
        port.postMessage({ type: "done", error: `Source exceeds ${protocol_1.BROWSER_LIMITS.maxSourceBytes} bytes.` });
        return;
    }
    let outputBytes = 0;
    const output = (text) => {
        const line = text + "\n";
        outputBytes += new TextEncoder().encode(line).byteLength;
        if (outputBytes > protocol_1.BROWSER_LIMITS.maxOutputBytes)
            throw new Error(`Output exceeds ${protocol_1.BROWSER_LIMITS.maxOutputBytes} bytes.`);
        port.postMessage({ type: "output", text: line });
    };
    try {
        await (0, index_1.runPlain)(code, {
            filename, baseDir: "/browser", onSay: output, onShow: output,
            onClear: () => port.postMessage({ type: "clear" }),
            onAsk: (prompt) => new Promise((resolve) => {
                const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                pendingInput = { id, resolve };
                port.postMessage({ type: "input", id, prompt });
            })
        });
        port.postMessage({ type: "done" });
    }
    catch (error) {
        port.postMessage({ type: "done", error: error instanceof Error ? error.message : String(error) });
    }
}
//# sourceMappingURL=worker.js.map