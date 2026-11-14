var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode5 = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));

// src/completions.ts
var vscode = __toESM(require("vscode"));
var BUILTINS_DOCS = [
  {
    name: "Set ABC = Main",
    kind: vscode.CompletionItemKind.Keyword,
    detail: "PLAIN Entry Declaration",
    doc: "Initializes the main execution block in PLAIN.",
    snippet: "Set ABC = Main\n"
  },
  {
    name: "say",
    kind: vscode.CompletionItemKind.Keyword,
    detail: "say <expression>",
    doc: 'Outputs text or expressions directly to the terminal or screen.\n\nExample:\n```plain\nsay "Hello, world!"\n```',
    snippet: 'say "$1"$0'
  },
  {
    name: "str",
    kind: vscode.CompletionItemKind.Function,
    detail: "str(value) -> string",
    doc: 'Converts any value (number, boolean, list, dict) to a string.\n\nExample:\n```plain\nmsg = "Result: " + str(42)\n```',
    snippet: "str($1)$0"
  },
  {
    name: "int",
    kind: vscode.CompletionItemKind.Function,
    detail: "int(value) -> integer",
    doc: 'Converts a number or string to an integer.\n\nExample:\n```plain\nx = int("123")\n```',
    snippet: "int($1)$0"
  },
  {
    name: "float",
    kind: vscode.CompletionItemKind.Function,
    detail: "float(value) -> float",
    doc: 'Converts a number or string to a floating point number.\n\nExample:\n```plain\npi = float("3.14159")\n```',
    snippet: "float($1)$0"
  },
  {
    name: "bool",
    kind: vscode.CompletionItemKind.Function,
    detail: "bool(value) -> boolean",
    doc: "Converts a value to true or false.",
    snippet: "bool($1)$0"
  },
  {
    name: "type",
    kind: vscode.CompletionItemKind.Function,
    detail: "type(value) -> string",
    doc: 'Returns the type name of the value ("int", "float", "string", "list", "dict", "boolean").',
    snippet: "type($1)$0"
  },
  {
    name: "len",
    kind: vscode.CompletionItemKind.Function,
    detail: "len(collection) -> integer",
    doc: "Returns the count of items in a list, characters in a string, or keys in a dictionary.",
    snippet: "len($1)$0"
  },
  {
    name: "cyber.port_scan",
    kind: vscode.CompletionItemKind.Function,
    detail: "cyber.port_scan(host, ports) -> list",
    doc: 'Scans target host for open TCP ports.\n\nExample:\n```plain\nimport cyber\nopen_ports = cyber.port_scan("127.0.0.1", [22, 80, 443])\n```',
    snippet: 'cyber.port_scan("${1:127.0.0.1}", [${2:80, 443}])$0'
  },
  {
    name: "cyber.audit_security_headers",
    kind: vscode.CompletionItemKind.Function,
    detail: "cyber.audit_security_headers(url) -> dict",
    doc: "Audits HTTP response headers for security best practices (CSP, HSTS, X-Frame-Options).\n\nReturns an audit dictionary with score and grade.",
    snippet: 'cyber.audit_security_headers("${1:https://example.com}")$0'
  },
  {
    name: "cyber.cve_lookup",
    kind: vscode.CompletionItemKind.Function,
    detail: "cyber.cve_lookup(cve_id) -> dict",
    doc: "Looks up vulnerability details and severity score from offline CVE database.",
    snippet: 'cyber.cve_lookup("${1:CVE-2021-44228}")$0'
  },
  {
    name: "cyber.detect_sqli",
    kind: vscode.CompletionItemKind.Function,
    detail: "cyber.detect_sqli(payload) -> boolean",
    doc: "Checks if input string contains SQL injection attack signatures.",
    snippet: "cyber.detect_sqli($1)$0"
  },
  {
    name: "cyber.detect_xss",
    kind: vscode.CompletionItemKind.Function,
    detail: "cyber.detect_xss(payload) -> boolean",
    doc: "Checks if input string contains Cross-Site Scripting (XSS) payload signatures.",
    snippet: "cyber.detect_xss($1)$0"
  },
  {
    name: "cyber.sanitize_html",
    kind: vscode.CompletionItemKind.Function,
    detail: "cyber.sanitize_html(raw_html) -> string",
    doc: "Sanitizes and escapes raw HTML to prevent injection vulnerabilities.",
    snippet: "cyber.sanitize_html($1)$0"
  },
  {
    name: "cyber.shannon_entropy",
    kind: vscode.CompletionItemKind.Function,
    detail: "cyber.shannon_entropy(data) -> float",
    doc: "Calculates Shannon entropy score (0 to 8) to detect encrypted/packed/obfuscated malware payloads.",
    snippet: "cyber.shannon_entropy($1)$0"
  },
  {
    name: "neural_network",
    kind: vscode.CompletionItemKind.Function,
    detail: "neural_network(layer_sizes) -> model",
    doc: "Constructs an Artificial Intelligence multi-layer neural network with specified layer dimensions.",
    snippet: "neural_network([${1:2, 4, 1}])$0"
  },
  {
    name: "train_ai",
    kind: vscode.CompletionItemKind.Function,
    detail: "train_ai(model, inputs, targets, epochs)",
    doc: "Trains a neural network model using forward and backward propagation.",
    snippet: "train_ai(${1:nn}, ${2:inputs}, ${3:targets}, ${4:100})$0"
  },
  {
    name: "predict_ai",
    kind: vscode.CompletionItemKind.Function,
    detail: "predict_ai(model, input_vector) -> list",
    doc: "Generates inference prediction from a trained neural network model.",
    snippet: "predict_ai(${1:nn}, ${2:input_vector})$0"
  },
  {
    name: "web_server",
    kind: vscode.CompletionItemKind.Function,
    detail: "web_server(port) -> server",
    doc: "Deploys an instant HTTP web server listening on the specified port.\n\nExample:\n```plain\nsrv = web_server(8080)\n```",
    snippet: "web_server(${1:8080})$0"
  },
  {
    name: "read_file",
    kind: vscode.CompletionItemKind.Function,
    detail: "read_file(path) -> string",
    doc: "Reads the entire contents of a UTF-8 text file.",
    snippet: 'read_file("${1:path}")$0'
  },
  {
    name: "write_file",
    kind: vscode.CompletionItemKind.Function,
    detail: "write_file(path, text)",
    doc: "Writes text to a file using clean UTF-8 encoding.",
    snippet: 'write_file("${1:path}", "${2:content}")$0'
  },
  {
    name: "file_exists",
    kind: vscode.CompletionItemKind.Function,
    detail: "file_exists(path) -> boolean",
    doc: "Returns true if the given file path exists on disk.",
    snippet: 'file_exists("${1:path}")$0'
  },
  {
    name: "sum",
    kind: vscode.CompletionItemKind.Function,
    detail: "sum(list_of_numbers) -> number",
    doc: "Returns the sum of all numerical values in a list.",
    snippet: "sum($1)$0"
  },
  {
    name: "average",
    kind: vscode.CompletionItemKind.Function,
    detail: "average(list_of_numbers) -> number",
    doc: "Calculates the arithmetic mean of a list of numbers.",
    snippet: "average($1)$0"
  },
  {
    name: "highest",
    kind: vscode.CompletionItemKind.Function,
    detail: "highest(list_of_numbers) -> number",
    doc: "Returns the maximum number in a list.",
    snippet: "highest($1)$0"
  },
  {
    name: "lowest",
    kind: vscode.CompletionItemKind.Function,
    detail: "lowest(list_of_numbers) -> number",
    doc: "Returns the minimum number in a list.",
    snippet: "lowest($1)$0"
  },
  {
    name: "round",
    kind: vscode.CompletionItemKind.Function,
    detail: "round(number, [decimals]) -> number",
    doc: "Rounds a number to the specified number of decimal places (default 0).",
    snippet: "round($1)$0"
  },
  {
    name: "random_between",
    kind: vscode.CompletionItemKind.Function,
    detail: "random_between(min, max) -> integer",
    doc: "Generates a random integer between min and max inclusive.",
    snippet: "random_between(${1:1}, ${2:100})$0"
  }
];
var PlainCompletionProvider = class {
  provideCompletionItems(document, position, token, context) {
    const items = [];
    for (const doc of BUILTINS_DOCS) {
      const item = new vscode.CompletionItem(doc.name, doc.kind);
      item.detail = doc.detail;
      item.documentation = new vscode.MarkdownString(doc.doc);
      if (doc.snippet) {
        item.insertText = new vscode.SnippetString(doc.snippet);
      }
      items.push(item);
    }
    const text = document.getText();
    const wordPattern = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;
    const seen = /* @__PURE__ */ new Set();
    BUILTINS_DOCS.forEach((b) => seen.add(b.name));
    let match;
    while ((match = wordPattern.exec(text)) !== null) {
      const word = match[0];
      if (word.length > 1 && !seen.has(word)) {
        seen.add(word);
        const userItem = new vscode.CompletionItem(word, vscode.CompletionItemKind.Variable);
        userItem.detail = "Local Symbol";
        items.push(userItem);
      }
    }
    return items;
  }
};

