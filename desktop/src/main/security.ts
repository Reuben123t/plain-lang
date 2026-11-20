import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { contains, localPath } from "./validation";

export function isRendererURL(candidate: string, indexFile: string): boolean {
  try {
    const url = new URL(candidate);
    return url.protocol === "file:" && !url.host && !url.search && localPath(fileURLToPath(url)) === path.resolve(indexFile);
  } catch { return false; }
}
export function isOfflineResource(candidate: string, rendererDirectory: string): boolean {
  try {
    const url = new URL(candidate);
    return url.protocol === "file:" && !url.host && contains(path.resolve(rendererDirectory), localPath(fileURLToPath(url)));
  } catch { return false; }
}
export function initialFileArguments(argv: readonly string[], packaged: boolean, cwd: string): string[] {
  return argv.slice(packaged ? 1 : 2).filter((arg) => arg && !arg.startsWith("-")).slice(0, 32).map((arg) => localPath(path.resolve(cwd, arg)));
}
