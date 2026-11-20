import * as monaco from "monaco-editor";
import grammar from "../../../editors/vscode/syntaxes/plain.tmLanguage.json";
import { getBuiltin, getBuiltinNames } from "../../../src/tooling/catalog";
import type { AnalysisDiagnostic, AnalysisRange } from "../../../src/tooling/analyzer";
import type { SessionDocument } from "../shared/contracts";
import type { AnalysisWorkerRequest, AnalysisWorkerResponse, WorkerOperation, WorkerResults } from "./analysis-worker";

export const LANGUAGE_ID = "plain";
export const DARK_THEME = "plain-dark";
export const LIGHT_THEME = "plain-light";
export { BUILTIN_CATALOG } from "../../../src/tooling/catalog";

export interface DiagnosticSummary {
  documentId: string;
  name: string;
  path?: string;
  severity: "error" | "warning" | "information";
  message: string;
  code: string;
  /** One-based UTF-16 locations, matching Monaco and the status bar. */
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

const markerOwner = "plain-analysis";
let registered = false;

/** Translate the shared TextMate groups; do not resurrect the old VS Code builtin dictionary. */
function grammarWords(group: "keywords" | "constants" | "operators"): string[] {
  const patterns = grammar.repository[group].patterns;
  return [...new Set(patterns.flatMap((pattern) => {
    const words = /\(\?i:([^)]*)\)/.exec(pattern.match)?.[1].split("|") ?? [];
    return words.filter((word) => /^[a-z]+$/.test(word));
  }))];
}

