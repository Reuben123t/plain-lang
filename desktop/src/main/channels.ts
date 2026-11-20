// Kept explicit: the renderer never receives ipcRenderer or a generic channel API.
export const IPC = {
  bootstrap: "plain:bootstrap", openFiles: "plain:open-files", readFile: "plain:read-file",
  openFolder: "plain:open-folder", listDirectory: "plain:list-directory", saveFile: "plain:save-file",
  confirmClose: "plain:confirm-close", updateSettings: "plain:update-settings", saveSession: "plain:save-session",
  startRun: "plain:start-run", getRun: "plain:get-run", answerRun: "plain:answer-run", stopRun: "plain:stop-run",
  closeWindow: "plain:close-window", command: "plain:command", openedFiles: "plain:opened-files"
} as const;

export const COMMANDS = new Set([
  "new", "open", "open-folder", "save", "save-as", "save-all", "close-tab", "close-window", "run", "stop",
  "format", "palette", "settings", "welcome", "find", "replace", "reference"
]);
