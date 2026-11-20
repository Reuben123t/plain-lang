import * as monaco from "monaco-editor";
import { DEFAULT_SETTINGS, type SessionDocument, type Settings } from "../shared/contracts";
import { preserveDocumentContent } from "./documents";
import { DARK_THEME, LANGUAGE_ID, LIGHT_THEME, LanguageService, registerLanguage, type DiagnosticSummary } from "./language";

export type { EditorDocument } from "./documents";
export type { DiagnosticSummary } from "./language";
export interface CursorPosition { line: number; column: number }
export interface EditorOptions {
  settings?: Partial<Settings>;
  theme?: "dark" | "light";
  /** Quiet time after a model edit before publishing fresh diagnostics. */
  analysisDelay?: number;
}

type ModelEntry = {
  model: monaco.editor.ITextModel;
  document: SessionDocument;
  encoding: string;
  view: monaco.editor.ICodeEditorViewState | null;
  subscription: monaco.IDisposable;
};
let editorSequence = 0;

export class EditorController {
  private readonly editor: monaco.editor.IStandaloneCodeEditor;
  private readonly language: LanguageService;
  private readonly scheme = `plain-editor-${++editorSequence}`;
  private readonly models = new Map<string, ModelEntry>();
  private readonly changeListeners = new Set<(content: string) => void>();
  private readonly cursorListeners = new Set<(position: CursorPosition) => void>();
  private readonly diagnosticListeners = new Set<(diagnostics: DiagnosticSummary[]) => void>();
  private readonly subscriptions: monaco.IDisposable[] = [];
  private settings: Settings;
  private activeId?: string;
  private diagnostics: DiagnosticSummary[] = [];
  private muted = false;
  private disposed = false;

