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
exports.startPlayground = startPlayground;
const http = __importStar(require("http"));
const index_1 = require("../index");
const HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PLAIN Language Playground</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: #1e293b;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #334155;
      --editor-bg: #090d16;
      --term-bg: #020617;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    header { background: var(--panel); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.15rem; color: var(--accent); }
    .controls { display: flex; align-items: center; gap: 12px; }
    select, button { padding: 8px 14px; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border); }
    select { background: var(--bg); color: var(--text); outline: none; }
    button.run { background: var(--accent); color: #000; border: none; }
    button.run:hover { background: var(--accent-hover); color: #fff; }
    button.clear { background: var(--bg); color: var(--muted); }
    button.clear:hover { color: var(--text); border-color: var(--text); }
    main { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); overflow: hidden; }
    .pane { display: flex; flex-direction: column; background: var(--panel); height: 100%; overflow: hidden; }
    .pane-header { padding: 8px 16px; background: var(--panel); border-bottom: 1px solid var(--border); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
    textarea#editor { flex: 1; width: 100%; background: var(--editor-bg); color: #e2e8f0; font-family: 'Courier New', monospace; font-size: 1rem; line-height: 1.5; padding: 16px; border: none; outline: none; resize: none; tab-size: 4; }
    pre#terminal { flex: 1; width: 100%; background: var(--term-bg); color: #38bdf8; font-family: 'Courier New', monospace; font-size: 0.95rem; line-height: 1.5; padding: 16px; margin: 0; overflow-y: auto; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>&#9998; PLAIN</span>
      <span style="font-size: 0.8rem; font-weight: 400; color: var(--muted);">| The English-like Programming Language</span>
    </div>
    <div class="controls">
      <select id="exampleSelector">
        <option value="hello">01: Hello World</option>
        <option value="calculator">02: Simple Calculator</option>
        <option value="conditions">03: Age Checker</option>
        <option value="functions">04: Functions & Math</option>
        <option value="lists">05: Lists & Statistics</option>
        <option value="loops">06: Repetition & Loops</option>
      </select>
      <button class="clear" onclick="clearOutput()">Clear Output</button>
      <button class="run" onclick="runCode()">Run Program (Ctrl+Enter)</button>
    </div>
  </header>
  <main>
    <div class="pane">
      <div class="pane-header">Source Code (.plain)</div>
      <textarea id="editor" spellcheck="false" placeholder="Write your PLAIN program here..."></textarea>
    </div>
    <div class="pane">
      <div class="pane-header">Output Console</div>
      <pre id="terminal">Ready. Click 'Run Program' or press Ctrl+Enter to execute.</pre>
    </div>
  </main>
  <script>
    const examples = {
      hello: 'say "Hello, world!"\\n\\nset name to "Alex"\\nsay "Welcome to PLAIN, " plus name',
      calculator: 'set first to 12\\nset second to 8\\n\\nset sum to first plus second\\nset difference to first minus second\\nset product to first times second\\n\\nsay "Sum: " plus sum\\nsay "Difference: " plus difference\\nsay "Product: " plus product',
      conditions: 'set age to 16\\n\\nif age is at least 18 then\\n    say "You are an adult."\\notherwise if age is at least 13 then\\n    say "You are a teenager."\\notherwise\\n    say "You are a child."\\nend',
      functions: 'to double number\\n    give back number times 2\\nend\\n\\nto add first and second\\n    give back first plus second\\nend\\n\\nsay "Double 12 is: " plus double 12\\nsay "Add 4 and 6 is: " plus add 4 and 6',
      lists: 'set scores to [80, 95, 72, 88, 100]\\n\\nsay "All scores: " plus scores\\nsay "Number of scores: " plus count(scores)\\nsay "Highest score: " plus highest(scores)\\nsay "Lowest score: " plus lowest(scores)\\nsay "Average score: " plus average(scores)\\n\\nsay "Second item: " plus item 2 of scores',
      loops: 'say "Countdown:"\\nset lives to 3\\nrepeat while lives is greater than 0\\n    say lives\\n    set lives to lives minus 1\\nend\\n\\nrepeat 3 times\\n    say "Learning PLAIN is fun!"\\nend'
    };

    const editor = document.getElementById('editor');
    const terminal = document.getElementById('terminal');
    const selector = document.getElementById('exampleSelector');

    function loadExample(key) {
      if (examples[key]) {
        editor.value = examples[key];
      }
    }

    selector.addEventListener('change', (e) => loadExample(e.target.value));
    loadExample('hello');

    function clearOutput() {
      terminal.textContent = '';
    }

    async function runCode() {
      const code = editor.value;
      terminal.textContent = 'Running...\\n';
      try {
        const resp = await fetch('/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const data = await resp.json();
        if (data.error) {
          terminal.style.color = '#f87171';
          terminal.textContent = data.error;
        } else {
          terminal.style.color = '#38bdf8';
          terminal.textContent = data.output.length > 0 ? data.output.join('\\n') : '(Program finished with no output)';
        }
      } catch (err) {
        terminal.style.color = '#f87171';
        terminal.textContent = 'Connection error: ' + err.message;
      }
    }

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
    });
  </script>
</body>
</html>`;
function startPlayground(port = 3000) {
    const server = http.createServer(async (req, res) => {
        if (req.method === "GET" && req.url === "/") {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(HTML_PAGE);
            return;
        }
        if (req.method === "POST" && req.url === "/run") {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk;
            });
            req.on("end", async () => {
                try {
                    const { code } = JSON.parse(body || "{}");
                    const output = [];
                    await (0, index_1.runPlain)(code || "", {
                        onSay: (s) => output.push(s),
                        onShow: (s) => output.push(s),
                        onAsk: async (prompt) => `(playground answer to: ${prompt})`
                    });
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ output }));
                }
                catch (err) {
                    const formatted = (0, index_1.formatError)(err, body);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: formatted }));
                }
            });
            return;
        }
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
    });
    server.listen(port, () => {
        console.log(`==========================================================`);
        console.log(`      PLAIN Playground running at: http://localhost:${port} `);
        console.log(`      Open in your web browser to start coding visually.  `);
        console.log(`==========================================================`);
    });
}
//# sourceMappingURL=server.js.map