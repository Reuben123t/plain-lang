import type { FileDocument, SessionDocument } from "../shared/contracts";

export type EditorDocument = SessionDocument;

type Entry = { document: EditorDocument; base?: string; format: string };

/** Lexical identity only: no filesystem access, and POSIX paths remain case-sensitive. */
export function documentPathKey(path: string): string {
  const windows = /^[a-z]:[\\/]/i.test(path) || /^\\\\|^\/\//.test(path);
  const slashes = path.replace(/\\/g, "/");
  const prefix = slashes.startsWith("//") ? "//" : slashes.startsWith("/") ? "/" : "";
  const parts: string[] = [];
  for (const part of slashes.slice(prefix.length).split("/")) {
    if (!part || part === ".") continue;
    if (part === ".." && parts.length && parts[parts.length - 1] !== ".." && !/^[a-z]:$/i.test(parts[parts.length - 1])) parts.pop();
    else if (part !== ".." || !prefix) parts.push(part);
  }
  const key = prefix + parts.join("/");
  return windows ? key.toLowerCase() : key;
}

const withoutBOM = (value: string) => value.startsWith("\uFEFF") ? value.slice(1) : value;
const normalizedBody = (value: string) => withoutBOM(value).replace(/\r\n|\r/g, "\n");

/** Restore the encoding details hidden/normalized by a Monaco text model. */
export function preserveDocumentContent(content: string, reference: string): string {
  const bom = reference.startsWith("\uFEFF") || content.startsWith("\uFEFF") ? "\uFEFF" : "";
  // In particular, merely opening a mixed-EOL file must never rewrite it.
  if (normalizedBody(content) === normalizedBody(reference)) return bom + withoutBOM(reference);
  const eol = /\r\n|\n|\r/.exec(reference)?.[0] ?? /\r\n|\n|\r/.exec(content)?.[0] ?? "\n";
  return bom + normalizedBody(content).replace(/\n/g, eol);
}

/** Pure renderer session state. Returned documents are snapshots, never mutable store entries. */
export class DocumentStore {
  private entries = new Map<string, Entry>();
  private selected?: string;

  constructor(initial: readonly EditorDocument[] = [], activeId?: string) {
    for (const document of initial) this.add(document);
    this.selected = activeId && this.entries.has(activeId) ? activeId : this.entries.keys().next().value;
  }

  get documents(): EditorDocument[] { return this.snapshot(); }
  get activeId(): string | undefined { return this.selected; }
  get active(): EditorDocument | undefined { return this.selected ? this.get(this.selected) : undefined; }

  get(id: string): EditorDocument | undefined {
    const entry = this.entries.get(id);
    return entry ? { ...entry.document } : undefined;
  }

  /** Reopening an id/path selects its original buffer; it never destroys unsaved edits. */
  add(document: EditorDocument): EditorDocument {
    const key = document.path ? documentPathKey(document.path) : undefined;
    const existing = this.entries.get(document.id) ?? (key === undefined ? undefined : [...this.entries.values()].find((entry) =>
      entry.document.path !== undefined && documentPathKey(entry.document.path) === key));
    if (existing) {
      this.selected = existing.document.id;
      return { ...existing.document };
    }
    const copy = { ...document };
    this.entries.set(copy.id, { document: copy, base: copy.dirty ? undefined : copy.content, format: copy.content });
    this.selected = copy.id;
    return { ...copy };
  }

  open(id: string): EditorDocument | undefined {
    const document = this.get(id);
    if (document) this.selected = id;
    return document;
  }

  /** Accept model text, including text whose leading BOM has been stripped by Monaco. */
  update(id: string, content: string): EditorDocument | undefined {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    const restored = preserveDocumentContent(content, entry.format);
    entry.document = { ...entry.document, content: restored, dirty: entry.base === undefined || restored !== entry.base };
    return { ...entry.document };
  }

  /** Record the actual saved snapshot, retaining edits made while the save was pending. */
  markSaved(id: string, file: FileDocument): EditorDocument | undefined {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    const key = documentPathKey(file.path);
    if ([...this.entries.values()].some((other) => other !== entry && other.document.path && documentPathKey(other.document.path) === key)) {
      throw new Error("That file is already open in another document.");
    }
    const content = preserveDocumentContent(entry.document.content, file.content);
    entry.base = file.content;
    entry.format = file.content;
    entry.document = { ...entry.document, name: file.name, path: file.path, version: file.version, content, dirty: content !== file.content };
    return { ...entry.document };
  }

  /** Deliberate, user-approved reload; unlike markSaved this replaces pending edits. */
  reload(id: string, file: FileDocument): EditorDocument | undefined {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    const key = documentPathKey(file.path);
    if ([...this.entries.values()].some((other) => other !== entry && other.document.path && documentPathKey(other.document.path) === key)) {
      throw new Error("That file is already open in another document.");
    }
    entry.base = file.content;
    entry.format = file.content;
    entry.document = { ...entry.document, ...file, id, dirty: false };
    return { ...entry.document };
  }

  /** Keep local edits after a disk conflict, acknowledging the version but not a false saved base. */
  acknowledgeExternal(id: string, version: string): EditorDocument | undefined {
    const entry = this.entries.get(id);
    if (!entry) return undefined;
    entry.base = undefined;
    entry.document = { ...entry.document, version, dirty: true };
    return { ...entry.document };
  }

  close(id: string): EditorDocument | undefined {
    const document = this.get(id);
    if (!document) return undefined;
    const ids = [...this.entries.keys()];
    const index = ids.indexOf(id);
    this.entries.delete(id);
    if (this.selected === id) this.selected = ids[index + 1] ?? ids[index - 1];
    return document;
  }

  snapshot(): EditorDocument[] { return [...this.entries.values()].map((entry) => ({ ...entry.document })); }
}
