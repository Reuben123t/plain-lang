import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { Session, Settings } from "../shared/contracts";
import { atomicWrite } from "./files";
import { LIMITS, localPath, record, restoredSettings, validateSession, validateSettings } from "./validation";

interface Profile { settings: Settings; recentFiles: string[]; recentWorkspaces: string[]; session?: Session }
function recent(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.slice(0, LIMITS.recent).flatMap((item) => { try { return [localPath(item)]; } catch { return []; } }))];
}

/** A single bounded, versioned profile prevents settings/session writes from racing each other. */
export class ProfileStore {
  private value: Profile = { settings: restoredSettings(undefined), recentFiles: [], recentWorkspaces: [] };
  private pending: Promise<unknown> = Promise.resolve();
  readonly filename: string;
  constructor(readonly directory: string) { this.filename = path.join(directory, "desktop-state.json"); }
  async load(): Promise<void> {
    await fs.mkdir(this.directory, { recursive: true, mode: 0o700 });
    let handle: Awaited<ReturnType<typeof fs.open>> | undefined;
    try {
      handle = await fs.open(this.filename, "r");
      const info = await handle.stat();
      if (!info.isFile() || info.size > LIMITS.profileBytes) return;
      const buffer = Buffer.alloc(info.size + 1);
      let length = 0;
      while (length < buffer.length) {
        const read = await handle.read(buffer, length, buffer.length - length, null);
        if (!read.bytesRead) break;
        length += read.bytesRead;
      }
      if (length > info.size) return;
      const data = record(JSON.parse(buffer.subarray(0, length).toString("utf8")) as unknown);
      if (data.schema !== 1) return;
      let session: Session | undefined;
      try { if (data.session) session = validateSession(data.session); } catch { /* Keep valid settings when recovery is corrupt. */ }
      this.value = { settings: restoredSettings(data.settings), recentFiles: recent(data.recentFiles), recentWorkspaces: recent(data.recentWorkspaces), ...(session ? { session } : {}) };
    } catch (error) {
      if (!["ENOENT", "EACCES"].includes((error as NodeJS.ErrnoException).code ?? "") && !(error instanceof SyntaxError) && !(error instanceof Error && error.name === "HostError")) throw error;
    } finally { await handle?.close(); }
  }
  snapshot(): Profile { return structuredClone(this.value); }
  private update(change: (value: Profile) => void): Promise<void> {
    const operation = this.pending.then(async () => {
      const next = structuredClone(this.value);
      change(next);
      const serialized = JSON.stringify({ schema: 1, ...next });
      if (Buffer.byteLength(serialized) > LIMITS.profileBytes) throw new Error("Recovery profile size limit reached. Your open documents have not been discarded.");
      await atomicWrite(this.filename, serialized);
      this.value = next;
    });
    this.pending = operation.catch(() => undefined);
    return operation;
  }
  async settings(value: unknown): Promise<Settings> {
    const settings = validateSettings(value);
    await this.update((profile) => { profile.settings = settings; });
    return settings;
  }
  async session(value: unknown): Promise<void> {
    const session = validateSession(value);
    await this.update((profile) => { profile.session = session; });
  }
  async openedFile(candidate: string): Promise<void> {
    const file = localPath(candidate);
    await this.update((profile) => { profile.recentFiles = [file, ...profile.recentFiles.filter((item) => item !== file)].slice(0, LIMITS.recent); });
  }
  async openedWorkspace(candidate: string): Promise<void> {
    const workspace = localPath(candidate);
    await this.update((profile) => { profile.recentWorkspaces = [workspace, ...profile.recentWorkspaces.filter((item) => item !== workspace)].slice(0, LIMITS.recent); });
  }
  async flush(): Promise<void> { await this.pending; }
}
