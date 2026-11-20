"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protocol_1 = require("./protocol");
const root = document.createElement("section");
root.id = "plain-playground";
root.style.cssText = "max-width:1100px;margin:2rem auto;padding:1.5rem;border:1px solid #334155;border-radius:16px;background:#0e131f;color:#f1f5f9;font:16px system-ui";
root.innerHTML = `<h2>Try PLAIN in your browser</h2><p>Runs in a Web Worker with a pure-language standard library.</p><textarea aria-label="PLAIN source" spellcheck="false" style="box-sizing:border-box;width:100%;min-height:220px;padding:1rem;background:#070a12;color:#e2e8f0;border:1px solid #334155;border-radius:8px;font:14px monospace">set scores to [80, 90, 100]\nsay "Average: " plus average(scores)</textarea><p><button type="button">Run code</button> <span role="status"></span></p><pre aria-live="polite" style="white-space:pre-wrap;min-height:60px;padding:1rem;background:#070a12;border-radius:8px"></pre>`;
document.body.append(root);
const source = root.querySelector("textarea");
const button = root.querySelector("button");
const status = root.querySelector("[role=status]");
const output = root.querySelector("pre");
button.addEventListener("click", () => {
    output.textContent = "";
    const appScript = document.querySelector('script[src$="app.js"]');
    const workerUrl = (appScript?.src || "./assets/app.js").replace(/app\.js(?:\?.*)?$/, "worker.js");
    const worker = new Worker(workerUrl, { type: "module" });
    button.disabled = true;
    status.textContent = "Running…";
    const timer = setTimeout(() => {
        worker.terminate();
        status.textContent = "Stopped after the execution time limit.";
        button.disabled = false;
    }, protocol_1.BROWSER_LIMITS.timeoutMs);
    worker.addEventListener("message", (event) => {
        if (event.data.type === "output")
            output.textContent += event.data.text || "";
        else if (event.data.type === "clear")
            output.textContent = "";
        else if (event.data.type === "input") {
            const answer = window.prompt(event.data.prompt || "Input:");
            worker.postMessage({ type: "input", id: event.data.id, value: answer || "" });
        }
        else if (event.data.type === "done") {
            clearTimeout(timer);
            if (event.data.error) {
                output.textContent += `${event.data.error}\n`;
                status.textContent = "Execution failed.";
            }
            else
                status.textContent = "Execution finished.";
            worker.terminate();
            button.disabled = false;
        }
    });
    worker.postMessage({ type: "run", code: source.value, filename: "browser.plain" });
});
//# sourceMappingURL=main.js.map