// src/hover.ts
var vscode2 = __toESM(require("vscode"));
var PlainHoverProvider = class {
  provideHover(document, position, token) {
    const range = document.getWordRangeAtPosition(position, /[A-Za-z0-9_.]+/);
    if (!range) return null;
    const word = document.getText(range);
    const found = BUILTINS_DOCS.find((b) => b.name === word || b.name.toLowerCase() === word.toLowerCase());
    if (found) {
      const md = new vscode2.MarkdownString();
      md.appendCodeblock(found.detail, "plain");
      md.appendMarkdown("\n\n" + found.doc);
      return new vscode2.Hover(md, range);
    }
    const lineText = document.lineAt(position.line).text;
    if (/^\s*Set\s+ABC\s*=\s*Main\b/i.test(lineText)) {
      const md = new vscode2.MarkdownString();
      md.appendCodeblock("Set ABC = Main", "plain");
      md.appendMarkdown("\n\n**PLAIN Entry Declaration**: Designates this script as the primary execution unit.");
      return new vscode2.Hover(md, range);
    }
    return null;
  }
};

// src/symbols.ts
var vscode3 = __toESM(require("vscode"));
var PlainDocumentSymbolProvider = class {
  provideDocumentSymbols(document, token) {
    const symbols = [];
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text;
      const setMatch = text.match(/^\s*(Set\s+[A-Za-z0-9_]+\s*=\s*[A-Za-z0-9_]+)/i);
      if (setMatch) {
        const symbol = new vscode3.DocumentSymbol(
          setMatch[1],
          "Entry Statement",
          vscode3.SymbolKind.Event,
          line.range,
          line.range
        );
        symbols.push(symbol);
        continue;
      }
      const fnMatch = text.match(/^\s*(?:def|function|to)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)/);
      if (fnMatch) {
        const fnName = fnMatch[1];
        const params = fnMatch[2];
        const symbol = new vscode3.DocumentSymbol(
          fnName,
          `(${params})`,
          vscode3.SymbolKind.Function,
          line.range,
          line.range
        );
        symbols.push(symbol);
        continue;
      }
      const varMatch = text.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)\s*(.+)$/);
      if (varMatch && !/^\s*(Set|if|while|for|def)\b/i.test(text)) {
        const varName = varMatch[1];
        const symbol = new vscode3.DocumentSymbol(
          varName,
          varMatch[2].trim(),
          vscode3.SymbolKind.Variable,
          line.range,
          line.range
        );
        symbols.push(symbol);
      }
    }
    return symbols;
  }
};

