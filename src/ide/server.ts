import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { exec } from "child_process";
import { runPlain, formatError } from "../index";
import { createStandardEnvironment } from "../builtins/index";
import { PlainSystemManager } from "../setup/installer";

export function startPlainIde(port: number = 4200, initialFilePath?: string): Promise<http.Server> {
  const manager = new PlainSystemManager();
  const standardEnv = createStandardEnvironment();
  const allFunctions = standardEnv.getAllVariableNames().sort();

  const examplesDirCandidates = [
    path.resolve(__dirname, "..", "examples"),
    path.resolve(__dirname, "..", "..", "examples"),
    path.resolve(process.cwd(), "examples")
  ];
  const examplesDir = examplesDirCandidates.find((d) => fs.existsSync(d)) || "";

  let initialCode = `# ==========================================================
# Welcome to PLAIN IDE (Python IDLE Equivalent)
# Author: Reuben • 1,235 Functions Built-In
# Press [F5] or click 'Run' to execute code!
# ==========================================================

say "Hello from PLAIN IDE!"

# Pythonic syntax & math
x = 10
x += 5
say "Calculated x = " + x
say "Power 2 ** 8 = " + (2 ** 8)

# Dictionaries
student = { "name": "Reuben", "role": "Creator", "level": 10 }
say "Student: " + student.name + " (" + student.role + ")"

# Train an AI neural network
say "Loading AI Iris dataset..."
dataset = load_dataset("iris")
say "Iris sample count: " + dataset.sample_count
`;

  if (initialFilePath && fs.existsSync(initialFilePath)) {
    try {
      initialCode = fs.readFileSync(initialFilePath, "utf-8");
    } catch {
      // ignore
    }
  }

  const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url || "/", `http://localhost:${port}`);
    const pathname = parsedUrl.pathname;

    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // 1. API: List all 1235 functions
    if (pathname === "/api/functions") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ count: allFunctions.length, functions: allFunctions }));
      return;
    }

    // 2. API: Run Doctor diagnostics
    if (pathname === "/api/doctor") {
      const diagnostics = await manager.diagnose();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(diagnostics));
      return;
    }

    // 3. API: List Bundled Examples
    if (pathname === "/api/examples") {
      const list: { name: string; filename: string }[] = [];
      if (examplesDir && fs.existsSync(examplesDir)) {
        const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith(".plain"));
        for (const file of files) {
          list.push({ name: file.replace(".plain", "").replace(/_/g, " "), filename: file });
        }
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(list));
      return;
    }

    // 4. API: Load Example File
    if (pathname === "/api/example") {
      const name = parsedUrl.searchParams.get("name") || "";
      const targetPath = path.join(examplesDir, name);
      if (fs.existsSync(targetPath)) {
        const content = fs.readFileSync(targetPath, "utf-8");
        res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(content);
        return;
      }
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Example not found" }));
      return;
    }

    // 5. API: Read File
    if (pathname === "/api/file" && req.method === "GET") {
      const filePath = parsedUrl.searchParams.get("path") || "";
      if (filePath && fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
          res.end(content);
          return;
        } catch (err: any) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
          return;
        }
      }
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid path" }));
      return;
    }

    // 6. API: Save File
    if (pathname === "/api/file" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const data = JSON.parse(body);
          const savePath = data.path || path.join(process.cwd(), "script.plain");
          fs.writeFileSync(savePath, data.code || "", "utf-8");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, path: savePath }));
        } catch (err: any) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    // 7. API: Execute PLAIN Code (Live Runner)
    if (pathname === "/api/run" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", async () => {
        try {
          const { code, filename } = JSON.parse(body);
          let output = "";
          const startTime = Date.now();

          await runPlain(code, {
            filename: filename || "main.plain",
            onSay: (s) => (output += s + "\n"),
            onShow: (s) => (output += s + "\n"),
            onAsk: async (prompt) => "user_input"
          });

          const durationMs = Date.now() - startTime;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, output, durationMs }));
        } catch (err: any) {
          const parsed = typeof err === "object" ? JSON.parse(body) : { code: "" };
          const formatted = formatError(err, parsed.code || "");
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: formatted, rawError: err.message }));
        }
      });
      return;
    }

    // 8. Serve Web IDE Frontend
    if (pathname === "/" || pathname === "/index.html") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(getIdeHtml(initialCode, initialFilePath));
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      const url = `http://localhost:${port}`;
      console.log("");
      console.log("╔══════════════════════════════════════════════════════════════╗");
      console.log("║               💻 PLAIN IDE (IDLE) STARTED                    ║");
      console.log("╠══════════════════════════════════════════════════════════════╣");
      console.log(`║  IDE Interface:   ${url.padEnd(43)}║`);
      console.log("║  Features:        Interactive Editor, Live Shell, AI Runner  ║");
      console.log("║  Author:          Reuben                                     ║");
      console.log("╚══════════════════════════════════════════════════════════════╝");
      console.log("Opening PLAIN IDE in your default web browser...\n");

      // Auto-open browser
      const openCmd =
        os.platform() === "win32" ? `start ${url}` : os.platform() === "darwin" ? `open ${url}` : `xdg-open ${url}`;
      exec(openCmd, () => {});

      resolve(server);
    });
  });
}

