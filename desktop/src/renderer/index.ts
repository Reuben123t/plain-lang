import "./styles.css";
import { createEditor, type DiagnosticSummary, type EditorController } from "./editor";
import { DocumentStore } from "./documents";
import { icon } from "./icons";
import { EXAMPLES } from "../shared/examples";
import { DEFAULT_SETTINGS, type AppCommand, type Bootstrap, type DesktopBridge, type FileDocument, type RunSnapshot, type SessionDocument, type Settings } from "../shared/contracts";
import { BUILTIN_CATALOG } from "../../../src/tooling/catalog";

const $ = <T extends HTMLElement = HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));
const basename = (value: string) => value.split(/[\\/]/).pop() || value;
const native = !!window.plain;
let toastTimer: ReturnType<typeof setTimeout>;
function toast(message: string) {
  const element = $("#toast");
  element.textContent = message;
  element.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("visible"), 5000);
}
const previewBridge: DesktopBridge = {
  async bootstrap() { return { platform: "browser", version: "1.2.0", settings: DEFAULT_SETTINGS, recentFiles: [], recentWorkspaces: [], examples: EXAMPLES }; },
  async openFiles() { toast("File dialogs are available in the desktop app."); return []; },
  async readFile() { throw new Error("Local files are available in the desktop app."); },
  async openFolder() { toast("Open a folder in the desktop app to use the explorer."); return undefined; },
  async listDirectory() { return []; },
  async saveFile() { toast("Saving local files is available in the desktop app."); return undefined; },
  async confirmClose() { return "discard"; },
  async updateSettings(settings) { return settings; },
  async saveSession() {},
  async startRun() { toast("This is an interface preview. Run Plain locally in the desktop app."); return undefined; },
  async getRun() { throw new Error("No local runtime in the browser preview."); },
  async answerRun() {},
  async stopRun() { throw new Error("No active program."); },
  async closeWindow() {},
  onCommand() { return () => {}; },
  onOpenFiles() { return () => {}; }
};
const bridge = window.plain || previewBridge;
let boot: Bootstrap;
let settings: Settings;
let store: DocumentStore;
let editor: EditorController;
let workspace: string | undefined;
let activeView: "welcome" | "editor" | "examples" = "welcome";
let sidebar: "files" | "examples" | "reference" = "files";
let diagnostics: DiagnosticSummary[] = [];
let run: RunSnapshot | undefined;
let runDocumentId: string | undefined;
let polling: ReturnType<typeof setTimeout>;
let persistTimer: ReturnType<typeof setTimeout>;
let runStarting = false;
let closing = false;
let checkingExternal = false;
let outputPrefix = "";
let programArgs: string[] = [];
let commandModifier = "Ctrl";
const expanded = new Set<string>();
const directoryCache = new Map<string, Awaited<ReturnType<DesktopBridge["listDirectory"]>>>();

function button(action: string, label: string, image?: string, className = "") {
  return `<button class="${className}" data-action="${action}">${image ? icon(image) : ""}<span>${label}</span></button>`;
}

