function normalize(parts: string[]): string {
  const stack: string[] = [];
  for (const part of parts.join("/").split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") stack.pop();
    else stack.push(part);
  }
  return "/" + stack.join("/");
}
export function resolve(...parts: string[]): string { return normalize(parts); }
export function join(...parts: string[]): string { return normalize(parts); }
export function dirname(value: string): string { const normalized = normalize([value]); return normalized.slice(0, normalized.lastIndexOf("/")) || "/"; }
