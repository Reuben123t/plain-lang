import { app, BrowserWindow, dialog, ipcMain, Menu, session, type MenuItemConstructorOptions, type IpcMainInvokeEvent } from "electron";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { EXAMPLES } from "../shared/examples";
import type { AppCommand } from "../shared/contracts";
import { IPC } from "./channels";
import { DesktopHost, type NativeDialogs } from "./host";
import { initialFileArguments, isOfflineResource, isRendererURL } from "./security";
import { HostError, localPath } from "./validation";

const rendererFile = path.join(__dirname, "renderer", "index.html");
const smoke = process.argv.includes("--smoke-test");
const testMode = process.argv.includes("--test-mode") && !app.isPackaged;
let temporaryProfile: string | undefined;
if (smoke) {
  temporaryProfile = process.env.PLAIN_DESKTOP_SMOKE_DIR ? localPath(process.env.PLAIN_DESKTOP_SMOKE_DIR) : fs.mkdtempSync(path.join(os.tmpdir(), "plain-desktop-smoke-"));
  app.setPath("userData", temporaryProfile);
} else if (testMode) {
  if (process.env.PLAIN_DESKTOP_TEST_DIR) app.setPath("userData", localPath(process.env.PLAIN_DESKTOP_TEST_DIR));
  else {
    temporaryProfile = fs.mkdtempSync(path.join(os.tmpdir(), "plain-desktop-test-"));
    app.setPath("userData", temporaryProfile);
  }
}
if (smoke || testMode) app.setPath("sessionData", path.join(app.getPath("userData"), "chromium"));

let window: BrowserWindow | undefined;
let host: DesktopHost | undefined;
let allowClose = false;
let quitting = false;
let rendererReady = false;
let pendingPaths = initialFileArguments(process.argv, app.isPackaged, process.cwd());
let commandQueue: AppCommand[] = [];
let dialogBusy = false;
let failed = false;