async function init() {
  boot = await bridge.bootstrap();
  settings = { ...DEFAULT_SETTINGS, ...boot.settings };
  commandModifier = boot.platform === "darwin" ? "⌘" : "Ctrl";
  workspace = boot.session?.workspace;
  store = new DocumentStore(boot.session?.documents || [], boot.session?.activeId);
  $("#app").innerHTML = `
    <a class="skip-link" href="#main-content">Skip to editor</a>
    <header class="titlebar">
      <button class="brand" data-action="welcome" aria-label="Plain Studio home" title="Plain Studio home"><span class="brand-mark">p<span>.</span></span><span>plain<span class="brand-sub">studio</span></span></button>
      <button class="global-search" data-action="palette" aria-label="Open command palette">${icon("search")}<span>Where will your next idea take you?</span><kbd>${commandModifier} K</kbd></button>
      <div class="titlebar-right"><span class="local-badge"><i></i>${native ? "Local workspace" : "Interface preview"}</span><button class="icon-button" data-action="settings" aria-label="Settings">${icon("sliders")}</button></div>
    </header>
    <div class="workbench">
      <nav class="activity-bar" aria-label="Main navigation">
        <div class="activity-top"><button class="activity active" data-sidebar="files" aria-label="Explorer" title="Explorer">${icon("files")}</button><button class="activity" data-sidebar="examples" aria-label="Example library" title="Example library">${icon("grid")}</button><button class="activity" data-sidebar="reference" aria-label="Language reference" title="Language reference">${icon("book")}</button></div>
        <div class="activity-bottom"><button class="activity" data-action="palette" aria-label="Command palette" title="Command palette">${icon("terminal")}</button><button class="activity" data-action="settings" aria-label="Settings" title="Settings">${icon("settings")}</button></div>
      </nav>
      <aside class="sidebar" aria-label="Workspace explorer"><div id="sidebar-content"></div><div class="sidebar-footer"><span class="runtime-dot"></span><div>Plain runtime<span>Included. Ready when you are.</span></div>${icon("check")}</div></aside>
      <div class="resize-handle sidebar-resize" role="separator" aria-label="Resize explorer" aria-orientation="vertical" tabindex="0"></div>
      <main class="main-area" id="main-content" tabindex="-1">
        <nav class="tabbar" aria-label="Open documents" id="tabs"></nav>
        <div class="editor-toolbar"><div id="breadcrumb"></div><div class="toolbar-actions"><button class="arguments-button" data-action="arguments" title="Set program arguments">${icon("sliders")}<span>Arguments</span></button><button class="icon-button" data-action="toggle-panel" aria-label="Toggle output panel" title="Toggle output panel">${icon("panel")}</button><span class="toolbar-divider"></span><button class="run-button" data-action="run" aria-label="Run current file (F5)" title="Run current file (F5)">${icon("play")}<span>Run</span><kbd>F5</kbd></button><button class="icon-button stop-button" data-action="stop" aria-label="Stop running program" title="Stop (Shift+F5)" disabled>${icon("stop")}</button></div></div>
        <section class="content-area"><div id="page-view"></div><div id="editor-container" aria-label="Plain source editor"></div></section>
        <div class="resize-handle panel-resize" role="separator" aria-label="Resize output panel" aria-orientation="horizontal" tabindex="0"></div>
        <section class="output-panel" aria-label="Program output"><header class="panel-header"><div class="panel-tabs"><button data-panel="output" class="active">${icon("terminal")}Output</button><button data-panel="problems">Problems <span id="problem-count">0</span></button></div><div class="panel-tools"><span id="run-status">Ready</span><button class="icon-button" data-action="copy-output" aria-label="Copy output" title="Copy output">${icon("copy")}</button><button class="icon-button" data-action="clear-output" aria-label="Clear output" title="Clear output">${icon("trash")}</button><button class="icon-button" data-action="toggle-panel" aria-label="Hide output panel">${icon("close")}</button></div></header><div id="output-body"><div class="output-placeholder">${icon("terminal")}<div>A little space for your ideas to speak.<span>Run a Plain file to see its output here.</span></div><kbd>F5</kbd></div></div><div id="problems-body" hidden></div><form id="input-form" hidden><label id="input-prompt" for="program-input">Program input</label><div><input id="program-input" autocomplete="off" maxlength="8192" placeholder="Type your answer…"><button type="submit">Send ${icon("arrow")}</button></div></form></section>
      </main>
    </div>
    <footer class="statusbar"><div><button data-action="palette" title="Open command palette">${icon("terminal")}<span>Plain Studio</span></button><span class="status-divider"></span><span id="workspace-status">${workspace ? escape(basename(workspace)) : "No folder opened"}</span></div><div><button id="diagnostic-status" data-action="problems">${icon("error")}<span>0</span>${icon("warning")}<span>0</span></button><span id="cursor-status">Ln 1, Col 1</span><span>UTF-8</span><span class="language-status"><i></i>Plain</span><button data-action="settings" title="Editor settings">${icon("settings")}</button></div></footer>`;
  applyTheme();
  editor = createEditor($("#editor-container"), { settings, theme: resolvedTheme() });
  editor.onChange((content) => {
    if (!store.active) return;
    store.update(store.active.id, content);
    renderTabs();
    persist();
  });
  editor.onCursor(({ line, column }) => { $("#cursor-status").textContent = `Ln ${line}, Col ${column}`; });
  editor.onDiagnostics((issues) => { diagnostics = issues; renderProblems(); });
  document.addEventListener("click", onClick);
  document.addEventListener("keydown", onKeydown);
  $("#tabs").addEventListener("keydown", onTabKeydown);
  $("#input-form").addEventListener("submit", answerInput);
  bridge.onCommand((command) => { void dispatch(command); });
  bridge.onOpenFiles((files) => files.forEach(openDocument));
  window.addEventListener("resize", () => editor.layout());
  window.addEventListener("focus", () => { void checkExternalChanges(); });
  window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { if (settings.theme === "system") applyTheme(); });
  setupResizer($(".sidebar-resize"), "--sidebar-width", 180, 420, "x");
  setupResizer($(".panel-resize"), "--panel-height", 130, 500, "y");
  if (boot.session?.sidebarWidth) document.documentElement.style.setProperty("--sidebar-width", `${boot.session.sidebarWidth}px`);
  if (boot.session?.panelHeight) document.documentElement.style.setProperty("--panel-height", `${boot.session.panelHeight}px`);
  if (store.active) { activeView = "editor"; editor.open(store.active); }
  renderTabs(); renderView(); await renderSidebar();
  if (store.documents.some((document) => document.dirty)) toast("Your unsaved work has been recovered. Save it when you’re ready.");
  document.documentElement.dataset.studioReady = "true";
}

function resolvedTheme(): "light" | "dark" { return settings.theme === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : settings.theme; }
function applyTheme() { document.documentElement.dataset.theme = resolvedTheme(); editor?.setTheme(resolvedTheme()); }

