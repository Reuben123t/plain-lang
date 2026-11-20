import * as path from "node:path";
import { DEFAULT_SETTINGS } from "../shared/contracts";
import type { RunRequest, Session, Settings } from "../shared/contracts";

export const LIMITS = {
  fileBytes: 2 * 1024 * 1024, sessionBytes: 12 * 1024 * 1024, profileBytes: 16 * 1024 * 1024,
  documents: 32, entries: 2000, recent: 20, outputBytes: 1024 * 1024, inputBytes: 16 * 1024,
  args: 128, argBytes: 32 * 1024, path: 4096
} as const;

export class HostError extends Error {
  constructor(message: string) { super(message); this.name = "HostError"; }
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new HostError("Expected an object.");
  return value as Record<string, unknown>;
}
export function text(value: unknown, label: string, max: number, empty = true): string {
  if (typeof value !== "string" || (!empty && !value.length) || Buffer.byteLength(value, "utf8") > max) {
    throw new HostError(`${label} is missing or exceeds its size limit.`);
  }
  return value;
}
export function localPath(value: unknown): string {
  const candidate = text(value, "Local file path", LIMITS.path, false);
  if (candidate.includes("\0") || !path.isAbsolute(candidate) || /^[\\/]{2}/.test(candidate)
      || (process.platform === "win32" && (candidate.slice(2).includes(":") || /(^|[\\/])(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|[\\/]|$)/i.test(candidate)))) {
    throw new HostError("Only absolute local filesystem paths are allowed.");
  }
  return path.normalize(candidate);
}
export function contains(root: string, candidate: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}
function integer(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) throw new HostError(`Invalid ${label}.`);
  return value;
}
export function validateSettings(value: unknown): Settings {
  const item = record(value);
  if (!["dark", "light", "system"].includes(String(item.theme)) || typeof item.wordWrap !== "boolean" || typeof item.minimap !== "boolean") throw new HostError("Invalid editor settings.");
  return {
    theme: item.theme as Settings["theme"], fontSize: integer(item.fontSize, 10, 32, "font size"),
    tabSize: integer(item.tabSize, 1, 8, "tab size"), wordWrap: item.wordWrap, minimap: item.minimap,
    timeoutSeconds: integer(item.timeoutSeconds, 1, 300, "timeout")
  };
}
export function restoredSettings(value: unknown): Settings {
  try { return validateSettings(value); } catch { return { ...DEFAULT_SETTINGS }; }
}
export function validateSession(value: unknown): Session {
  const item = record(value);
  if (!Array.isArray(item.documents) || item.documents.length > LIMITS.documents) throw new HostError("Too many session documents.");
  const ids = new Set<string>();
  const paths = new Set<string>();
  let bytes = 0;
  const documents = item.documents.map((value) => {
    const doc = record(value);
    const id = text(doc.id, "Document id", 128, false);
    if (ids.has(id) || typeof doc.dirty !== "boolean") throw new HostError("Invalid session document.");
    ids.add(id);
    if (doc.path !== undefined) {
      const candidate = localPath(doc.path);
      const key = process.platform === "win32" ? candidate.toLowerCase() : candidate;
      if (paths.has(key)) throw new HostError("A file cannot appear twice in a recovery session.");
      paths.add(key);
    }
    const content = text(doc.content, "Document", LIMITS.fileBytes);
    bytes += Buffer.byteLength(content, "utf8");
    if (bytes > LIMITS.sessionBytes) throw new HostError("Session recovery size limit reached.");
    return {
      id, name: text(doc.name, "Document name", 256, false), content, dirty: doc.dirty,
      ...(doc.path !== undefined ? { path: localPath(doc.path) } : {}),
      ...(doc.version !== undefined ? { version: text(doc.version, "File version", 256, false) } : {})
    };
  });
  const activeId = item.activeId === undefined ? undefined : text(item.activeId, "Active document", 128, false);
  if (activeId && !ids.has(activeId)) throw new HostError("Active document is not in the session.");
  return {
    documents, ...(item.workspace !== undefined ? { workspace: localPath(item.workspace) } : {}),
    ...(activeId ? { activeId } : {}),
    ...(item.sidebarWidth !== undefined ? { sidebarWidth: integer(item.sidebarWidth, 120, 1000, "sidebar width") } : {}),
    ...(item.panelHeight !== undefined ? { panelHeight: integer(item.panelHeight, 80, 1000, "panel height") } : {})
  };
}
export function validateRun(value: unknown): RunRequest {
  const item = record(value);
  if (!Array.isArray(item.args) || item.args.length > LIMITS.args) throw new HostError("Too many program arguments.");
  const args = item.args.map((arg) => text(arg, "Program argument", LIMITS.argBytes));
  if (args.reduce((size, arg) => size + Buffer.byteLength(arg, "utf8"), 0) > LIMITS.argBytes) throw new HostError("Program arguments exceed the size limit.");
  return {
    code: text(item.code, "Source code", LIMITS.fileBytes), args,
    ...(item.filename !== undefined ? { filename: text(item.filename, "Filename", LIMITS.path, false) } : {}),
    ...(item.workspace !== undefined ? { workspace: localPath(item.workspace) } : {})
  };
}