function command(value: AppCommand): void {
  if (!window || window.isDestroyed()) return;
  if (!rendererReady) { if (commandQueue.length < 32) commandQueue.push(value); return; }
  window.webContents.send(IPC.command, value);
}
async function nativeDialog<T>(action: () => Promise<T>): Promise<T> {
  if (dialogBusy) throw new HostError("Another native dialog is already open.");
  dialogBusy = true;
  try { return await action(); } finally { dialogBusy = false; }
}
function currentWindow(): BrowserWindow {
  if (!window || window.isDestroyed()) throw new HostError("The application window is closed.");
  return window;
}
const dialogs: NativeDialogs = {
  openFiles: () => nativeDialog(async () => {
    const result = await dialog.showOpenDialog(currentWindow(), { title: "Open Plain files", properties: ["openFile", "multiSelections"], filters: [{ name: "Plain source", extensions: ["plain"] }, { name: "All files", extensions: ["*"] }] });
    return result.canceled ? undefined : result.filePaths;
  }),
  openFolder: () => nativeDialog(async () => {
    const result = await dialog.showOpenDialog(currentWindow(), { title: "Open workspace", properties: ["openDirectory"] });
    return result.canceled ? undefined : result.filePaths[0];
  }),
  saveFile: (name) => nativeDialog(async () => {
    const result = await dialog.showSaveDialog(currentWindow(), { title: "Save Plain file", defaultPath: name, filters: [{ name: "Plain source", extensions: ["plain"] }, { name: "All files", extensions: ["*"] }], properties: ["showOverwriteConfirmation", "createDirectory"] });
    return result.canceled ? undefined : result.filePath;
  }),
  confirmClose: (name) => nativeDialog(async () => {
    const result = await dialog.showMessageBox(currentWindow(), { type: "question", title: "Unsaved changes", message: `Save changes to ${name}?`, detail: "Your changes will be lost if you discard them.", buttons: ["Save", "Discard", "Cancel"], defaultId: 0, cancelId: 2, noLink: true });
    return (["save", "discard", "cancel"] as const)[result.response] ?? "cancel";
  }),
  trust: (directory) => nativeDialog(async () => {
    const result = await dialog.showMessageBox(currentWindow(), {
      type: "warning", title: "Trust this workspace to run code?", message: "Plain programs run with your account's permissions.",
      detail: `Only run code you trust. Programs can access files, use the network, and start other processes. This is not a security sandbox.\n\nExecution directory:\n${directory}\n\nTrust applies only to this workspace for this application session.`,
      buttons: ["Cancel", "Trust and Run"], defaultId: 0, cancelId: 0, noLink: true
    });
    return result.response === 1;
  })
};
function guard(event: IpcMainInvokeEvent): DesktopHost {
  if (!host || !window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame
    || !isRendererURL(event.senderFrame.url, rendererFile)) throw new HostError("Untrusted IPC sender.");
  return host;
}
function registerIPC(): void {
  const handle = (channel: string, action: (host: DesktopHost, value: unknown) => unknown) => {
    ipcMain.handle(channel, (event, value: unknown) => action(guard(event), value));
  };
  handle(IPC.bootstrap, (service) => {
    rendererReady = true;
    setImmediate(() => {
      for (const value of commandQueue) command(value);
      commandQueue = [];
      void deliverPending();
    });
    return service.bootstrap();
  });
  handle(IPC.openFiles, (service) => service.openFiles());
  handle(IPC.readFile, (service, value) => service.readFile(value));
  handle(IPC.openFolder, (service) => service.openFolder());
  handle(IPC.listDirectory, (service, value) => service.files.list(value));
  handle(IPC.saveFile, (service, value) => service.saveFile(value));
  handle(IPC.confirmClose, (service, value) => service.confirmClose(value));
  handle(IPC.updateSettings, (service, value) => service.profile.settings(value));
  handle(IPC.saveSession, (service, value) => service.saveSession(value));
  handle(IPC.startRun, (service, value) => service.startRun(value));
  handle(IPC.getRun, (service, value) => service.execution.get(value).snapshot());
  handle(IPC.answerRun, (service, value) => service.answerRun(value));
  handle(IPC.stopRun, (service, value) => service.execution.get(value).stop());
  handle(IPC.closeWindow, async (service) => {
    await service.close(); // Execution and recovery must finish before the native close is authorized.
    allowClose = true;
    currentWindow().close();
  });
}
function installMenu(): void {
  const item = (label: string, value: AppCommand, accelerator?: string): MenuItemConstructorOptions => ({ label, ...(accelerator ? { accelerator } : {}), click: () => command(value) });
  const menu: MenuItemConstructorOptions[] = [
    ...(process.platform === "darwin" ? [{ label: app.name, submenu: [{ role: "about" as const }, { type: "separator" as const }, item("Settings…", "settings", "CmdOrCtrl+,"), { type: "separator" as const }, { role: "services" as const }, { role: "hide" as const }, { role: "hideOthers" as const }, { role: "unhide" as const }, { type: "separator" as const }, item("Quit Plain", "close-window", "CmdOrCtrl+Q")] }] : []),
    { label: "File", submenu: [item("New File", "new", "CmdOrCtrl+N"), item("Open File…", "open", "CmdOrCtrl+O"), item("Open Folder…", "open-folder", "CmdOrCtrl+Shift+O"), { type: "separator" }, item("Save", "save", "CmdOrCtrl+S"), item("Save As…", "save-as", "CmdOrCtrl+Shift+S"), item("Save All", "save-all", "CmdOrCtrl+Alt+S"), { type: "separator" }, item("Close Tab", "close-tab", "CmdOrCtrl+W"), item("Close Window", "close-window", "Alt+F4")] },
    { label: "Edit", submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }, { type: "separator" }, item("Find", "find", "CmdOrCtrl+F"), item("Replace", "replace", "CmdOrCtrl+H"), item("Format Document", "format", "Shift+Alt+F")] },
    { label: "Run", submenu: [item("Run Program", "run", "F5"), item("Stop Program", "stop", "Shift+F5")] },
    { label: "View", submenu: [item("Command Palette", "palette", "CmdOrCtrl+Shift+P"), item("Settings", "settings", process.platform === "darwin" ? undefined : "CmdOrCtrl+,"), { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }, { role: "togglefullscreen" }] },
    { label: "Help", submenu: [item("Welcome", "welcome"), item("Language Reference", "reference")] }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}
