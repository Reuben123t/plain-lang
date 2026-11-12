import * as child_process from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as os from "os";
import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";
import { mathBuiltins } from "./math";

export const automationBuiltins = {
  run_command: (cmdVal: PlainValue): string => {
    const cmd = plainToString(cmdVal);
    try {
      const output = child_process.execSync(cmd, {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 10 * 1024 * 1024
      });
      return output.trim();
    } catch (err: any) {
      const out = err.stdout ? String(err.stdout) : "";
      const errout = err.stderr ? String(err.stderr) : "";
      return (out + "\n" + errout).trim() || err.message;
    }
  },

  walk_directory: (dirVal?: PlainValue): string[] => {
    const baseDir = path.resolve(dirVal !== undefined ? plainToString(dirVal) : ".");
    if (!fs.existsSync(baseDir)) return [];

    const results: string[] = [];
    const traverse = (current: string) => {
      const entries = fs.readdirSync(current, { withFileTypes: true });
      for (const ent of entries) {
        if (ent.name === "node_modules" || ent.name === ".git") continue;
        const full = path.join(current, ent.name);
        if (ent.isDirectory()) {
          traverse(full);
        } else if (ent.isFile()) {
          results.push(path.relative(baseDir, full).replace(/\\/g, "/"));
        }
      }
    };

    traverse(baseDir);
    return results;
  },

  find_files: (dirVal: PlainValue, patternVal: PlainValue): string[] => {
    const allFiles = automationBuiltins.walk_directory(dirVal);
    const pattern = plainToString(patternVal).toLowerCase();
    return allFiles.filter((f) => f.toLowerCase().includes(pattern));
  },

  copy_file: (srcVal: PlainValue, destVal: PlainValue): boolean => {
    const src = path.resolve(plainToString(srcVal));
    const dest = path.resolve(plainToString(destVal));
    if (!fs.existsSync(src)) {
      throw new PlainError(`Source file not found: "${src}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    return true;
  },

  move_file: (srcVal: PlainValue, destVal: PlainValue): boolean => {
    const src = path.resolve(plainToString(srcVal));
    const dest = path.resolve(plainToString(destVal));
    if (!fs.existsSync(src)) {
      throw new PlainError(`Source file not found: "${src}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.renameSync(src, dest);
    return true;
  },

  batch_rename: (
    dirVal: PlainValue,
    findVal: PlainValue,
    replaceVal: PlainValue
  ): number => {
    const dir = path.resolve(plainToString(dirVal));
    if (!fs.existsSync(dir)) return 0;
    const findStr = plainToString(findVal);
    const replaceStr = plainToString(replaceVal);
    let count = 0;

    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.includes(findStr)) {
        const oldPath = path.join(dir, f);
        const newPath = path.join(dir, f.replace(findStr, replaceStr));
        fs.renameSync(oldPath, newPath);
        count++;
      }
    }
    return count;
  },

  batch_delete: (dirVal: PlainValue, patternVal: PlainValue): number => {
    const dir = path.resolve(plainToString(dirVal));
    if (!fs.existsSync(dir)) return 0;
    const pattern = plainToString(patternVal).toLowerCase();
    let count = 0;

    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f.toLowerCase().includes(pattern)) {
        const p = path.join(dir, f);
        if (fs.statSync(p).isFile()) {
          fs.unlinkSync(p);
          count++;
        }
      }
    }
    return count;
  },

  log_info: (msgVal: PlainValue): void => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    console.log(`[${timestamp}] [INFO]  ${plainToString(msgVal)}`);
  },

  log_warn: (msgVal: PlainValue): void => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    console.warn(`[${timestamp}] [WARN]  ${plainToString(msgVal)}`);
  },

  log_error: (msgVal: PlainValue): void => {
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    console.error(`[${timestamp}] [ERROR] ${plainToString(msgVal)}`);
  },

  parse_env_file: (filePathVal: PlainValue): string[] => {
    const fp = path.resolve(plainToString(filePathVal));
    if (!fs.existsSync(fp)) return [];
    const content = fs.readFileSync(fp, "utf-8");
    const lines = content.split(/\r?\n/);
    const result: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
        result.push(`${key}: ${val}`);
      }
    }
    return result;
  },

  checksum_file: (filePathVal: PlainValue, algoVal?: PlainValue): string => {
    const fp = path.resolve(plainToString(filePathVal));
    if (!fs.existsSync(fp)) {
      throw new PlainError(`File not found: "${fp}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const algo = algoVal !== undefined ? plainToString(algoVal).toLowerCase() : "sha256";
    const buffer = fs.readFileSync(fp);
    return crypto.createHash(algo).update(buffer).digest("hex");
  },

  get_clipboard: (): string => {
    try {
      if (os.platform() === "win32") {
        return child_process.execSync("powershell -NoProfile -Command Get-Clipboard", { encoding: "utf-8" }).trim();
      } else if (os.platform() === "darwin") {
        return child_process.execSync("pbpaste", { encoding: "utf-8" }).trim();
      } else {
        return child_process.execSync("xclip -selection clipboard -o", { encoding: "utf-8" }).trim();
      }
    } catch {
      return "";
    }
  },

  set_clipboard: (textVal: PlainValue): boolean => {
    const text = plainToString(textVal);
    try {
      if (os.platform() === "win32") {
        const escaped = text.replace(/"/g, '""');
        child_process.execSync(`powershell -NoProfile -Command "Set-Clipboard -Value \\"${escaped}\\""`);
        return true;
      } else if (os.platform() === "darwin") {
        const proc = child_process.spawn("pbcopy");
        proc.stdin.write(text);
        proc.stdin.end();
        return true;
      } else {
        const proc = child_process.spawn("xclip", ["-selection", "clipboard"]);
        proc.stdin.write(text);
        proc.stdin.end();
        return true;
      }
    } catch {
      return false;
    }
  },

  delay: async (secondsVal: PlainValue): Promise<void> => {
    const sec = mathBuiltins.to_number(secondsVal);
    const ms = Math.max(0, sec * 1000);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
