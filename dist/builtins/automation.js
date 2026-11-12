"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.automationBuiltins = void 0;
const child_process = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const os = __importStar(require("os"));
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
const math_1 = require("./math");
exports.automationBuiltins = {
    run_command: (cmdVal) => {
        const cmd = (0, values_1.plainToString)(cmdVal);
        try {
            const output = child_process.execSync(cmd, {
                encoding: "utf-8",
                stdio: ["ignore", "pipe", "pipe"],
                maxBuffer: 10 * 1024 * 1024
            });
            return output.trim();
        }
        catch (err) {
            const out = err.stdout ? String(err.stdout) : "";
            const errout = err.stderr ? String(err.stderr) : "";
            return (out + "\n" + errout).trim() || err.message;
        }
    },
    walk_directory: (dirVal) => {
        const baseDir = path.resolve(dirVal !== undefined ? (0, values_1.plainToString)(dirVal) : ".");
        if (!fs.existsSync(baseDir))
            return [];
        const results = [];
        const traverse = (current) => {
            const entries = fs.readdirSync(current, { withFileTypes: true });
            for (const ent of entries) {
                if (ent.name === "node_modules" || ent.name === ".git")
                    continue;
                const full = path.join(current, ent.name);
                if (ent.isDirectory()) {
                    traverse(full);
                }
                else if (ent.isFile()) {
                    results.push(path.relative(baseDir, full).replace(/\\/g, "/"));
                }
            }
        };
        traverse(baseDir);
        return results;
    },
    find_files: (dirVal, patternVal) => {
        const allFiles = exports.automationBuiltins.walk_directory(dirVal);
        const pattern = (0, values_1.plainToString)(patternVal).toLowerCase();
        return allFiles.filter((f) => f.toLowerCase().includes(pattern));
    },
    copy_file: (srcVal, destVal) => {
        const src = path.resolve((0, values_1.plainToString)(srcVal));
        const dest = path.resolve((0, values_1.plainToString)(destVal));
        if (!fs.existsSync(src)) {
            throw new plain_error_1.PlainError(`Source file not found: "${src}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
        return true;
    },
    move_file: (srcVal, destVal) => {
        const src = path.resolve((0, values_1.plainToString)(srcVal));
        const dest = path.resolve((0, values_1.plainToString)(destVal));
        if (!fs.existsSync(src)) {
            throw new plain_error_1.PlainError(`Source file not found: "${src}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.renameSync(src, dest);
        return true;
    },
    batch_rename: (dirVal, findVal, replaceVal) => {
        const dir = path.resolve((0, values_1.plainToString)(dirVal));
        if (!fs.existsSync(dir))
            return 0;
        const findStr = (0, values_1.plainToString)(findVal);
        const replaceStr = (0, values_1.plainToString)(replaceVal);
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
    batch_delete: (dirVal, patternVal) => {
        const dir = path.resolve((0, values_1.plainToString)(dirVal));
        if (!fs.existsSync(dir))
            return 0;
        const pattern = (0, values_1.plainToString)(patternVal).toLowerCase();
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
    log_info: (msgVal) => {
        const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
        console.log(`[${timestamp}] [INFO]  ${(0, values_1.plainToString)(msgVal)}`);
    },
    log_warn: (msgVal) => {
        const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
        console.warn(`[${timestamp}] [WARN]  ${(0, values_1.plainToString)(msgVal)}`);
    },
    log_error: (msgVal) => {
        const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
        console.error(`[${timestamp}] [ERROR] ${(0, values_1.plainToString)(msgVal)}`);
    },
    parse_env_file: (filePathVal) => {
        const fp = path.resolve((0, values_1.plainToString)(filePathVal));
        if (!fs.existsSync(fp))
            return [];
        const content = fs.readFileSync(fp, "utf-8");
        const lines = content.split(/\r?\n/);
        const result = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#"))
                continue;
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
    checksum_file: (filePathVal, algoVal) => {
        const fp = path.resolve((0, values_1.plainToString)(filePathVal));
        if (!fs.existsSync(fp)) {
            throw new plain_error_1.PlainError(`File not found: "${fp}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        const algo = algoVal !== undefined ? (0, values_1.plainToString)(algoVal).toLowerCase() : "sha256";
        const buffer = fs.readFileSync(fp);
        return crypto.createHash(algo).update(buffer).digest("hex");
    },
    get_clipboard: () => {
        try {
            if (os.platform() === "win32") {
                return child_process.execSync("powershell -NoProfile -Command Get-Clipboard", { encoding: "utf-8" }).trim();
            }
            else if (os.platform() === "darwin") {
                return child_process.execSync("pbpaste", { encoding: "utf-8" }).trim();
            }
            else {
                return child_process.execSync("xclip -selection clipboard -o", { encoding: "utf-8" }).trim();
            }
        }
        catch {
            return "";
        }
    },
    set_clipboard: (textVal) => {
        const text = (0, values_1.plainToString)(textVal);
        try {
            if (os.platform() === "win32") {
                const escaped = text.replace(/"/g, '""');
                child_process.execSync(`powershell -NoProfile -Command "Set-Clipboard -Value \\"${escaped}\\""`);
                return true;
            }
            else if (os.platform() === "darwin") {
                const proc = child_process.spawn("pbcopy");
                proc.stdin.write(text);
                proc.stdin.end();
                return true;
            }
            else {
                const proc = child_process.spawn("xclip", ["-selection", "clipboard"]);
                proc.stdin.write(text);
                proc.stdin.end();
                return true;
            }
        }
        catch {
            return false;
        }
    },
    delay: async (secondsVal) => {
        const sec = math_1.mathBuiltins.to_number(secondsVal);
        const ms = Math.max(0, sec * 1000);
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
//# sourceMappingURL=automation.js.map