  constructor(container: HTMLElement, options: EditorOptions = {}) {
    registerLanguage();
    this.settings = { ...DEFAULT_SETTINGS, ...options.settings };
    const theme = options.theme ?? (this.settings.theme === "system" ? (globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light") : this.settings.theme);
    this.editor = monaco.editor.create(container, {
      model: null, theme: theme === "dark" ? DARK_THEME : LIGHT_THEME,
      ariaLabel: "Plain code editor", automaticLayout: true, editContext: false,
      fontFamily: '"Cascadia Code", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
      fontSize: this.settings.fontSize, lineHeight: Math.round(this.settings.fontSize * 1.65),
      tabSize: this.settings.tabSize, insertSpaces: true, detectIndentation: false,
      wordWrap: this.settings.wordWrap ? "on" : "off", minimap: { enabled: this.settings.minimap },
      padding: { top: 22, bottom: 24 }, lineNumbersMinChars: 4,
      scrollBeyondLastLine: false, smoothScrolling: true, roundedSelection: true,
      renderLineHighlight: "all", renderWhitespace: "selection", folding: true,
      bracketPairColorization: { enabled: true }, guides: { indentation: true, bracketPairs: false },
      overviewRulerBorder: false, hideCursorInOverviewRuler: true,
      cursorBlinking: "smooth", cursorSmoothCaretAnimation: "off",
      fixedOverflowWidgets: true, contextmenu: true,
      quickSuggestions: { other: true, strings: false, comments: false },
      suggestOnTriggerCharacters: true, wordBasedSuggestions: "off", parameterHints: { enabled: true },
      unicodeHighlight: { ambiguousCharacters: false, invisibleCharacters: true },
      scrollbar: { verticalScrollbarSize: 9, horizontalScrollbarSize: 9, useShadows: false },
      accessibilitySupport: "auto"
    });
    this.language = new LanguageService(this.scheme, (diagnostics) => {
      this.diagnostics = diagnostics;
      for (const listener of this.diagnosticListeners) listener(diagnostics.map((diagnostic) => ({ ...diagnostic })));
    }, options.analysisDelay);
    this.subscriptions.push(this.editor.onDidChangeCursorPosition((event) => {
      if (this.muted || !this.activeId) return;
      for (const listener of this.cursorListeners) listener({ line: event.position.lineNumber, column: event.position.column });
    }));
    this.editor.addAction({
      id: "plain.formatDocument", label: "Format Plain Document",
      keybindings: [monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF],
      contextMenuGroupId: "1_modification", contextMenuOrder: 1.3,
      run: () => this.format()
    });
  }

  /** Select/create a persistent model. Opening a tab does not count as an edit. */
  open(document: SessionDocument): void {
    if (this.disposed) return;
    this.saveView();
    let entry = this.models.get(document.id);
    this.muted = true;
    try {
      if (!entry) {
        const uri = monaco.Uri.from({ scheme: this.scheme, path: `/${encodeURIComponent(document.id)}/${encodeURIComponent(document.name)}` });
        const model = monaco.editor.createModel(document.content, LANGUAGE_ID, uri);
        model.updateOptions({ tabSize: this.settings.tabSize, insertSpaces: true });
        entry = { model, document: { ...document }, encoding: document.content, view: null, subscription: { dispose() {} } };
        const owned = entry;
        entry.subscription = model.onDidChangeContent(() => {
          this.language.changed(model);
          if (this.muted) return;
          owned.document.content = preserveDocumentContent(model.getValue(), owned.encoding);
          if (this.activeId === owned.document.id) for (const listener of this.changeListeners) listener(owned.document.content);
        });
        this.models.set(document.id, entry);
      } else {
        const current = preserveDocumentContent(entry.model.getValue(), entry.encoding);
        // Apply explicit external replacements/reloads, but never reset undo on ordinary tab switches/saves.
        if (current !== document.content) {
          this.replaceContent(entry.model, document.content);
          entry.encoding = document.content;
        } else if (entry.document.version !== document.version) entry.encoding = document.content;
        entry.document = { ...document };
      }
      this.activeId = document.id;
      this.editor.setModel(entry.model);
      if (entry.view) this.editor.restoreViewState(entry.view);
      this.language.track(entry.model, document);
    } finally { this.muted = false; }
    this.emitCursor();
  }

  private saveView(): void {
    const current = this.activeId ? this.models.get(this.activeId) : undefined;
    if (current) current.view = this.editor.saveViewState();
  }

  private replaceContent(model: monaco.editor.ITextModel, content: string): void {
    const body = content.startsWith("\uFEFF") ? content.slice(1) : content;
    const ending = /\r\n|\n|\r/.exec(body)?.[0];
    const eol = ending === "\r\n" ? monaco.editor.EndOfLineSequence.CRLF : ending ? monaco.editor.EndOfLineSequence.LF : undefined;
    // Preserve the undo history and the saved tab view; setValue would discard both.
    model.pushStackElement();
    if (eol !== undefined && model.getEndOfLineSequence() !== eol) model.pushEOL(eol);
    const text = body.replace(/\r\n|\r|\n/g, model.getEOL());
    if (model.getValue() !== text) {
      model.pushEditOperations(null, [{ range: model.getFullModelRange(), text }], () => null);
    }
    model.pushStackElement();
  }

  getValue(): string {
    const current = this.activeId ? this.models.get(this.activeId) : undefined;
    return current ? preserveDocumentContent(current.model.getValue(), current.encoding) : "";
  }

  close(id: string): void {
    const entry = this.models.get(id);
    if (!entry || this.disposed) return;
    if (this.activeId === id) {
      this.saveView();
      this.activeId = undefined;
      this.editor.setModel(null);
    }
    this.language.untrack(entry.model);
    entry.subscription.dispose();
    entry.model.dispose();
    this.models.delete(id);
  }

  setTheme(theme: "dark" | "light"): void {
    if (!this.disposed) monaco.editor.setTheme(theme === "dark" ? DARK_THEME : LIGHT_THEME);
  }

  updateSettings(settings: Partial<Settings>): void {
    if (this.disposed) return;
    this.settings = { ...this.settings, ...settings };
    this.editor.updateOptions({
      fontSize: this.settings.fontSize, lineHeight: Math.round(this.settings.fontSize * 1.65),
      tabSize: this.settings.tabSize, insertSpaces: true, detectIndentation: false,
      wordWrap: this.settings.wordWrap ? "on" : "off", minimap: { enabled: this.settings.minimap }
    });
    for (const entry of this.models.values()) entry.model.updateOptions({ tabSize: this.settings.tabSize, insertSpaces: true });
    if (settings.theme) this.setTheme(settings.theme === "system" ? (globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light") : settings.theme);
  }

  focus(): void { if (!this.disposed) this.editor.focus(); }
  layout(): void { if (!this.disposed) this.editor.layout(); }
  find(): void { if (!this.disposed && this.activeId) { this.focus(); void this.editor.getAction("actions.find")?.run(); } }
  replace(): void { if (!this.disposed && this.activeId) { this.focus(); void this.editor.getAction("editor.action.startFindReplaceAction")?.run(); } }
  async format(): Promise<void> { if (!this.disposed && this.activeId) await this.editor.getAction("editor.action.formatDocument")?.run(); }

  /** Navigate problem/runtime locations; accepts one-based UTF-16 coordinates. */
  reveal(line: number, column: number): void {
    const model = this.editor.getModel();
    if (this.disposed || !model) return;
    const at = model.validatePosition({ lineNumber: Number.isFinite(line) ? Math.max(1, Math.trunc(line)) : 1, column: Number.isFinite(column) ? Math.max(1, Math.trunc(column)) : 1 });
    this.editor.setPosition(at);
    this.editor.revealPositionInCenterIfOutsideViewport(at);
    this.focus();
  }

  onChange(listener: (content: string) => void): () => void {
    this.changeListeners.add(listener);
    return () => this.changeListeners.delete(listener);
  }

  onCursor(listener: (position: CursorPosition) => void): () => void {
    this.cursorListeners.add(listener);
    const at = this.editor.getPosition();
    if (at && this.activeId) listener({ line: at.lineNumber, column: at.column });
    return () => this.cursorListeners.delete(listener);
  }

  onDiagnostics(listener: (diagnostics: DiagnosticSummary[]) => void): () => void {
    this.diagnosticListeners.add(listener);
    listener(this.diagnostics.map((diagnostic) => ({ ...diagnostic })));
    return () => this.diagnosticListeners.delete(listener);
  }

  private emitCursor(): void {
    const at = this.editor.getPosition();
    if (at) for (const listener of this.cursorListeners) listener({ line: at.lineNumber, column: at.column });
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.changeListeners.clear();
    this.cursorListeners.clear();
    this.diagnosticListeners.clear();
    for (const subscription of this.subscriptions) subscription.dispose();
    this.language.dispose();
    this.editor.setModel(null);
    for (const entry of this.models.values()) { entry.subscription.dispose(); entry.model.dispose(); }
    this.models.clear();
    this.editor.dispose();
  }
}

export function createEditor(container: HTMLElement, options?: EditorOptions): EditorController {
  return new EditorController(container, options);
}
