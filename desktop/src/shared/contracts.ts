export type Theme = "dark" | "light" | "system";

export interface Settings {
  theme: Theme;
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  timeoutSeconds: number;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark", fontSize: 14, tabSize: 4, wordWrap: false, minimap: false, timeoutSeconds: 30
};

export interface FileDocument {
  path: string;
  name: string;
  content: string;
  version: string;
}

export interface DirectoryEntry {
  name: string;
  path: string;
  directory: boolean;
}

export interface SessionDocument {
  id: string;
  name: string;
  path?: string;
  content: string;
  version?: string;
  dirty: boolean;
}

export interface Session {
  workspace?: string;
  documents: SessionDocument[];
  activeId?: string;
  sidebarWidth?: number;
  panelHeight?: number;
}

export interface Example {
  id: string;
  title: string;
  description: string;
  category: string;
  code: string;
}

export interface Bootstrap {
  platform: string;
  version: string;
  settings: Settings;
  recentFiles: string[];
  recentWorkspaces: string[];
  session?: Session;
  examples: Example[];
}

export interface RunRequest {
  code: string;
  filename?: string;
  workspace?: string;
  args: string[];
}

export interface RunSnapshot {
  id: string;
  status: "running" | "waiting" | "completed" | "failed" | "stopped" | "timeout";
  output: string;
  durationMs: number;
  input?: { id: number; prompt: string };
  error?: { message: string; formatted: string; kind: string; location?: { line: number; column: number; sourceFile?: string } };
}

export type AppCommand = "new" | "open" | "open-folder" | "save" | "save-as" | "save-all" | "close-tab" | "close-window" | "run" | "stop" | "format" | "palette" | "settings" | "welcome" | "find" | "replace" | "reference";

export interface DesktopBridge {
  bootstrap(): Promise<Bootstrap>;
  openFiles(): Promise<FileDocument[]>;
  readFile(path: string): Promise<FileDocument>;
  openFolder(): Promise<string | undefined>;
  listDirectory(path: string): Promise<DirectoryEntry[]>;
  saveFile(request: { documentId?: string; path?: string; name: string; content: string; expectedVersion?: string }): Promise<FileDocument | undefined>;
  confirmClose(name: string): Promise<"save" | "discard" | "cancel">;
  updateSettings(settings: Settings): Promise<Settings>;
  saveSession(session: Session): Promise<void>;
  startRun(request: RunRequest): Promise<RunSnapshot | undefined>;
  getRun(id: string): Promise<RunSnapshot>;
  answerRun(request: { id: string; inputId: number; value: string }): Promise<void>;
  stopRun(id: string): Promise<RunSnapshot>;
  closeWindow(): Promise<void>;
  onCommand(listener: (command: AppCommand) => void): () => void;
  onOpenFiles(listener: (files: FileDocument[]) => void): () => void;
}

declare global {
  interface Window { plain?: DesktopBridge }
}
