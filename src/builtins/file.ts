import * as fs from "fs";
import * as path from "path";
import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";

export class FileSystemSandbox {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = path.resolve(baseDir || process.cwd());
  }

  private resolveSafePath(filePath: string): string {
    const resolved = path.resolve(this.baseDir, filePath);
    // Ensure path is within or relative to baseDir to prevent directory traversal
    const relative = path.relative(this.baseDir, resolved);
    if (relative.startsWith("..") && !path.isAbsolute(relative)) {
      throw new PlainError(
        `Access to file outside the project folder is not allowed: "${filePath}".`,
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Save and read files inside your project directory."
        }
      );
    }
    return resolved;
  }

  public readFile(filePathVal: PlainValue): string {
    const rawPath = plainToString(filePathVal);
    const safePath = this.resolveSafePath(rawPath);
    if (!fs.existsSync(safePath)) {
      throw new PlainError(
        `File not found: "${rawPath}".`,
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Check if the file name is spelled correctly and exists in the project folder."
        }
      );
    }
    try {
      return fs.readFileSync(safePath, "utf-8");
    } catch (err: any) {
      throw new PlainError(
        `Could not read file "${rawPath}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  }

  public writeFile(filePathVal: PlainValue, contentVal: PlainValue): void {
    const rawPath = plainToString(filePathVal);
    const safePath = this.resolveSafePath(rawPath);
    const content = plainToString(contentVal);
    try {
      const dir = path.dirname(safePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(safePath, content, "utf-8");
    } catch (err: any) {
      throw new PlainError(
        `Could not write to file "${rawPath}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  }

  public fileExists(filePathVal: PlainValue): boolean {
    const rawPath = plainToString(filePathVal);
    try {
      const safePath = this.resolveSafePath(rawPath);
      return fs.existsSync(safePath);
    } catch {
      return false;
    }
  }
}