export function registerLanguage(): void {
  if (registered) return;
  registered = true;
  globalThis.MonacoEnvironment = {
    ...globalThis.MonacoEnvironment,
    getWorker: () => new Worker("./editor.worker.js")
  };
  monaco.languages.register({ id: LANGUAGE_ID, extensions: [".plain"], aliases: [grammar.name, "plain"], mimetypes: ["text/x-plain"] });
  monaco.languages.setLanguageConfiguration(LANGUAGE_ID, {
    comments: { lineComment: "#" },
    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
    autoClosingPairs: [
      { open: "{", close: "}" }, { open: "[", close: "]" }, { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string", "comment"] }, { open: "'", close: "'", notIn: ["string", "comment"] }
    ],
    surroundingPairs: [
      { open: "{", close: "}" }, { open: "[", close: "]" }, { open: "(", close: ")" }, { open: '"', close: '"' }, { open: "'", close: "'" }
    ],
    wordPattern: /[A-Za-z_][A-Za-z0-9_]*/g,
    indentationRules: {
      increaseIndentPattern: /^\s*(?:if|def|fn|function|to|for|while|repeat|else|elif|otherwise)\b.*$/i,
      decreaseIndentPattern: /^\s*(?:end|else|elif|otherwise)\b/i
    },
    folding: { markers: { start: /^\s*#\s*region\b/i, end: /^\s*#\s*endregion\b/i } }
  });
  monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, {
    // source.plain scopes from the canonical TextMate grammar, adapted to Monarch states.
    tokenPostfix: ".plain", ignoreCase: true,
    keywords: [...grammarWords("keywords"), "elif"],
    constants: grammarWords("constants"),
    operators: grammarWords("operators"),
    builtins: getBuiltinNames(),
    tokenizer: {
      root: [
        [/#.*$/, "comment"],
        [/(\b(?:def|fn|function|to))(\s+)([A-Za-z_]\w*)/, ["keyword", "white", "entity.name.function"]],
        [/"/, { token: "string.quote", next: "@doubleString" }],
        [/'/, { token: "string.quote", next: "@singleString" }],
        [/\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, "number"],
        [/[A-Za-z_]\w*/, { cases: { "@keywords": "keyword", "@constants": "constant", "@operators": "operator", "@builtins": "support.function", "@default": "identifier" } }],
        [/[{}()[\]]/, "@brackets"],
        [/[,:.]/, "delimiter"],
        [/[+\-*\/%=<>!|]+/, "operator"],
        [/\s+/, "white"]
      ],
      doubleString: [[/\\./, "string.escape"], [/[^"\\]+$/, { token: "string", next: "@pop" }], [/[^"\\]+/, "string"], [/"/, { token: "string.quote", next: "@pop" }], [/$/, "string", "@pop"]],
      singleString: [[/\\./, "string.escape"], [/[^'\\]+$/, { token: "string", next: "@pop" }], [/[^'\\]+/, "string"], [/'/, { token: "string.quote", next: "@pop" }], [/$/, "string", "@pop"]]
    }
  });
  for (const dark of [true, false]) {
    monaco.editor.defineTheme(dark ? DARK_THEME : LIGHT_THEME, {
      base: dark ? "vs-dark" : "vs", inherit: true,
      rules: [
        { token: "comment", foreground: dark ? "78828f" : "7c8576", fontStyle: "italic" },
        { token: "keyword", foreground: dark ? "c8a8ef" : "7550a3" },
        { token: "string", foreground: dark ? "b8e986" : "507529" },
        { token: "number", foreground: dark ? "e7be87" : "92632d" },
        { token: "constant", foreground: dark ? "e7be87" : "92632d" },
        { token: "support.function", foreground: dark ? "9ccbdc" : "296d83" },
        { token: "entity.name.function", foreground: dark ? "b8e986" : "507529" },
        { token: "operator", foreground: dark ? "b1bbc8" : "596452" }
      ],
      colors: {
        "editor.background": dark ? "#101216" : "#fafbf8",
        "editor.foreground": dark ? "#d7dce5" : "#30382d",
        "editorCursor.foreground": dark ? "#b8e986" : "#648e38",
        "editor.selectionBackground": dark ? "#b8e98625" : "#a2bd793c",
        "editor.inactiveSelectionBackground": dark ? "#b8e98612" : "#a2bd791c",
        "editor.lineHighlightBackground": dark ? "#ffffff04" : "#33432205",
        "editorLineNumber.foreground": dark ? "#525b68" : "#a0a699",
        "editorLineNumber.activeForeground": dark ? "#b8e986" : "#648e38",
        "editorIndentGuide.background1": dark ? "#22282f" : "#e3e7dc",
        "editorIndentGuide.activeBackground1": dark ? "#404b40" : "#a5b093",
        "editorWidget.background": dark ? "#191e24" : "#ffffff",
        "editorWidget.border": dark ? "#30383f" : "#d9dfcf",
        "editorSuggestWidget.selectedBackground": dark ? "#b8e98618" : "#e9f0dc",
        "editorSuggestWidget.highlightForeground": dark ? "#b8e986" : "#507529",
        "editorHoverWidget.background": dark ? "#191e24" : "#ffffff",
        "editorHoverWidget.border": dark ? "#30383f" : "#d9dfcf",
        "editorGutter.background": dark ? "#101216" : "#fafbf8",
        "focusBorder": dark ? "#b8e98666" : "#648e3866",
        "scrollbarSlider.background": dark ? "#78828f22" : "#7c857622",
        "scrollbarSlider.hoverBackground": dark ? "#78828f44" : "#7c857644",
        "editorOverviewRuler.border": "#00000000"
      }
    });
  }
}

function range(value: AnalysisRange): monaco.IRange {
  return { startLineNumber: value.start.line + 1, startColumn: value.start.character + 1, endLineNumber: value.end.line + 1, endColumn: value.end.character + 1 };
}
const position = (value: monaco.Position) => ({ line: value.lineNumber - 1, character: value.column - 1 });

type TrackedModel = { model: monaco.editor.ITextModel; document: SessionDocument; timer?: ReturnType<typeof setTimeout>; diagnostics: DiagnosticSummary[] };
type Pending = { uri: string; finish: (response?: AnalysisWorkerResponse, error?: Error) => void };

/** Model-scoped providers and an isolated worker; no analyzer runs on the renderer. */
export class LanguageService implements monaco.IDisposable {
  private worker?: Worker;
  private failure?: string;
  private disposed = false;
  private nextId = 0;
  private tracked = new Map<string, TrackedModel>();
  private pending = new Map<number, Pending>();
  private subscriptions: monaco.IDisposable[] = [];

  constructor(scheme: string, private notify: (diagnostics: DiagnosticSummary[]) => void, private delay = 220) {
    registerLanguage();
    try {
      this.worker = new Worker("./analysis-worker.js");
      this.worker.onmessage = (event: MessageEvent<AnalysisWorkerResponse>) => this.pending.get(event.data.id)?.finish(event.data);
      this.worker.onerror = (event) => { event.preventDefault(); this.failed(event.message || "The language analysis worker could not start."); };
      this.worker.onmessageerror = () => this.failed("The language analysis worker returned an unreadable response.");
    } catch (error) { this.failed(error instanceof Error ? error.message : String(error)); }
    const selector = { language: LANGUAGE_ID, scheme };
    const query = <K extends WorkerOperation>(model: monaco.editor.ITextModel, operation: K, extra: Partial<AnalysisWorkerRequest> = {}, token?: monaco.CancellationToken) =>
      this.request(model, operation, extra, token).catch(() => undefined);
    this.subscriptions.push(
      monaco.languages.registerCompletionItemProvider(selector, {
        triggerCharacters: ["."],
        provideCompletionItems: async (model, at, _context, token) => {
          const word = model.getWordUntilPosition(at);
          const replacement = { startLineNumber: at.lineNumber, endLineNumber: at.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
          const entries = await query(model, "completion", { position: position(at) }, token);
          return { suggestions: (entries ?? []).map((entry) => ({
            label: entry.name, insertText: entry.name, detail: entry.detail, documentation: entry.documentation,
            kind: entry.kind === "function" ? monaco.languages.CompletionItemKind.Function : entry.kind === "import" ? monaco.languages.CompletionItemKind.Module : monaco.languages.CompletionItemKind.Variable,
            range: replacement, sortText: `${entry.kind === "function" ? "1" : "0"}_${entry.name.toLowerCase()}`
          })) };
        }
      }),
      monaco.languages.registerHoverProvider(selector, {
        provideHover: async (model, at, token) => {
          const info = await query(model, "hover", { position: position(at) }, token);
          return info ? { range: range(info.range), contents: [{ value: `\`\`\`plain\n${info.code}\n\`\`\`` }, ...(info.description ? [{ value: info.description, isTrusted: false }] : [])] } : undefined;
        }
      }),
      monaco.languages.registerSignatureHelpProvider(selector, {
        signatureHelpTriggerCharacters: ["(", ","], signatureHelpRetriggerCharacters: [","] ,
        provideSignatureHelp: async (model, at, token) => {
          const info = await query(model, "signature", { position: position(at) }, token);
          return info ? {
            value: { signatures: [{ label: info.signature, documentation: info.description, parameters: info.parameters.map((label) => ({ label })) }], activeSignature: 0, activeParameter: Math.min(info.activeParameter, Math.max(0, info.parameters.length - 1)) },
            dispose() {}
          } : undefined;
        }
      }),
      monaco.languages.registerDefinitionProvider(selector, {
        provideDefinition: async (model, at, token) => {
          const value = await query(model, "definition", { position: position(at) }, token);
          return value ? { uri: model.uri, range: range(value) } : undefined;
        }
      }),
      monaco.languages.registerReferenceProvider(selector, {
        provideReferences: async (model, at, context, token) => (await query(model, "references", { position: position(at), includeDeclaration: context.includeDeclaration }, token) ?? []).map((value) => ({ uri: model.uri, range: range(value) }))
      }),
      monaco.languages.registerRenameProvider(selector, {
        resolveRenameLocation: async (model, at, token) => {
          const value = await query(model, "prepareRename", { position: position(at) }, token);
          return value ? { range: range(value.range), text: value.text } : { range: model.getWordAtPosition(at) ? new monaco.Range(at.lineNumber, model.getWordAtPosition(at)!.startColumn, at.lineNumber, model.getWordAtPosition(at)!.endColumn) : new monaco.Range(at.lineNumber, at.column, at.lineNumber, at.column), text: "", rejectReason: "Only same-document declarations and references can be renamed." };
        },
        provideRenameEdits: async (model, at, newName, token) => {
          const versionId = model.getVersionId();
          try {
            const edits = await this.request(model, "rename", { position: position(at), newName }, token);
            return { edits: (edits ?? []).map((edit) => ({ resource: model.uri, versionId, textEdit: { range: range(edit.range), text: edit.newText } })) };
          } catch (error) { return { edits: [], rejectReason: error instanceof Error ? error.message : String(error) }; }
        }
      }),
      monaco.languages.registerDocumentSymbolProvider(selector, {
        provideDocumentSymbols: async (model, token) => (await query(model, "symbols", {}, token) ?? []).map((symbol) => ({
          name: symbol.name, detail: symbol.kind === "function" ? `(${(symbol.parameters ?? []).join(", ")})` : symbol.kind,
          kind: symbol.kind === "function" ? monaco.languages.SymbolKind.Function : symbol.kind === "import" ? monaco.languages.SymbolKind.Module : monaco.languages.SymbolKind.Variable,
          tags: [], range: range(symbol.range), selectionRange: range(symbol.selectionRange)
        }))
      }),
      monaco.languages.registerFoldingRangeProvider(selector, {
        provideFoldingRanges: async (model, _context, token) => (await query(model, "folds", {}, token) ?? []).map((fold) => ({ start: fold.startLine + 1, end: fold.endLine + 1, kind: fold.kind === "comment" ? monaco.languages.FoldingRangeKind.Comment : monaco.languages.FoldingRangeKind.Region }))
      }),
      monaco.languages.registerDocumentFormattingEditProvider(selector, {
        provideDocumentFormattingEdits: async (model, options, token) => {
          const text = await query(model, "format", { formatOptions: options }, token);
          return text === undefined || text === model.getValue() ? [] : [{ range: model.getFullModelRange(), text }];
        }
      })
    );
  }

  track(model: monaco.editor.ITextModel, document: SessionDocument): void {
    const key = model.uri.toString();
    const existing = this.tracked.get(key);
    if (existing) {
      const renamed = existing.document.path !== document.path || existing.document.name !== document.name;
      existing.document = { ...document };
      if (renamed) this.changed(model);
      return;
    }
    this.tracked.set(key, { model, document: { ...document }, diagnostics: [] });
    this.changed(model, true);
  }

  changed(model: monaco.editor.ITextModel, immediate = false): void {
    const key = model.uri.toString();
    const entry = this.tracked.get(key);
    if (!entry || this.disposed) return;
    clearTimeout(entry.timer);
    this.cancelRequests(key);
    entry.diagnostics = [];
    monaco.editor.setModelMarkers(model, markerOwner, []);
    if (this.failure) { this.publishFailure(entry); return; }
    this.emit();
    entry.timer = setTimeout(() => {
      entry.timer = undefined;
      void this.request(model, "analyze").then((value) => {
        if (!value || this.disposed || this.tracked.get(key) !== entry) return;
        this.publish(entry, value.diagnostics);
      }).catch((error) => {
        if (this.tracked.get(key) !== entry || model.isDisposed()) return;
        this.publishFailure(entry, error instanceof Error ? error.message : String(error));
      });
    }, immediate ? 0 : Math.max(0, this.delay));
  }

  untrack(model: monaco.editor.ITextModel): void {
    const key = model.uri.toString();
    const entry = this.tracked.get(key);
    clearTimeout(entry?.timer);
    this.tracked.delete(key);
    this.cancelRequests(key);
    if (!model.isDisposed()) monaco.editor.setModelMarkers(model, markerOwner, []);
    if (this.worker) this.worker.postMessage({ id: ++this.nextId, operation: "close", uri: key, version: model.getVersionId(), source: "" } satisfies AnalysisWorkerRequest);
    this.emit();
  }

  private request<K extends WorkerOperation>(model: monaco.editor.ITextModel, operation: K, extra: Partial<AnalysisWorkerRequest> = {}, token?: monaco.CancellationToken): Promise<WorkerResults[K] | undefined> {
    if (this.disposed || model.isDisposed() || token?.isCancellationRequested) return Promise.resolve(undefined);
    const entry = this.tracked.get(model.uri.toString());
    if (!entry) return Promise.resolve(undefined);
    if (!this.worker || this.failure) return Promise.reject(new Error(this.failure ?? "Language analysis is unavailable."));
    const id = ++this.nextId;
    const version = model.getVersionId();
    const uri = model.uri.toString();
    return new Promise((resolve, reject) => {
      let cancellation: monaco.IDisposable | undefined;
      const timer = setTimeout(() => finish(undefined, new Error("Language analysis timed out.")), 30_000);
      const finish = (response?: AnalysisWorkerResponse, error?: Error) => {
        if (!this.pending.delete(id)) return;
        clearTimeout(timer);
        cancellation?.dispose();
        if (this.disposed || model.isDisposed() || this.tracked.get(uri) !== entry || model.getVersionId() !== version || token?.isCancellationRequested) resolve(undefined);
        else if (error || response?.error) reject(error ?? new Error(response!.error));
        else if (response && (response.uri !== uri || response.version !== version || response.operation !== operation)) resolve(undefined);
        else resolve(response?.result as WorkerResults[K] | undefined);
      };
      this.pending.set(id, { uri, finish });
      cancellation = token?.onCancellationRequested(() => finish());
      if (token?.isCancellationRequested) { finish(); return; }
      try {
        this.worker!.postMessage({ ...extra, id, operation, uri, version, source: model.getValue(), filename: entry.document.path ?? entry.document.name } satisfies AnalysisWorkerRequest);
      } catch (error) { finish(undefined, error instanceof Error ? error : new Error(String(error))); }
    });
  }

  private publish(entry: TrackedModel, diagnostics: AnalysisDiagnostic[]): void {
    if (entry.model.isDisposed()) return;
    entry.diagnostics = diagnostics.map((diagnostic) => ({
      documentId: entry.document.id, name: entry.document.name, path: entry.document.path,
      severity: diagnostic.severity, message: diagnostic.message, code: diagnostic.code,
      line: diagnostic.range.start.line + 1, column: diagnostic.range.start.character + 1,
      endLine: diagnostic.range.end.line + 1, endColumn: diagnostic.range.end.character + 1
    }));
    monaco.editor.setModelMarkers(entry.model, markerOwner, diagnostics.map((diagnostic) => ({
      ...range(diagnostic.range), severity: diagnostic.severity === "error" ? monaco.MarkerSeverity.Error : diagnostic.severity === "warning" ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Info,
      message: diagnostic.message + (diagnostic.suggestion ? `\n${diagnostic.suggestion}` : ""), code: diagnostic.code, source: "Plain"
    })));
    this.emit();
  }

  private publishFailure(entry: TrackedModel, message = this.failure ?? "Language analysis is unavailable."): void {
    entry.diagnostics = [{ documentId: entry.document.id, name: entry.document.name, path: entry.document.path, severity: "warning", message, code: "AnalysisWorkerError", line: 1, column: 1, endLine: 1, endColumn: 1 }];
    this.emit();
  }

  private failed(message: string): void {
    this.failure = message;
    this.worker?.terminate();
    this.worker = undefined;
    for (const pending of [...this.pending.values()]) pending.finish(undefined, new Error(message));
    for (const entry of this.tracked.values()) { clearTimeout(entry.timer); this.publishFailure(entry); }
  }

  private cancelRequests(uri: string): void {
    for (const pending of [...this.pending.values()]) if (pending.uri === uri) pending.finish();
  }

  private emit(): void { this.notify([...this.tracked.values()].flatMap((entry) => entry.diagnostics.map((diagnostic) => ({ ...diagnostic })))); }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const entry of this.tracked.values()) { clearTimeout(entry.timer); if (!entry.model.isDisposed()) monaco.editor.setModelMarkers(entry.model, markerOwner, []); }
    for (const pending of [...this.pending.values()]) pending.finish();
    for (const subscription of this.subscriptions) subscription.dispose();
    this.tracked.clear();
    this.worker?.terminate();
    this.worker = undefined;
    this.emit();
  }
}
