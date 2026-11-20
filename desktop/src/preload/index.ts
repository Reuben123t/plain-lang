import { contextBridge, ipcRenderer } from "electron";
import type { AppCommand, DesktopBridge, FileDocument } from "../shared/contracts";
import { COMMANDS, IPC } from "../main/channels";

const bridge: DesktopBridge = Object.freeze({
  bootstrap: () => ipcRenderer.invoke(IPC.bootstrap),
  openFiles: () => ipcRenderer.invoke(IPC.openFiles),
  readFile: (path: string) => ipcRenderer.invoke(IPC.readFile, path),
  openFolder: () => ipcRenderer.invoke(IPC.openFolder),
  listDirectory: (path: string) => ipcRenderer.invoke(IPC.listDirectory, path),
  saveFile: (request: Parameters<DesktopBridge["saveFile"]>[0]) => ipcRenderer.invoke(IPC.saveFile, request),
  confirmClose: (name: string) => ipcRenderer.invoke(IPC.confirmClose, name),
  updateSettings: (settings: Parameters<DesktopBridge["updateSettings"]>[0]) => ipcRenderer.invoke(IPC.updateSettings, settings),
  saveSession: (session: Parameters<DesktopBridge["saveSession"]>[0]) => ipcRenderer.invoke(IPC.saveSession, session),
  startRun: (request: Parameters<DesktopBridge["startRun"]>[0]) => ipcRenderer.invoke(IPC.startRun, request),
  getRun: (id: string) => ipcRenderer.invoke(IPC.getRun, id),
  answerRun: (request: Parameters<DesktopBridge["answerRun"]>[0]) => ipcRenderer.invoke(IPC.answerRun, request),
  stopRun: (id: string) => ipcRenderer.invoke(IPC.stopRun, id),
  closeWindow: () => ipcRenderer.invoke(IPC.closeWindow),
  onCommand: (listener: (command: AppCommand) => void) => {
    if (typeof listener !== "function") throw new TypeError("Expected a command listener.");
    const handler = (_event: Electron.IpcRendererEvent, command: unknown) => {
      if (typeof command === "string" && COMMANDS.has(command)) listener(command as AppCommand);
    };
    ipcRenderer.on(IPC.command, handler);
    return () => ipcRenderer.removeListener(IPC.command, handler);
  },
  onOpenFiles: (listener: (files: FileDocument[]) => void) => {
    if (typeof listener !== "function") throw new TypeError("Expected an open-files listener.");
    const handler = (_event: Electron.IpcRendererEvent, files: FileDocument[]) => { listener(files); };
    ipcRenderer.on(IPC.openedFiles, handler);
    return () => ipcRenderer.removeListener(IPC.openedFiles, handler);
  }
});
contextBridge.exposeInMainWorld("plain", bridge);
