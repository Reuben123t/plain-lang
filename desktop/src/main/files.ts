import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type { DirectoryEntry, FileDocument, Session } from "../shared/contracts";
import { contains, HostError, LIMITS, localPath, text } from "./validation";

export function versionOf(content: Uint8Array): string { return createHash("sha256").update(content).digest("hex"); }

/** Write beside the destination, sync, then replace. Never delete the original as a rename fallback. */
export async function atomicWrite(destination: string, content: string, beforeReplace?: () => Promise<void>): Promise<void> {
  const temporary = path.join(path.dirname(destination), `.${path.basename(destination)}.${randomUUID()}.tmp`);
  let handle: Awaited<ReturnType<typeof fs.open>> | undefined;
  try {
    handle = await fs.open(temporary, "wx", 0o600);
    await handle.writeFile(content, "utf8");
    await handle.sync();
    await handle.close(); handle = undefined;
    await beforeReplace?.();
    await fs.rename(temporary, destination);
  } finally {
    await handle?.close().catch(() => undefined);
    await fs.unlink(temporary).catch(() => undefined);
  }
}

export class FileAccess {
  private readonly files = new Set<string>();
  private readonly roots = new Set<string>();
  private writes: Promise<unknown> = Promise.resolve();

  async grantFile(candidate: string): Promise<string> {
    const resolved = localPath(await fs.realpath(localPath(candidate)));
    if (!(await fs.stat(resolved)).isFile()) throw new HostError("Choose a regular file.");
    this.files.add(resolved);
    return resolved;
  }
  async grantDirectory(candidate: string): Promise<string> {
    const resolved = localPath(await fs.realpath(localPath(candidate)));
    if (!(await fs.stat(resolved)).isDirectory()) throw new HostError("Choose a directory.");
    this.roots.add(resolved);
    return resolved;
  }
  async authorized(candidate: unknown, directory = false): Promise<string> {
    const requested = localPath(candidate);
    const resolved = localPath(await fs.realpath(requested));
    const rootGranted = [...this.roots].some((root) => contains(root, requested) && contains(root, resolved));
    if (!rootGranted && (directory || requested !== resolved || !this.files.has(resolved))) throw new HostError("This path has not been granted by a native dialog or restored session.");
    const info = await fs.stat(resolved);
    if (directory ? !info.isDirectory() : !info.isFile()) throw new HostError(directory ? "Not a directory." : "Not a regular file.");
    return resolved;
  }
  async read(candidate: unknown): Promise<FileDocument> {
    const resolved = await this.authorized(candidate);
    const content = await this.readBounded(resolved);
    // Recheck after reading so swapping a directory symlink cannot return out-of-scope content.
    if (await this.authorized(candidate) !== resolved) throw new HostError("The file path changed while reading.");
    let decoded: string;
    try { decoded = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(content); }
    catch { throw new HostError("This file is not valid UTF-8 text. Convert a copy to UTF-8 before opening it in Plain Studio."); }
    if (decoded.includes("\0")) throw new HostError("This looks like a binary file. Only UTF-8 text files can be edited.");
    return { path: resolved, name: path.basename(resolved), content: decoded, version: versionOf(content) };
  }
  private async readBounded(candidate: string): Promise<Buffer> {
    const handle = await fs.open(candidate, "r");
    try {
      const info = await handle.stat();
      if (!info.isFile() || info.size > LIMITS.fileBytes) throw new HostError(`Files must be regular files no larger than ${LIMITS.fileBytes} bytes.`);
      const buffer = Buffer.alloc(Math.min(info.size + 1, LIMITS.fileBytes + 1));
      let length = 0;
      while (length < buffer.length) {
        const result = await handle.read(buffer, length, buffer.length - length, null);
        if (!result.bytesRead) break;
        length += result.bytesRead;
      }
      if (length > LIMITS.fileBytes || length > info.size) throw new HostError("The file grew while reading. Try opening it again.");
      return buffer.subarray(0, length);
    } finally { await handle.close(); }
  }
  async list(candidate: unknown): Promise<DirectoryEntry[]> {
    const resolved = await this.authorized(candidate, true);
    const directory = await fs.opendir(resolved);
    const result: DirectoryEntry[] = [];
    let visited = 0;
    try {
      for await (const entry of directory) {
        if (++visited > LIMITS.entries) throw new HostError(`Directory exceeds the ${LIMITS.entries}-entry limit. Open a smaller folder.`);
        if (entry.isSymbolicLink() || (!entry.isDirectory() && !entry.isFile())) continue;
        const entryPath = path.join(resolved, entry.name);
        try {
          const real = await this.authorized(entryPath, entry.isDirectory());
          if (real !== entryPath) continue;
          result.push({ name: entry.name, path: real, directory: entry.isDirectory() });
        } catch { /* A disappearing entry or reparse point is never exposed. */ }
      }
    } finally { await directory.close().catch(() => undefined); }
    if (await this.authorized(candidate, true) !== resolved) throw new HostError("The directory changed while listing.");
    return result.sort((a, b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name));
  }
  async grantSaveTarget(candidate: string): Promise<string> {
    const requested = localPath(candidate);
    const parent = localPath(await fs.realpath(path.dirname(requested)));
    const target = path.join(parent, path.basename(requested));
    try { return await this.grantFile(target); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      this.files.add(target); return target;
    }
  }
  async save(candidate: unknown, contentValue: unknown, expectedVersion?: string): Promise<FileDocument> {
    const requested = localPath(candidate);
    const content = text(contentValue, "Document", LIMITS.fileBytes);
    const operation = this.writes.then(async () => {
      const parent = localPath(await fs.realpath(path.dirname(requested)));
      const target = path.join(parent, path.basename(requested));
      if (target !== requested || (!this.files.has(target) && ![...this.roots].some((root) => contains(root, target)))) throw new HostError("This save path has not been granted.");
      const check = async () => {
        if (localPath(await fs.realpath(path.dirname(target))) !== parent) throw new HostError("The save directory changed.");
        try {
          // Never follow a symlink introduced after a file was opened.
          if ((await fs.lstat(target)).isSymbolicLink() || await this.authorized(target) !== target) throw new HostError("The save target changed.");
          const current = versionOf(await this.readBounded(target));
          if (!expectedVersion || current !== expectedVersion) throw new HostError("Save conflict: the file changed on disk. Your editor content has been kept. Reopen it or use Save As.");
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
          if (expectedVersion !== undefined) throw new HostError("Save conflict: the file was removed. Your editor content has been kept.");
        }
      };
      await check();
      await atomicWrite(target, content, check);
      this.files.add(target);
      return { path: target, name: path.basename(target), content, version: versionOf(Buffer.from(content, "utf8")) };
    });
    this.writes = operation.catch(() => undefined);
    return operation;
  }
  async checkSession(session: Session): Promise<void> {
    if (session.workspace) await this.authorized(session.workspace, true);
    for (const document of session.documents) {
      if (!document.path) continue;
      try { await this.authorized(document.path); }
      catch (error) {
        // Deleted, previously granted files remain recoverable; arbitrary paths do not become grants.
        if ((error as NodeJS.ErrnoException).code !== "ENOENT" || !this.files.has(document.path)) throw error;
      }
    }
  }
}