// src/diagnostics.ts
var vscode4 = __toESM(require("vscode"));
var PlainDiagnosticProvider = class {
  diagnosticCollection;
  constructor(context) {
    this.diagnosticCollection = vscode4.languages.createDiagnosticCollection("plain");
    context.subscriptions.push(this.diagnosticCollection);
  }
  updateDiagnostics(document) {
    if (document.languageId !== "plain") return;
    const diagnostics = [];
    const text = document.getText();
    if (text.charCodeAt(0) === 65279) {
      const range = new vscode4.Range(0, 0, 0, 1);
      const diag = new vscode4.Diagnostic(
        range,
        "UTF-8 Byte Order Mark (BOM) detected. PLAIN scripts should be saved without BOM.",
        vscode4.DiagnosticSeverity.Warning
      );
      diagnostics.push(diag);
    }
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const lineText = line.text;
      const commentIdx = lineText.indexOf("#");
      const codePart = commentIdx !== -1 ? lineText.substring(0, commentIdx) : lineText;
      let inDouble = false;
      let inSingle = false;
      for (let c = 0; c < codePart.length; c++) {
        const ch = codePart[c];
        if (ch === '"' && (c === 0 || codePart[c - 1] !== "\\")) {
          inDouble = !inDouble;
        } else if (ch === "'" && (c === 0 || codePart[c - 1] !== "\\")) {
          inSingle = !inSingle;
        }
      }
      if (inDouble) {
        const range = new vscode4.Range(i, 0, i, lineText.length);
        diagnostics.push(new vscode4.Diagnostic(
          range,
          'Unclosed double quote (") in string literal.',
          vscode4.DiagnosticSeverity.Error
        ));
      }
      if (inSingle) {
        const range = new vscode4.Range(i, 0, i, lineText.length);
        diagnostics.push(new vscode4.Diagnostic(
          range,
          "Unclosed single quote (') in string literal.",
          vscode4.DiagnosticSeverity.Error
        ));
      }
      if (/^\s*set\s+abc\s*=/i.test(codePart) && !/^\s*Set\s+ABC\s*=/i.test(codePart)) {
        const range = new vscode4.Range(i, 0, i, lineText.length);
        diagnostics.push(new vscode4.Diagnostic(
          range,
          "Recommended casing is 'Set ABC = Main'.",
          vscode4.DiagnosticSeverity.Information
        ));
      }
    }
    this.diagnosticCollection.set(document.uri, diagnostics);
  }
  clear(document) {
    this.diagnosticCollection.delete(document.uri);
  }
};