function persist(immediate = false) {
  clearTimeout(persistTimer);
  const save = () => bridge.saveSession({ workspace, documents: store.snapshot(), activeId: store.activeId, sidebarWidth: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width")), panelHeight: parseInt(getComputedStyle(document.documentElement).getPropertyValue("--panel-height")) }).catch((error) => toast(`Recovery could not be saved: ${error.message}`));
  if (immediate) return save();
  persistTimer = setTimeout(() => { void save(); }, 600);
}

function renderTabs() {
  $("#tabs").innerHTML = `<button class="editor-tab welcome-tab ${activeView === "welcome" ? "selected" : ""}" data-action="welcome" aria-pressed="${activeView === "welcome"}">${icon("home")}<span>Welcome</span></button>` + store.documents.map((document) => `<div class="editor-tab ${activeView === "editor" && store.activeId === document.id ? "selected" : ""}" role="presentation"><button data-document="${escape(document.id)}" aria-pressed="${activeView === "editor" && store.activeId === document.id}" title="${escape(document.path || document.name)}">${icon("code")}<span>${escape(document.name)}</span>${document.dirty ? '<span class="dirty-dot" aria-label="Unsaved changes"></span>' : ""}</button><button class="tab-close" data-close="${escape(document.id)}" aria-label="Close ${escape(document.name)}">${icon("close")}</button></div>`).join("") + `<button class="tab-add icon-button" data-action="new" aria-label="New Plain file" title="New file (${commandModifier}+N)">${icon("plus")}</button>`;
  document.title = `${store.active && activeView === "editor" ? `${store.active.dirty ? "● " : ""}${store.active.name} — ` : ""}Plain Studio`;
  $("#breadcrumb").innerHTML = activeView === "editor" && store.active ? `${icon("folder")}<span>${escape(workspace ? basename(workspace) : "Workspace")}</span>${icon("chevron")}<span class="current-file">${icon("code")}${escape(store.active.name)}</span>` : `${icon("home")}<span>${activeView === "examples" ? "Example library" : "Welcome to your studio"}</span>`;
}

function renderView() {
  $("#editor-container").hidden = activeView !== "editor";
  $("#page-view").hidden = activeView === "editor";
  $(".main-area").classList.toggle("welcome-mode", activeView !== "editor");
  if (activeView === "welcome") renderWelcome();
  if (activeView === "examples") renderExamples();
  renderTabs(); editor.layout();
}

function renderWelcome() {
  const recent = boot.recentFiles.slice(0, 3);
  $("#page-view").innerHTML = `<div class="welcome-page">
    <div class="welcome-topline"><span><span class="small-spark">✳</span> A LITTLE LESS SYNTAX. A LOT MORE POSSIBILITY.</span><span class="version-label">STUDIO / ${escape(boot.version)}</span></div>
    <div class="welcome-hero"><div class="hero-copy"><div class="eyebrow">YOUR IDEAS. IN YOUR LANGUAGE.</div><h1>Think it.<br>Write it in <em>Plain.</em></h1><p>A clear mind. A fresh page. Everything you need<br class="wide-break"> to turn your next “what if” into something real.</p><div class="hero-actions">${button("new", "Create a new file", "plus", "primary-button")}${button("open-folder", "Open a folder", "folder", "secondary-button")}</div><div class="hero-note">${icon("check")} Your code stays on your machine.</div></div>
      <div class="code-postcard"><div class="postcard-title"><span>${icon("code")} a_little_possibility.plain</span><span class="postcard-dot"></span></div><div class="postcard-code"><div><span class="line-number">1</span><span class="comment"># Good ideas start simply.</span></div><div><span class="line-number">2</span></div><div><span class="line-number">3</span><span class="keyword">set</span> possibility <span class="keyword">to</span> <span class="string">"endless"</span></div><div><span class="line-number">4</span><span class="keyword">say</span> <span class="string">"Hello, world!"</span></div><div><span class="line-number">5</span></div><div><span class="line-number">6</span><span class="comment"># Now make it yours.</span><span class="code-caret"></span></div></div><div class="postcard-bottom"><span><i></i> Readable by design</span><button data-example="hello" aria-label="Open Hello world example">Try it ${icon("arrow")}</button></div><span class="postcard-caption">Less ceremony. More creating.</span></div>
    </div>
    <section class="start-section"><div class="section-heading"><h2>Find your starting point<span>Make something small. See where it goes.</span></h2><button class="text-button" data-action="examples">All examples ${icon("arrow")}</button></div><div class="starter-grid"><button class="starter-card" data-example="hello"><span class="card-top"><span class="card-icon lime">${icon("bolt")}</span><span class="card-tag">THE FIRST STEP</span>${icon("arrow", "card-arrow")}</span><strong>Hello, possibility.</strong><p>A few lines are all it takes.<br>Meet your first Plain program.</p><span class="card-footer">Hello, world <span>01</span></span></button><button class="starter-card" data-example="conversation"><span class="card-top"><span class="card-icon lavender">${icon("terminal")}</span><span class="card-tag">A TWO-WAY STREET</span>${icon("arrow", "card-arrow")}</span><strong>Make it a conversation.</strong><p>Ask a question. Listen for an answer.<br>Bring your program to life.</p><span class="card-footer">Interactive input <span>02</span></span></button><button class="starter-card" data-action="reference"><span class="card-top"><span class="card-icon peach">${icon("book")}</span><span class="card-tag">KEEP EXPLORING</span>${icon("arrow", "card-arrow")}</span><strong>A language that clicks.</strong><p>Discover the building blocks.<br>Find the right words for your idea.</p><span class="card-footer">Language reference <span>03</span></span></button></div></section>
    <div class="welcome-bottom"><section class="recent-section"><h2>Pick up where you left off</h2>${recent.length ? recent.map((file) => `<button class="recent-file" data-recent="${escape(file)}">${icon("code")}<span>${escape(basename(file))}<small>${escape(file)}</small></span>${icon("arrow")}</button>`).join("") : `<div class="recent-empty">${icon("clock")}<span>A clean slate.<small>Your recent files will feel at home here.</small></span></div>`}</section><div class="keyboard-tip"><span class="tip-label">A SHORTCUT TO YOUR FLOW</span>${icon("keyboard")}<p>One place for every command.</p><button data-action="palette"><kbd>${commandModifier}</kbd> + <kbd>K</kbd><span>Open command palette ${icon("arrow")}</span></button></div></div>
    <footer class="welcome-footer"><span>MADE FOR HUMAN THINKING.</span><span>Write clearly. Build freely. <span class="small-spark">✳</span></span></footer>
  </div>`;
}

function renderExamples() {
  $("#page-view").innerHTML = `<div class="examples-page"><div class="eyebrow">SMALL PROGRAMS. BIG POSSIBILITIES.</div><h1>Learn by <em>making.</em></h1><p class="page-description">A collection of little beginnings. Open one, change something, and see what happens.<br>Examples open as new, unsaved files. Nothing runs until you choose Run.</p><div class="example-grid">${boot.examples.map((example, index) => `<button class="example-card" data-example="${escape(example.id)}"><span class="example-index">${String(index + 1).padStart(2, "0")}</span><span class="card-tag">${escape(example.category)}</span><h2>${escape(example.title)}</h2><p>${escape(example.description)}</p><span class="example-open">Open example ${icon("arrow")}</span></button>`).join("")}</div></div>`;
}

async function renderSidebar() {
  document.querySelectorAll<HTMLElement>("[data-sidebar]").forEach((element) => element.classList.toggle("active", element.dataset.sidebar === sidebar));
  const target = $("#sidebar-content");
  if (sidebar === "files") {
    target.innerHTML = `<div class="sidebar-heading"><span>EXPLORER</span><div><button class="icon-button" data-action="new" aria-label="New file">${icon("plus")}</button><button class="icon-button" data-action="open-folder" aria-label="Open folder">${icon("folderOpen")}</button></div></div>${workspace ? `<button class="workspace-root" data-action="refresh-explorer">${icon("down")}<strong>${escape(basename(workspace))}</strong><span title="Refresh">↻</span></button><div id="file-tree" role="group" aria-label="Workspace files"></div>` : `<div class="no-workspace"><span class="folder-illustration">${icon("folder")}</span><h2>A home for your ideas.</h2><p>Open a folder to see your files<br>and start something good.</p>${button("open-folder", "Open folder", "folderOpen", "sidebar-open-button")}<span>or <button class="inline-button" data-action="open">open a single file</button></span></div>`}<div class="sidebar-section-label">QUICK START</div><div class="quick-links">${button("new", "New Plain file", "plus")}${button("examples", "Explore examples", "grid")}${button("reference", "Language reference", "book")}</div><div class="workspace-note">${icon("code")}<p>Simple words.<br><strong>Extraordinary things.</strong></p></div>`;
    if (workspace) { await loadDirectory(workspace); if (sidebar === "files" && $("#file-tree")) $("#file-tree").innerHTML = treeHtml(workspace, 0); }
  } else if (sidebar === "examples") {
    target.innerHTML = `<div class="sidebar-heading"><span>EXAMPLE LIBRARY</span>${icon("grid")}</div><p class="sidebar-intro">Start with a little inspiration.</p><div class="sidebar-examples">${boot.examples.map((example) => `<button data-example="${escape(example.id)}">${icon("code")}<span>${escape(example.title)}<small>${escape(example.category)}</small></span>${icon("chevron")}</button>`).join("")}</div><div class="sidebar-help"><strong>Make it yours.</strong><p>Examples open in a new tab. Edit freely—the originals stay untouched.</p></div>`;
  } else {
    target.innerHTML = `<div class="sidebar-heading"><span>REFERENCE</span>${icon("book")}</div><p class="sidebar-intro">The right words, right here.</p><label class="reference-search">${icon("search")}<input id="reference-search" placeholder="Find a function…" aria-label="Search builtin reference"></label><div id="reference-results"></div>`;
    renderReference("");
    $("#reference-search").addEventListener("input", (event) => renderReference((event.target as HTMLInputElement).value));
  }
}
async function loadDirectory(path: string) { try { if (!directoryCache.has(path)) directoryCache.set(path, await bridge.listDirectory(path)); } catch (error) { toast((error as Error).message); } }
function treeHtml(path: string, depth: number): string {
  if (depth > 12) return "";
  return (directoryCache.get(path) || []).map((entry) => entry.directory ? `<button class="tree-entry directory ${expanded.has(entry.path) ? "expanded" : ""}" style="--depth:${depth}" data-directory="${escape(entry.path)}" aria-expanded="${expanded.has(entry.path)}">${icon(expanded.has(entry.path) ? "down" : "chevron")}${icon("folder")}<span>${escape(entry.name)}</span></button>${expanded.has(entry.path) ? treeHtml(entry.path, depth + 1) : ""}` : `<button class="tree-entry" style="--depth:${depth}" data-file="${escape(entry.path)}">${icon("code")}<span>${escape(entry.name)}</span></button>`).join("");
}
function renderReference(query: string) {
  const matches = BUILTIN_CATALOG.filter((entry) => `${entry.name} ${entry.module} ${entry.description}`.toLowerCase().includes(query.toLowerCase())).slice(0, 45);
  $("#reference-results").innerHTML = `<div class="reference-note">${query ? "MATCHING FUNCTIONS" : "BUILTIN FUNCTIONS"}</div>` + matches.map((entry) => `<button class="reference-entry" data-builtin="${escape(`${entry.module}.${entry.name}`)}"><span>${escape(entry.name)}</span><small>${escape(entry.module)}</small></button>`).join("") + (!matches.length ? '<p class="sidebar-intro">No matches. Try a simpler word.</p>' : "");
}

function openDocument(file: FileDocument) {
  if (store.documents.length >= 32 && !store.documents.some((document) => document.path === file.path)) { toast("You have 32 files open. Close a tab before opening another so recovery stays available."); return; }
  const existing = store.documents.find((document) => document.path === file.path);
  if (existing) return activate(existing.id);
  const document = store.add({ id: crypto.randomUUID(), ...file, dirty: false });
  if (!boot.recentFiles.includes(file.path)) boot.recentFiles.unshift(file.path);
  activate(document.id); persist();
}
function activate(id: string) { store.open(id); activeView = "editor"; if (store.active) editor.open(store.active); renderView(); persist(); editor.focus(); }
function newDocument(code = "", name = "untitled.plain") {
  if (store.documents.length >= 32) { toast("You have 32 files open. Close a tab before creating another so recovery stays available."); return; }
  const document = store.add({ id: crypto.randomUUID(), name, content: code, dirty: code.length > 0 }); activate(document.id);
}
async function saveDocument(id: string, saveAs = false): Promise<boolean> {
  const document = store.get(id);
  if (!document) return false;
  try {
    await persist(true);
    const saved = await bridge.saveFile({ documentId: document.id, path: saveAs ? undefined : document.path, name: document.name, content: document.content, expectedVersion: saveAs ? undefined : document.version });
    if (!saved) return false;
    store.markSaved(id, saved);
    if (!boot.recentFiles.includes(saved.path)) boot.recentFiles.unshift(saved.path);
    renderTabs(); await persist(true);
    directoryCache.clear(); await renderSidebar();
    toast(`Saved ${saved.name}`); return true;
  } catch (error) { toast(`Couldn’t save: ${(error as Error).message}`); return false; }
}
async function closeDocument(id: string): Promise<boolean> {
  const document = store.get(id);
  if (!document) return true;
  if (document.dirty) {
    const choice = await bridge.confirmClose(document.name);
    if (choice === "cancel" || (choice === "save" && !await saveDocument(id))) return false;
    if (choice === "save" && store.get(id)?.dirty) { toast("The document changed while saving. Review the new changes before closing."); return false; }
  }
  store.close(id); editor.close(id);
  if (store.active) { editor.open(store.active); activeView = "editor"; } else activeView = "welcome";
  renderView(); await persist(true); return true;
}
async function openWorkspace() {
  const folder = await bridge.openFolder(); if (!folder) return;
  for (const document of [...store.documents]) { if (!await closeDocument(document.id)) return; }
  workspace = folder; expanded.clear(); directoryCache.clear();
  $("#workspace-status").textContent = basename(folder);
  await renderSidebar(); renderView(); await persist(true);
}
async function closeWindow() {
  if (closing) return; closing = true;
  try {
    for (const document of [...store.documents]) {
      if (!document.dirty) continue;
      const choice = await bridge.confirmClose(document.name);
      if (choice === "cancel" || (choice === "save" && !await saveDocument(document.id))) return;
      if (choice === "save" && store.get(document.id)?.dirty) { toast("The document changed while saving. Review the new changes before closing."); return; }
      if (choice === "discard") { store.close(document.id); editor.close(document.id); }
    }
    if (run && ["running", "waiting"].includes(run.status)) await bridge.stopRun(run.id);
    await persist(true); await bridge.closeWindow();
  } catch (error) { toast((error as Error).message); } finally { closing = false; renderView(); }
}
async function checkExternalChanges() {
  if (checkingExternal || closing) return; checkingExternal = true;
  try {
    for (const document of store.documents.filter((entry) => entry.path)) {
      let current: FileDocument;
      try { current = await bridge.readFile(document.path!); } catch { continue; }
      if (current.version === document.version || current.content === document.content) continue;
      const reload = await choose(`“${document.name}” changed on disk`, document.dirty ? "You also have unsaved edits. Reloading will replace them with the version on disk." : "Another application changed this file. Reload it to see the latest version.", ["Keep my version", "Reload from disk"]);
      if (reload === 1) { store.reload(document.id, current); if (store.activeId === document.id) editor.open(store.get(document.id)!); }
      else store.acknowledgeExternal(document.id, current.version);
      renderTabs(); persist();
    }
  } finally { checkingExternal = false; }
}

async function startRun() {
  if (runStarting || (run && ["running", "waiting"].includes(run.status))) return;
  if (!store.active || activeView !== "editor") { const example = boot.examples[0]; newDocument(example.code, "hello.plain"); }
  const document = store.active!; runStarting = true;
  try {
    const result = await bridge.startRun({ code: document.content, filename: document.path, workspace, args: programArgs });
    if (!result) return;
    runDocumentId = document.id; run = result; outputPrefix = "";
    $(".main-area").classList.remove("panel-hidden"); showPanel("output"); renderRun(); schedulePoll();
  } catch (error) { toast(`Couldn’t run: ${(error as Error).message}`); } finally { runStarting = false; }
}
function schedulePoll() { clearTimeout(polling); if (run && ["running", "waiting"].includes(run.status)) polling = setTimeout(() => { void pollRun(); }, 100); }
async function pollRun() {
  if (!run) return;
  const id = run.id;
  try { const snapshot = await bridge.getRun(id); if (run.id !== id) return; run = snapshot; renderRun(); schedulePoll(); }
  catch (error) { clearTimeout(polling); toast((error as Error).message); }
}
function renderRun() {
  if (!run) return;
  const active = ["running", "waiting"].includes(run.status);
  $("#run-status").setAttribute("role", "status");
  $(".run-button").toggleAttribute("disabled", active);
  $(".stop-button").toggleAttribute("disabled", !active);
  const statuses = { running: "Running…", waiting: "Waiting for input", completed: "Completed", failed: "Failed", stopped: "Stopped", timeout: "Time limit reached" };
  $("#run-status").textContent = `${statuses[run.status]} · ${(run.durationMs / 1000).toFixed(2)}s`;
  $("#run-status").dataset.status = run.status;
  const body = $("#output-body");
  const atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 50;
  {
    body.innerHTML = `<pre class="program-output"></pre>${run.error ? `<button class="runtime-error" data-action="error-location">${icon("error")}<span>${escape(run.error.formatted)}</span>${run.error.location ? icon("arrow") : ""}</button>` : !active ? `<div class="run-finished">${icon(run.status === "completed" ? "check" : "stop")} ${statuses[run.status]}</div>` : ""}`;
    if (!run.output.startsWith(outputPrefix)) outputPrefix = "";
    $(".program-output").textContent = run.output.slice(outputPrefix.length);
  }
  if (atBottom) body.scrollTop = body.scrollHeight;
  const wasWaiting = !$("#input-form").hidden;
  $("#input-form").hidden = !run.input;
  if (run.input) { $("#input-prompt").textContent = run.input.prompt || "Program input"; if (!wasWaiting) $("#program-input").focus(); }
}
async function answerInput(event: Event) {
  event.preventDefault(); if (!run?.input) return;
  const field = $<HTMLInputElement>("#program-input");
  try { await bridge.answerRun({ id: run.id, inputId: run.input.id, value: field.value }); field.value = ""; await pollRun(); } catch (error) { toast((error as Error).message); }
}
function renderProblems() {
  $("#problem-count").textContent = String(diagnostics.length);
  const errors = diagnostics.filter((entry) => entry.severity === "error").length;
  const warnings = diagnostics.filter((entry) => entry.severity === "warning").length;
  $("#diagnostic-status").innerHTML = `${icon("error")}<span>${errors}</span>${icon("warning")}<span>${warnings}</span>`;
  $("#problems-body").innerHTML = diagnostics.length ? diagnostics.map((entry, index) => `<button class="problem-entry" data-problem="${index}">${icon(entry.severity === "error" ? "error" : "warning")}<span>${escape(entry.message)}<small>${escape(entry.name)} · ${entry.line}:${entry.column}</small></span></button>`).join("") : `<div class="problems-clear">${icon("check")} No problems detected. A clear path ahead.</div>`;
}
function showPanel(name: "output" | "problems") { $("#output-body").hidden = name !== "output"; $("#problems-body").hidden = name !== "problems"; document.querySelectorAll<HTMLElement>("[data-panel]").forEach((element) => element.classList.toggle("active", element.dataset.panel === name)); }

async function dispatch(action: AppCommand | string) {
  try {
    switch (action) {
      case "welcome": activeView = "welcome"; renderView(); break;
      case "new": newDocument(); break;
      case "open": (await bridge.openFiles()).forEach(openDocument); break;
      case "open-folder": await openWorkspace(); break;
      case "save": if (store.active) await saveDocument(store.active.id); break;
      case "save-as": if (store.active) await saveDocument(store.active.id, true); break;
      case "save-all": for (const document of store.documents.filter((entry) => entry.dirty)) { if (!await saveDocument(document.id)) break; } break;
      case "close-tab": if (store.active && activeView === "editor") await closeDocument(store.active.id); break;
      case "close-window": await closeWindow(); break;
      case "run": await startRun(); break;
      case "stop": if (run) { run = await bridge.stopRun(run.id); renderRun(); } break;
      case "format": if (activeView === "editor") await editor.format(); break;
      case "find": editor.find(); break;
      case "replace": editor.replace(); break;
      case "palette": showPalette(); break;
      case "settings": showSettings(); break;
      case "examples": activeView = "examples"; sidebar = "examples"; renderView(); await renderSidebar(); break;
      case "reference": sidebar = "reference"; await renderSidebar(); $("#reference-search").focus(); break;
      case "problems": $(".main-area").classList.remove("panel-hidden"); showPanel("problems"); break;
      case "toggle-panel": $(".main-area").classList.toggle("panel-hidden"); editor.layout(); break;
      case "refresh-explorer": directoryCache.clear(); await renderSidebar(); break;
      case "copy-output": await navigator.clipboard.writeText(run?.output || ""); toast("Output copied."); break;
      case "clear-output": outputPrefix = run?.output || ""; $("#output-body").innerHTML = '<div class="problems-clear">Output cleared.</div>'; break;
      case "arguments": showArguments(); break;
      case "error-location": if (runDocumentId && store.get(runDocumentId) && run?.error?.location) { activate(runDocumentId); editor.reveal(run.error.location.line, run.error.location.column); } break;
    }
  } catch (error) { toast((error as Error).message); }
}
function onClick(event: MouseEvent) {
  const element = (event.target as HTMLElement).closest<HTMLElement>("button, [data-action]"); if (!element) return;
  if (element.dataset.action) void dispatch(element.dataset.action);
  if (element.dataset.sidebar) { sidebar = element.dataset.sidebar as typeof sidebar; void renderSidebar(); }
  if (element.dataset.document) activate(element.dataset.document);
  if (element.dataset.close) void closeDocument(element.dataset.close);
  if (element.dataset.example) { const example = boot.examples.find((entry) => entry.id === element.dataset.example); if (example) newDocument(example.code, `${example.id}.plain`); }
  if (element.dataset.recent || element.dataset.file) void bridge.readFile((element.dataset.recent || element.dataset.file)!).then(openDocument).catch((error) => toast(error.message));
  if (element.dataset.directory) {
    const path = element.dataset.directory;
    if (expanded.has(path)) { expanded.delete(path); void renderSidebar(); } else { expanded.add(path); void loadDirectory(path).then(renderSidebar); }
  }
  if (element.dataset.panel) showPanel(element.dataset.panel as "output" | "problems");
  if (element.dataset.problem) { const issue = diagnostics[Number(element.dataset.problem)]; if (issue && store.get(issue.documentId)) { activate(issue.documentId); editor.reveal(issue.line, issue.column); } }
  if (element.dataset.builtin) showBuiltin(element.dataset.builtin);
}
function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape" && $("#modal-root").children.length) { closeModal(); return; }
  const modifier = event.ctrlKey || event.metaKey;
  if (native) {
    if (modifier && event.key.toLowerCase() === "k") { event.preventDefault(); showPalette(); }
    return;
  }
  let action: string | undefined;
  if (modifier && event.key.toLowerCase() === "k") action = "palette";
  if (modifier && event.key.toLowerCase() === "n") action = "new";
  if (modifier && event.key.toLowerCase() === "o") action = event.shiftKey ? "open-folder" : "open";
  if (modifier && event.key.toLowerCase() === "s") action = event.shiftKey ? "save-as" : "save";
  if (modifier && event.key.toLowerCase() === "w") action = "close-tab";
  if (modifier && event.key === ",") action = "settings";
  if (event.key === "F5") action = event.shiftKey ? "stop" : "run";
  if (event.shiftKey && event.altKey && event.key.toLowerCase() === "f") action = "format";
  if (action) { event.preventDefault(); void dispatch(action); }
}
function onTabKeydown(event: KeyboardEvent) {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
  const tabs = Array.from($("#tabs").querySelectorAll<HTMLButtonElement>('[aria-pressed]'));
  const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
  if (current < 0) return;
  event.preventDefault();
  const index = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (current + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
  tabs[index].click(); tabs[index].focus();
}

let modalCleanup: (() => void) | undefined;
let modalReturnFocus: HTMLElement | null;
function closeModal() { const cleanup = modalCleanup; modalCleanup = undefined; $("#modal-root").innerHTML = ""; cleanup?.(); modalReturnFocus?.focus(); }
function modal(content: string, className = "") {
  closeModal(); modalReturnFocus = document.activeElement as HTMLElement;
  $("#modal-root").innerHTML = `<div class="modal-backdrop"><section class="modal ${className}" role="dialog" aria-modal="true" aria-labelledby="modal-title">${content}</section></div>`;
  const backdrop = $(".modal-backdrop");
  backdrop.addEventListener("mousedown", (event) => { if (event.target === backdrop) closeModal(); });
  $(".modal").addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = Array.from($(".modal").querySelectorAll<HTMLElement>('button:not([disabled]),input,select,textarea,[tabindex="0"]'));
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  $(".modal").querySelector<HTMLElement>("input,select,button")?.focus();
}
function choose(title: string, description: string, choices: string[]): Promise<number> {
  return new Promise((resolve) => {
    modal(`<div class="modal-header"><h2 id="modal-title">${escape(title)}</h2></div><p class="modal-description">${escape(description)}</p><div class="modal-actions">${choices.map((choice, index) => `<button data-choice="${index}" class="${index === choices.length - 1 ? "primary-button" : "secondary-button"}">${escape(choice)}</button>`).join("")}</div>`);
    modalCleanup = () => resolve(0);
    document.querySelectorAll<HTMLElement>("[data-choice]").forEach((element) => element.addEventListener("click", () => { const index = Number(element.dataset.choice); modalCleanup = undefined; closeModal(); resolve(index); }));
  });
}
const commands: { id: string; name: string; shortcut?: string; image: string }[] = [
  { id: "new", name: "New Plain file", shortcut: "N", image: "plus" }, { id: "open", name: "Open file…", shortcut: "O", image: "files" }, { id: "open-folder", name: "Open folder…", shortcut: "Shift O", image: "folderOpen" }, { id: "save", name: "Save current file", shortcut: "S", image: "save" }, { id: "save-all", name: "Save all files", image: "save" }, { id: "run", name: "Run current file", shortcut: "F5", image: "play" }, { id: "stop", name: "Stop running program", shortcut: "Shift F5", image: "stop" }, { id: "format", name: "Format document", shortcut: "Shift Alt F", image: "code" }, { id: "examples", name: "Explore example library", image: "grid" }, { id: "reference", name: "Search language reference", image: "book" }, { id: "settings", name: "Open settings", shortcut: ",", image: "settings" }, { id: "welcome", name: "Show welcome page", image: "home" }
];
function showPalette() {
  modal(`<h2 id="modal-title" class="sr-only">Command palette</h2><label class="palette-search">${icon("search")}<input id="palette-input" placeholder="What would you like to do?" aria-label="Search commands" autocomplete="off"><kbd>esc</kbd></label><div id="palette-results" role="listbox" aria-label="Commands"></div><footer class="palette-footer"><span>↑ ↓ to navigate</span><span>↵ to run</span><span>Plain Studio</span></footer>`, "command-palette");
  let selected = 0;
  let results = commands;
  function render() { $("#palette-results").innerHTML = results.length ? results.map((entry, index) => `<button role="option" aria-selected="${index === selected}" class="palette-item ${index === selected ? "selected" : ""}" data-palette="${entry.id}">${icon(entry.image)}<span>${entry.name}</span>${entry.shortcut ? `<kbd>${entry.shortcut.includes("F5") || entry.shortcut.includes("Alt") ? "" : commandModifier + " "}${entry.shortcut}</kbd>` : ""}</button>`).join("") : '<div class="no-commands">No commands found. Try another word.</div>'; }
  render();
  $("#palette-input").addEventListener("input", (event) => { results = commands.filter((entry) => entry.name.toLowerCase().includes((event.target as HTMLInputElement).value.toLowerCase())); selected = 0; render(); });
  $("#palette-input").addEventListener("keydown", (event) => { if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); selected = (selected + (event.key === "ArrowDown" ? 1 : results.length - 1)) % Math.max(results.length, 1); render(); } if (event.key === "Enter" && results[selected]) { event.preventDefault(); event.stopPropagation(); const action = results[selected].id; closeModal(); void dispatch(action); } });
  $("#palette-results").addEventListener("click", (event) => { const action = (event.target as HTMLElement).closest<HTMLElement>("[data-palette]")?.dataset.palette; if (action) { closeModal(); void dispatch(action); } });
}
function showSettings() {
  modal(`<div class="modal-header"><div><span class="eyebrow">MAKE YOURSELF AT HOME</span><h2 id="modal-title">Your studio. Your way.</h2></div><button class="icon-button" id="settings-close" aria-label="Close settings">${icon("close")}</button></div><form id="settings-form"><label class="setting-row"><span>Appearance<small>A little light, or a little focus.</small></span><select name="theme"><option value="dark">Dark</option><option value="light">Light</option><option value="system">Follow system</option></select></label><label class="setting-row"><span>Editor font size<small>Give your words room to breathe.</small></span><input name="fontSize" type="number" min="10" max="30" value="${settings.fontSize}" required></label><label class="setting-row"><span>Indentation<small>Spaces per indentation level.</small></span><select name="tabSize"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="8">8 spaces</option></select></label><label class="setting-row"><span>Word wrap<small>Keep long lines within view.</small></span><input name="wordWrap" type="checkbox" ${settings.wordWrap ? "checked" : ""}></label><label class="setting-row"><span>Minimap<small>A bird’s-eye view of your file.</small></span><input name="minimap" type="checkbox" ${settings.minimap ? "checked" : ""}></label><label class="setting-row"><span>Execution time limit<small>Seconds before a program is stopped.</small></span><input name="timeoutSeconds" type="number" min="1" max="300" value="${settings.timeoutSeconds}" required></label><div class="settings-footnote">${icon("check")} Settings are stored locally. No account required.</div><div class="modal-actions"><button type="submit" class="primary-button">Save preferences ${icon("check")}</button></div></form>`, "settings-modal");
  ($<HTMLSelectElement>('[name="theme"]')).value = settings.theme;
  ($<HTMLSelectElement>('[name="tabSize"]')).value = String(settings.tabSize);
  $("#settings-close").addEventListener("click", closeModal);
  $("#settings-form").addEventListener("submit", (event) => { event.preventDefault(); const form = new FormData(event.target as HTMLFormElement); const next: Settings = { theme: form.get("theme") as Settings["theme"], fontSize: Number(form.get("fontSize")), tabSize: Number(form.get("tabSize")), wordWrap: form.get("wordWrap") === "on", minimap: form.get("minimap") === "on", timeoutSeconds: Number(form.get("timeoutSeconds")) }; void bridge.updateSettings(next).then((saved) => { settings = saved; applyTheme(); editor.updateSettings(settings); closeModal(); toast("Your studio, just the way you like it."); }).catch((error) => toast(error.message)); });
}
function showArguments() {
  modal(`<div class="modal-header"><h2 id="modal-title">Program arguments</h2><button class="icon-button" id="args-close" aria-label="Close arguments">${icon("close")}</button></div><p class="modal-description">One argument per line. Read them in your program with <code>args()</code>. Arguments are passed as values, never through a shell.</p><form id="args-form"><textarea id="args-input" rows="6" aria-label="Arguments, one per line" placeholder="first argument\nsecond argument"></textarea><div class="modal-actions"><button type="submit" class="primary-button">Apply arguments</button></div></form>`);
  $<HTMLTextAreaElement>("#args-input").value = programArgs.join("\n");
  $("#args-close").addEventListener("click", closeModal);
  $("#args-form").addEventListener("submit", (event) => { event.preventDefault(); const text = $<HTMLTextAreaElement>("#args-input").value; programArgs = text ? text.split(/\r?\n/) : []; closeModal(); toast(`${programArgs.length} argument${programArgs.length === 1 ? "" : "s"} set for the next run.`); });
}
function showBuiltin(qualified: string) {
  const entry = BUILTIN_CATALOG.find((candidate) => `${candidate.module}.${candidate.name}` === qualified); if (!entry) return;
  modal(`<div class="modal-header"><div><span class="eyebrow">${escape(entry.module)} / BUILTIN REFERENCE</span><h2 id="modal-title">${escape(entry.name)}</h2></div><button class="icon-button" id="reference-close" aria-label="Close reference">${icon("close")}</button></div><pre class="builtin-signature"><code>${escape(entry.signature)}</code></pre><p class="modal-description">${escape(entry.description)}</p><div class="builtin-capability">${icon(entry.browserSafe ? "check" : "terminal")} ${entry.browserSafe ? "Available in the browser and desktop runtime." : "Requires the local desktop runtime and its host capabilities."}</div>${entry.aliases.length ? `<p class="modal-description">Also known as: ${escape(entry.aliases.join(", "))}</p>` : ""}`);
  $("#reference-close").addEventListener("click", closeModal);
}
function setupResizer(element: HTMLElement, property: string, minimum: number, maximum: number, axis: "x" | "y") {
  const getValue = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue(property));
  element.setAttribute("aria-valuemin", String(minimum));
  element.setAttribute("aria-valuemax", String(maximum));
  element.setAttribute("aria-valuenow", String(getValue()));
  const change = (value: number) => { const size = Math.max(minimum, Math.min(maximum, value)); document.documentElement.style.setProperty(property, `${size}px`); element.setAttribute("aria-valuenow", String(size)); editor.layout(); };
  element.addEventListener("pointerdown", (event) => {
    const start = axis === "x" ? event.clientX : event.clientY, size = getValue(); element.setPointerCapture(event.pointerId); document.body.classList.add("resizing");
    const move = (event: PointerEvent) => change(size + ((axis === "x" ? event.clientX : event.clientY) - start) * (axis === "x" ? 1 : -1));
    const up = () => { element.removeEventListener("pointermove", move); document.body.classList.remove("resizing"); persist(); };
    element.addEventListener("pointermove", move); element.addEventListener("pointerup", up, { once: true });
  });
  element.addEventListener("keydown", (event) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) { event.preventDefault(); change(getValue() + (["ArrowRight", "ArrowUp"].includes(event.key) ? 15 : -15)); persist(); } });
}

void init().catch((error) => { $("#app").innerHTML = `<div class="startup-error"><h1>Let’s get the studio back on its feet.</h1><p>${escape(error.message)}</p><p>Close and reopen the app. Your saved files are not changed.</p><button id="retry-startup">Try again</button></div>`; $("#retry-startup").addEventListener("click", () => location.reload()); console.error(error); });