async function deliverPending(): Promise<void> {
  if (!rendererReady || !host || !window || !pendingPaths.length) return;
  const paths = pendingPaths.splice(0, 32);
  try {
    const files = await host.openPaths(paths);
    if (!window.isDestroyed()) window.webContents.send(IPC.openedFiles, files);
  } catch (error) { await showError("Could not open files", error); }
}
async function showError(title: string, error: unknown): Promise<void> {
  const detail = error instanceof Error ? error.message : String(error);
  if (smoke) { console.error(`${title}: ${detail}`); failed = true; app.exit(1); return; }
  if (window && !window.isDestroyed()) await dialog.showMessageBox(window, { type: "error", title, message: title, detail });
  else dialog.showErrorBox(title, detail);
}
async function createWindow(): Promise<void> {
  allowClose = false; rendererReady = false;
  const partition = session.fromPartition("plain-desktop");
  partition.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  partition.setPermissionCheckHandler(() => false);
  partition.on("will-download", (event) => event.preventDefault());
  partition.webRequest.onBeforeRequest((details, callback) => callback({ cancel: !isOfflineResource(details.url, path.dirname(rendererFile)) }));
  partition.webRequest.onHeadersReceived((details, callback) => callback({ responseHeaders: {
    ...details.responseHeaders,
    "Content-Security-Policy": ["default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; worker-src 'self' blob:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"]
  } }));
  window = new BrowserWindow({
    width: 1400, height: 900, minWidth: 800, minHeight: 560, show: false, title: "Plain", backgroundColor: "#101218",
    icon: path.join(__dirname, "plain-logo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, sandbox: true, nodeIntegration: false,
      nodeIntegrationInWorker: false, nodeIntegrationInSubFrames: false, webSecurity: true, allowRunningInsecureContent: false,
      webviewTag: false, navigateOnDragDrop: false, session: partition, devTools: !app.isPackaged
    }
  });
  const contents = window.webContents;
  contents.setWindowOpenHandler(() => ({ action: "deny" }));
  contents.on("will-navigate", (event) => event.preventDefault());
  contents.on("will-frame-navigate", (event) => event.preventDefault());
  contents.on("will-redirect", (event) => event.preventDefault());
  contents.on("will-attach-webview", (event) => event.preventDefault());
  contents.on("preload-error", (_event, _file, error) => { void showError("Preload failed", error); });
  contents.on("render-process-gone", (_event, details) => { void showError("Renderer stopped", new Error(details.reason)); });
  window.on("close", (event) => {
    if (allowClose) return;
    event.preventDefault(); command("close-window");
  });
  window.on("closed", () => { window = undefined; app.quit(); });
  window.once("ready-to-show", () => { window?.show(); });
  await window.loadFile(rendererFile);
  if (smoke) {
    const available = await contents.executeJavaScript(`new Promise((resolve) => {
      const deadline = Date.now() + 20000;
      const check = () => {
        if (document.documentElement.dataset.studioReady === 'true') resolve(Boolean(window.plain));
        else if (document.querySelector('.startup-error') || Date.now() > deadline) resolve(false);
        else setTimeout(check, 50);
      };
      check();
    })`);
    if (!available) throw new Error("The studio renderer did not finish initializing.");
    console.log("PLAIN_DESKTOP_SMOKE_OK");
    await host?.close(); allowClose = true; app.exit(failed ? 1 : 0);
  }
}

app.on("open-file", (event, file) => { event.preventDefault(); if (pendingPaths.length < 32) pendingPaths.push(file); void deliverPending(); });
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", (_event, argv, cwd) => {
    pendingPaths.push(...initialFileArguments(argv, app.isPackaged, cwd).slice(0, 32 - pendingPaths.length));
    if (window?.isMinimized()) window.restore();
    window?.focus(); void deliverPending();
  });
  app.on("before-quit", (event) => {
    if (quitting) return;
    event.preventDefault();
    if (window && !allowClose) { command("close-window"); return; }
    quitting = true;
    void host?.close().finally(() => app.quit());
    if (!host) app.quit();
  });
  app.on("window-all-closed", () => app.quit());
  // The smoke/test runner removes its profile after Chromium releases file locks.
  // Never block app exit deleting a live Chromium cache on Windows.
  void app.whenReady().then(async () => {
    const initial = pendingPaths.splice(0);
    host = new DesktopHost({ userData: app.getPath("userData"), version: app.getVersion(), platform: process.platform, examples: EXAMPLES, childFile: path.join(__dirname, "execution-child.cjs"), dialogs, initialFiles: initial });
    await host.initialize(); registerIPC(); installMenu(); await createWindow();
  }).catch(async (error: unknown) => {
    await showError("Plain could not start", error);
    await host?.close(); allowClose = true; quitting = true; app.exit(1);
  });
}
if (smoke) setTimeout(() => { console.error("Desktop smoke test timed out."); app.exit(1); }, 30_000).unref();