// src/extension.ts
var plainTerminal;
function getPlainTerminal() {
  if (plainTerminal && !plainTerminal.exitStatus) {
    return plainTerminal;
  }
  plainTerminal = vscode5.window.createTerminal({
    name: "PLAIN Shell",
    iconPath: new vscode5.ThemeIcon("terminal")
  });
  return plainTerminal;
}
function activate(context) {
  const plainSelector = { language: "plain", scheme: "file" };
  context.subscriptions.push(
    vscode5.languages.registerCompletionItemProvider(
      plainSelector,
      new PlainCompletionProvider(),
      ".",
      " ",
      "("
    )
  );
  context.subscriptions.push(
    vscode5.languages.registerHoverProvider(plainSelector, new PlainHoverProvider())
  );
  context.subscriptions.push(
    vscode5.languages.registerDocumentSymbolProvider(plainSelector, new PlainDocumentSymbolProvider())
  );
  const diagProvider = new PlainDiagnosticProvider(context);
  if (vscode5.window.activeTextEditor) {
    diagProvider.updateDiagnostics(vscode5.window.activeTextEditor.document);
  }
  context.subscriptions.push(
    vscode5.workspace.onDidChangeTextDocument((e) => diagProvider.updateDiagnostics(e.document)),
    vscode5.workspace.onDidOpenTextDocument((doc) => diagProvider.updateDiagnostics(doc)),
    vscode5.workspace.onDidCloseTextDocument((doc) => diagProvider.clear(doc))
  );
  context.subscriptions.push(
    vscode5.languages.registerDocumentFormattingEditProvider(plainSelector, {
      provideDocumentFormattingEdits(document) {
        const edits = [];
        let indentLevel = 0;
        const indentStr = "    ";
        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          let trimmed = line.text.trim();
          if (trimmed.length === 0) continue;
          if (/^(end\b|otherwise\b|else\b)/i.test(trimmed)) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          const newText = indentStr.repeat(indentLevel) + trimmed;
          if (newText !== line.text) {
            edits.push(vscode5.TextEdit.replace(line.range, newText));
          }
          if (/^(def\b.*:|while\b.*:|if\b.*|function\b.*|repeat\b.*|for\s+each\b.*|to\b.*|otherwise\b|else\b)/i.test(trimmed)) {
            indentLevel++;
          }
        }
        return edits;
      }
    })
  );
  const runFileCmd = vscode5.commands.registerCommand("plain.runFile", () => {
    const editor = vscode5.window.activeTextEditor;
    if (!editor) {
      vscode5.window.showWarningMessage("No active PLAIN file to run.");
      return;
    }
    editor.document.save().then(() => {
      const filePath = editor.document.fileName;
      const term = getPlainTerminal();
      term.show();
      term.sendText(`plain "${filePath}"`);
    });
  });
  const startReplCmd = vscode5.commands.registerCommand("plain.startRepl", () => {
    const term = getPlainTerminal();
    term.show();
    term.sendText("plain");
  });
  const openInIdeCmd = vscode5.commands.registerCommand("plain.openInIde", () => {
    const editor = vscode5.window.activeTextEditor;
    const filePath = editor ? `"${editor.document.fileName}"` : "";
    const localAppData = process.env.LOCALAPPDATA || "";
    const idePath = path.join(localAppData, "PLAIN", "bin", "plain-ide.exe");
    const cp = require("child_process");
    if (fs.existsSync(idePath)) {
      cp.spawn(idePath, filePath ? [editor.document.fileName] : [], { detached: true, stdio: "ignore" }).unref();
      vscode5.window.showInformationMessage("Opened in PLAIN Code Studio Desktop IDE.");
    } else {
      cp.spawn("plain-ide", filePath ? [editor.document.fileName] : [], { detached: true, stdio: "ignore", shell: true }).unref();
    }
  });
  const cyberScanCmd = vscode5.commands.registerCommand("plain.runCyberScan", async () => {
    const host = await vscode5.window.showInputBox({
      prompt: "Enter target host/IP or URL to run PLAIN cybersecurity audit",
      value: "127.0.0.1"
    });
    if (!host) return;
    const term = getPlainTerminal();
    term.show();
    const script = `
import cyber
say "=== PLAIN Cybersecurity Audit ==="
ports = [21, 22, 80, 443, 8080]
open_ports = cyber.port_scan("${host}", ports)
say "Open Ports: " + str(open_ports)
say "Scan completed successfully!"
`;
    const tmpFile = path.join(process.env.TEMP || ".", `audit_${Date.now()}.plain`);
    fs.writeFileSync(tmpFile, script.trim(), "utf-8");
    term.sendText(`plain "${tmpFile}"`);
  });
  const showDocsCmd = vscode5.commands.registerCommand("plain.showDocs", () => {
    vscode5.env.openExternal(vscode5.Uri.parse("https://reuben123t.github.io/plain-lang/"));
  });
  const statusBar = vscode5.window.createStatusBarItem(vscode5.StatusBarAlignment.Right, 100);
  statusBar.text = "$(rocket) PLAIN v1.3.0";
  statusBar.tooltip = "Click to open PLAIN quick actions";
  statusBar.command = "plain.showMenu";
  statusBar.show();
  const showMenuCmd = vscode5.commands.registerCommand("plain.showMenu", async () => {
    const choice = await vscode5.window.showQuickPick([
      { label: "$(play) Run Current File", description: "Execute active .plain file with plain CLI", action: "plain.runFile" },
      { label: "$(terminal) Launch PLAIN Interactive REPL", description: "Start interactive terminal shell", action: "plain.startRepl" },
      { label: "$(shield) Run Cybersecurity Audit", description: "Scan ports and analyze host security", action: "plain.runCyberScan" },
      { label: "$(window) Open in PLAIN Code Studio (Native IDE)", description: "Launch standalone desktop IDE", action: "plain.openInIde" },
      { label: "$(book) View Language Documentation", description: "Open online standard library docs", action: "plain.showDocs" }
    ], {
      placeHolder: "PLAIN Language Tools & Actions"
    });
    if (choice && choice.action) {
      vscode5.commands.executeCommand(choice.action);
    }
  });
  context.subscriptions.push(
    runFileCmd,
    startReplCmd,
    openInIdeCmd,
    cyberScanCmd,
    showDocsCmd,
    showMenuCmd,
    statusBar
  );
}
function deactivate() {
  if (plainTerminal) {
    plainTerminal.dispose();
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