function getIdeHtml(initialCode: string, initialPath?: string): string {
  const safeInitialCode = JSON.stringify(initialCode);
  const safeInitialPath = JSON.stringify(initialPath || "untitled.plain");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PLAIN IDE — Python IDLE Equivalent (Author: Reuben)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090a0f;
      --panel-bg: #11131c;
      --panel-border: #1e2235;
      --editor-bg: #0d0f17;
      --text: #e2e8f0;
      --text-muted: #8492a6;
      --accent: #00f2fe;
      --accent-glow: rgba(0, 242, 254, 0.25);
      --green: #10b981;
      --red: #f43f5e;
      --yellow: #f59e0b;
      --purple: #a855f7;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', system-ui, sans-serif;
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    /* Toolbar */
    .toolbar {
      height: 52px;
      background: var(--panel-bg);
      border-bottom: 1px solid var(--panel-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      user-select: none;
    }
    .toolbar-left, .toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand {
      font-weight: 700;
      font-size: 16px;
      background: linear-gradient(135deg, var(--accent), #4facfe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-right: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge-author {
      font-size: 11px;
      font-weight: 600;
      background: rgba(168, 85, 247, 0.2);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.4);
      padding: 2px 8px;
      border-radius: 999px;
    }
    .btn {
      background: #1a1e2e;
      color: var(--text);
      border: 1px solid var(--panel-border);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }
    .btn:hover {
      background: #23293d;
      border-color: #2e3650;
    }
    .btn-run {
      background: #059669;
      color: white;
      border-color: #10b981;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.35);
    }
    .btn-run:hover {
      background: #10b981;
    }
    select.select-examples {
      background: #1a1e2e;
      color: var(--text);
      border: 1px solid var(--panel-border);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 13px;
      outline: none;
      cursor: pointer;
    }
    /* Main Layout */
    .main-workspace {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      overflow: hidden;
    }
    .panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--editor-bg);
      border-right: 1px solid var(--panel-border);
    }
    .panel:last-child {
      border-right: none;
    }
    .panel-header {
      height: 38px;
      background: var(--panel-bg);
      border-bottom: 1px solid var(--panel-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .file-tab {
      background: var(--editor-bg);
      color: var(--accent);
      border-top: 2px solid var(--accent);
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 500;
      text-transform: none;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    /* Code Editor */
    .editor-wrapper {
      flex: 1;
      position: relative;
      display: flex;
      overflow: hidden;
    }
    .line-numbers {
      width: 48px;
      background: rgba(0,0,0,0.25);
      border-right: 1px solid var(--panel-border);
      padding: 16px 8px;
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      line-height: 22px;
      color: #4b5563;
      text-align: right;
      user-select: none;
      overflow: hidden;
    }
    .code-area {
      flex: 1;
      height: 100%;
      background: transparent;
      border: none;
      outline: none;
      color: #f1f5f9;
      font-family: 'Fira Code', monospace;
      font-size: 14px;
      line-height: 22px;
      padding: 16px;
      resize: none;
      white-space: pre;
      overflow: auto;
      tab-size: 4;
    }
    /* Console Shell */
    .console-output {
      flex: 1;
      padding: 16px;
      font-family: 'Fira Code', monospace;
      font-size: 13.5px;
      line-height: 20px;
      overflow-y: auto;
      background: #08090f;
      color: #cbd5e1;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .console-input-row {
      height: 44px;
      background: var(--panel-bg);
      border-top: 1px solid var(--panel-border);
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 8px;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
    }
    .console-prompt {
      color: var(--accent);
      font-weight: bold;
    }
    .console-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: white;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
    }
    /* Status bar */
    .statusbar {
      height: 26px;
      background: var(--panel-bg);
      border-top: 1px solid var(--panel-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      font-size: 11px;
      color: var(--text-muted);
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
    /* Modal */
    .modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      backdrop-filter: blur(4px);
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .modal-content {
      background: var(--panel-bg);
      border: 1px solid var(--panel-border);
      border-radius: 10px;
      width: 700px;
      max-width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
    }
    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--panel-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 600;
    }
    .modal-body {
      padding: 20px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.6;
    }
    .search-box {
      width: 100%;
      padding: 8px 12px;
      background: var(--bg);
      border: 1px solid var(--panel-border);
      color: white;
      border-radius: 6px;
      margin-bottom: 16px;
      font-family: inherit;
      outline: none;
    }
    .fn-tag {
      display: inline-block;
      background: rgba(0, 242, 254, 0.1);
      color: var(--accent);
      border: 1px solid rgba(0, 242, 254, 0.2);
      padding: 3px 8px;
      border-radius: 4px;
      margin: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 12px;
    }
  </style>
</head>
<body>

  <!-- Toolbar -->
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="brand">
        <span>⚡ PLAIN IDE</span>
        <span class="badge-author">Reuben</span>
      </div>
      <button class="btn btn-run" id="runBtn" title="Execute Code (F5)">▶ Run (F5)</button>
      <button class="btn" id="saveBtn" title="Save file (Ctrl+S)">💾 Save</button>
      <button class="btn" id="newBtn" title="New file">📄 New</button>
      <select class="select-examples" id="exampleSelect">
        <option value="">Load Example Script...</option>
      </select>
    </div>
    <div class="toolbar-right">
      <button class="btn" id="doctorBtn">🩺 Diagnostics</button>
      <button class="btn" id="functionsBtn">📚 1,235 Functions</button>
      <button class="btn" id="clearBtn">Clear Shell</button>
    </div>
  </div>

  <!-- Workspace -->
  <div class="main-workspace">
    <!-- Editor Pane -->
    <div class="panel">
      <div class="panel-header">
        <div class="file-tab" id="fileTabTitle">untitled.plain</div>
        <span id="editorStats">Line 1, Col 1</span>
      </div>
      <div class="editor-wrapper">
        <div class="line-numbers" id="lineNumbers">1</div>
        <textarea class="code-area" id="codeEditor" spellcheck="false"></textarea>
      </div>
    </div>

    <!-- Interactive Console Shell Pane (IDLE Shell) -->
    <div class="panel">
      <div class="panel-header">
        <span>PLAIN Interactive Shell & Execution Output</span>
        <span id="execStats">Ready</span>
      </div>
      <div class="console-output" id="consoleOutput">PLAIN Interactive Shell (v1.1.0)
Type code in the editor and press Run (F5) or type commands below.
Author: Reuben • All 1,235 Functions Loaded.
----------------------------------------------------------------------
</div>
      <div class="console-input-row">
        <span class="console-prompt">plain&gt;</span>
        <input type="text" class="console-input" id="replInput" placeholder="Type a PLAIN statement or math (e.g. 15 * 8, load_dataset('iris'))" autocomplete="off" />
      </div>
    </div>
  </div>

  <!-- Statusbar -->
  <div class="statusbar">
    <div class="status-item">
      <span class="pulse-dot"></span>
      <span id="statusMessage">PLAIN Engine Ready (1,235 Built-in Functions)</span>
    </div>
    <div class="status-item">
      <span>UTF-8 • PLAIN Language • Author: Reuben</span>
    </div>
  </div>

  <!-- Modal for Functions Reference -->
  <div class="modal" id="fnModal">
    <div class="modal-content">
      <div class="modal-header">
        <span>PLAIN Standard Library Reference (1,235 Functions)</span>
        <button class="btn" id="closeFnModal">Close</button>
      </div>
      <div class="modal-body">
        <input type="text" class="search-box" id="fnSearch" placeholder="Search functions (e.g. matrix, train, neural, dataset, sha256)..." />
        <div id="fnListContainer"></div>
      </div>
    </div>
  </div>

  <script>
    const codeEditor = document.getElementById("codeEditor");
    const lineNumbers = document.getElementById("lineNumbers");
    const consoleOutput = document.getElementById("consoleOutput");
    const replInput = document.getElementById("replInput");
    const runBtn = document.getElementById("runBtn");
    const saveBtn = document.getElementById("saveBtn");
    const newBtn = document.getElementById("newBtn");
    const clearBtn = document.getElementById("clearBtn");
    const exampleSelect = document.getElementById("exampleSelect");
    const execStats = document.getElementById("execStats");
    const editorStats = document.getElementById("editorStats");
    const fileTabTitle = document.getElementById("fileTabTitle");
    const doctorBtn = document.getElementById("doctorBtn");
    const functionsBtn = document.getElementById("functionsBtn");
    const fnModal = document.getElementById("fnModal");
    const closeFnModal = document.getElementById("closeFnModal");
    const fnSearch = document.getElementById("fnSearch");
    const fnListContainer = document.getElementById("fnListContainer");

    let currentFile = ${safeInitialPath};
    codeEditor.value = ${safeInitialCode};
    fileTabTitle.innerText = currentFile;

    // Line number updates
    function updateLineNumbers() {
      const lines = codeEditor.value.split("\\n").length;
      let numbers = "";
      for (let i = 1; i <= lines; i++) numbers += i + "\\n";
      lineNumbers.innerText = numbers;
    }
    codeEditor.addEventListener("input", updateLineNumbers);
    codeEditor.addEventListener("scroll", () => {
      lineNumbers.scrollTop = codeEditor.scrollTop;
    });
    updateLineNumbers();

    // Editor cursor position
    codeEditor.addEventListener("keyup", updateCursorPos);
    codeEditor.addEventListener("click", updateCursorPos);
    function updateCursorPos() {
      const text = codeEditor.value.substring(0, codeEditor.selectionStart);
      const lines = text.split("\\n");
      editorStats.innerText = \`Line \${lines.length}, Col \${lines[lines.length - 1].length + 1}\`;
    }

    // Run code
    async function executeCode(codeToRun) {
      execStats.innerText = "Running...";
      execStats.style.color = "var(--yellow)";
      const code = codeToRun !== undefined ? codeToRun : codeEditor.value;

      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, filename: currentFile })
        });
        const data = await res.json();
        if (data.success) {
          consoleOutput.innerText += \`>>> Running \${currentFile}...\\n\${data.output || "[No output]"}\\n[Process finished in \${data.durationMs} ms]\\n\\n\`;
          execStats.innerText = \`Success (\${data.durationMs}ms)\`;
          execStats.style.color = "var(--green)";
        } else {
          consoleOutput.innerText += \`>>> Execution Error:\\n\${data.error}\\n\\n\`;
          execStats.innerText = "Error";
          execStats.style.color = "var(--red)";
        }
      } catch (err) {
        consoleOutput.innerText += \`>>> Network/Runtime error: \${err.message}\\n\\n\`;
        execStats.innerText = "Failed";
        execStats.style.color = "var(--red)";
      }
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    runBtn.addEventListener("click", () => executeCode());

    // Keyboard Shortcuts (F5 to run, Ctrl+S to save)
    window.addEventListener("keydown", (e) => {
      if (e.key === "F5") {
        e.preventDefault();
        executeCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveFile();
      }
    });

    // Save File
    async function saveFile() {
      const filePath = prompt("Enter file path to save:", currentFile);
      if (!filePath) return;
      currentFile = filePath;
      fileTabTitle.innerText = currentFile;

      const res = await fetch("/api/file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: currentFile, code: codeEditor.value })
      });
      const data = await res.json();
      if (data.success) {
        consoleOutput.innerText += \`[Saved file to \${data.path}]\\n\\n\`;
      }
    }
    saveBtn.addEventListener("click", saveFile);

    // New File
    newBtn.addEventListener("click", () => {
      if (confirm("Create a new script? Unsaved changes will be cleared.")) {
        codeEditor.value = "# New PLAIN Program\\nsay \\"Hello World!\\"\\n";
        currentFile = "untitled.plain";
        fileTabTitle.innerText = currentFile;
        updateLineNumbers();
      }
    });

    // Clear console
    clearBtn.addEventListener("click", () => {
      consoleOutput.innerText = "";
    });

    // REPL Single Line Execution
    replInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        const cmd = replInput.value.trim();
        if (!cmd) return;
        replInput.value = "";
        consoleOutput.innerText += \`plain> \${cmd}\\n\`;
        await executeCode(cmd);
      }
    });

    // Load Examples Dropdown
    async function loadExamples() {
      try {
        const res = await fetch("/api/examples");
        const list = await res.json();
        list.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item.filename;
          opt.innerText = item.name;
          exampleSelect.appendChild(opt);
        });
      } catch {}
    }
    loadExamples();

    exampleSelect.addEventListener("change", async () => {
      const selected = exampleSelect.value;
      if (!selected) return;
      const res = await fetch(\`/api/example?name=\${encodeURIComponent(selected)}\`);
      if (res.ok) {
        codeEditor.value = await res.text();
        currentFile = selected;
        fileTabTitle.innerText = currentFile;
        updateLineNumbers();
        consoleOutput.innerText += \`[Loaded example: \${selected}]\\n\\n\`;
      }
    });

    // Doctor Diagnostics
    doctorBtn.addEventListener("click", async () => {
      consoleOutput.innerText += ">>> Running PLAIN Doctor Diagnostics...\\n";
      const res = await fetch("/api/doctor");
      const diags = await res.json();
      diags.forEach(d => {
        const icon = d.status === "ok" ? "✓" : d.status === "warning" ? "!" : "✗";
        consoleOutput.innerText += \`  [\${icon}] \${d.name}: \${d.message}\\n\`;
      });
      consoleOutput.innerText += "\\n";
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    });

    // Functions Reference
    let allFns = [];
    async function loadFunctions() {
      const res = await fetch("/api/functions");
      const data = await res.json();
      allFns = data.functions || [];
      renderFunctions(allFns.slice(0, 150));
    }
    function renderFunctions(fns) {
      fnListContainer.innerHTML = fns.map(f => \`<span class="fn-tag">\${f}</span>\`).join("");
    }
    functionsBtn.addEventListener("click", () => {
      fnModal.style.display = "flex";
      if (allFns.length === 0) loadFunctions();
    });
    closeFnModal.addEventListener("click", () => fnModal.style.display = "none");
    fnSearch.addEventListener("input", () => {
      const query = fnSearch.value.toLowerCase().trim();
      const filtered = allFns.filter(f => f.toLowerCase().includes(query)).slice(0, 150);
      renderFunctions(filtered);
    });
  </script>
</body>
</html>`;
}
