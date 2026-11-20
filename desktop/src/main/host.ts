import * as fs from "node:fs/promises";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import type { Bootstrap, Example, FileDocument, RunSnapshot } from "../shared/contracts";
import { FileAccess } from "./files";
import { ProfileStore } from "./profile";
import { ExecutionHost } from "./execution";
import { HostError, LIMITS, localPath, record, text, validateRun, validateSession } from "./validation";

export interface NativeDialogs {
  openFiles(): Promise<string[] | undefined>;
  openFolder(): Promise<string | undefined>;
  saveFile(name: string): Promise<string | undefined>;
  confirmClose(name: string): Promise<"save" | "discard" | "cancel">;
  trust(directory: string): Promise<boolean>;
}
export interface HostOptions {
  userData: string; version: string; platform: string; examples: readonly Example[]; childFile: string;
  dialogs: NativeDialogs; initialFiles?: string[];
}

/** No Electron import: the native policy and persistence can be verified in ordinary Node tests. */
export class DesktopHost {
  readonly files = new FileAccess();
  readonly profile: ProfileStore;
  readonly execution = new ExecutionHost();
  private trustedDirectory?: string;
  private starting = false;
  private initialSession?: Bootstrap["session"];
  constructor(private readonly options: HostOptions) { this.profile = new ProfileStore(options.userData); }
  async initialize(): Promise<void> {
    await this.profile.load();
    const state = this.profile.snapshot();
    for (const file of state.recentFiles) await this.files.grantFile(file).catch(() => undefined);
    if (state.session) {
      const session = state.session;
      if (session.workspace) {
        try { session.workspace = await this.files.grantDirectory(session.workspace); }
        catch { delete session.workspace; }
      }
      for (const doc of session.documents) {
        if (!doc.path) continue;
        try {
          doc.path = await this.files.grantFile(doc.path);
          if (!doc.dirty) Object.assign(doc, await this.files.read(doc.path));
        }
        catch {
          // Preserve recovery text even when the disk path disappeared or is no longer local.
          delete doc.path; delete doc.version; doc.dirty = true;
        }
      }
      this.initialSession = session;
    }
    const initial = await this.openPaths(this.options.initialFiles ?? []);
    if (initial.length) {
      const session = this.initialSession ?? { documents: [] };
      for (const file of initial) {
        if (session.documents.some((doc) => doc.path === file.path)) continue; // Never overwrite dirty recovery.
        if (session.documents.length >= LIMITS.documents) throw new HostError("Too many initial documents. Recovery was retained.");
        const id = randomUUID();
        session.documents.push({ id, path: file.path, name: file.name, content: file.content, version: file.version, dirty: false });
        session.activeId = id;
      }
      this.initialSession = validateSession(session);
    }
  }
  bootstrap(): Bootstrap {
    const state = this.profile.snapshot();
    return {
      platform: this.options.platform, version: this.options.version, settings: state.settings,
      recentFiles: state.recentFiles, recentWorkspaces: state.recentWorkspaces,
      ...(this.initialSession ? { session: structuredClone(this.initialSession) } : {}),
      examples: structuredClone([...this.options.examples])
    };
  }
  async openPaths(paths: string[]): Promise<FileDocument[]> {
    if (paths.length > LIMITS.documents) throw new HostError("Too many selected files.");
    const result: FileDocument[] = [];
    for (const candidate of paths) {
      const file = await this.files.read(await this.files.grantFile(localPath(candidate)));
      if (!result.some((item) => item.path === file.path)) result.push(file);
      await this.profile.openedFile(file.path);
    }
    return result;
  }
  async openFiles(): Promise<FileDocument[]> { return this.openPaths(await this.options.dialogs.openFiles() ?? []); }
  async readFile(candidate: unknown): Promise<FileDocument> {
    const file = await this.files.read(candidate); await this.profile.openedFile(file.path); return file;
  }
  async openFolder(): Promise<string | undefined> {
    const folder = await this.options.dialogs.openFolder();
    if (!folder) return undefined;
    const granted = await this.files.grantDirectory(folder);
    this.trustedDirectory = undefined; // Reopening a workspace is a new trust decision.
    await this.profile.openedWorkspace(granted);
    return granted;
  }
  async saveFile(value: unknown): Promise<FileDocument | undefined> {
    const request = record(value);
    const content = text(request.content, "Document", LIMITS.fileBytes);
    const name = text(request.name, "Document name", 256, false);
    const documentId = request.documentId === undefined ? undefined : text(request.documentId, "Document id", 128, false);
    let target: string;
    let expectedVersion = request.expectedVersion === undefined ? undefined : text(request.expectedVersion, "File version", 256, false);
    if (request.path !== undefined) target = localPath(request.path);
    else {
      // The suggested filename is not a path or an authorization capability.
      const suggested = path.basename(name.replace(/[\\/]/g, path.sep)).replace(/[<>:"|?*\x00-\x1f]/g, "_") || "Untitled.plain";
      const selected = await this.options.dialogs.saveFile(suggested);
      if (!selected) return undefined;
      target = await this.files.grantSaveTarget(selected);
      const openDocument = this.profile.snapshot().session?.documents.find((document) => document.path === target);
      if (openDocument && openDocument.id !== documentId) throw new HostError("That file is already open in another tab. Its content has not been overwritten.");
      // Native Save As explicitly authorizes replacing the selected file, not an arbitrary renderer path.
      try { expectedVersion = (await this.files.read(target)).version; }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; expectedVersion = undefined; }
    }
    const file = await this.files.save(target, content, expectedVersion);
    await this.profile.openedFile(file.path);
    return file;
  }
  async confirmClose(name: unknown): Promise<"save" | "discard" | "cancel"> {
    return this.options.dialogs.confirmClose(text(name, "Document name", 256, false));
  }
  async saveSession(value: unknown): Promise<void> {
    const session = validateSession(value);
    await this.files.checkSession(session);
    await this.profile.session(session);
    this.initialSession = session;
  }
  async startRun(value: unknown): Promise<RunSnapshot | undefined> {
    if (this.starting) throw new HostError("A run is already starting.");
    this.starting = true;
    try {
      const request = validateRun(value);
      let baseDir: string;
      let filename = request.filename ?? "Untitled.plain";
      if (path.isAbsolute(filename)) baseDir = path.dirname(await this.files.authorized(filename));
      else if (request.workspace) baseDir = await this.files.authorized(request.workspace, true);
      else {
        baseDir = path.join(this.options.userData, "scratch");
        await fs.mkdir(baseDir, { recursive: true, mode: 0o700 });
        baseDir = await fs.realpath(baseDir);
      }
      if (path.isAbsolute(filename)) filename = await this.files.authorized(filename);
      else if (filename.includes("\0") || /[\\/]/.test(filename)) throw new HostError("Use an authorized absolute filename or a simple document name.");
      if (this.trustedDirectory !== baseDir) {
        if (!await this.options.dialogs.trust(baseDir)) return undefined;
        this.trustedDirectory = baseDir;
      }
      return this.execution.start({
        code: request.code, filename, baseDir, args: request.args, childFile: this.options.childFile,
        timeoutMs: this.profile.snapshot().settings.timeoutSeconds * 1000,
        maxOutputBytes: LIMITS.outputBytes, maxInputBytes: LIMITS.inputBytes
      }).snapshot();
    } finally { this.starting = false; }
  }
  async answerRun(value: unknown): Promise<void> {
    const request = record(value);
    if (!Number.isSafeInteger(request.inputId)) throw new HostError("Invalid input id.");
    this.execution.get(request.id).answer(Number(request.inputId), request.value);
  }
  async close(): Promise<void> { await this.execution.close(); await this.profile.flush(); }
}
