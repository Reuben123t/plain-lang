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
exports.FileSystemSandbox = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
class FileSystemSandbox {
    baseDir;
    constructor(baseDir) {
        this.baseDir = path.resolve(baseDir || process.cwd());
    }
    resolvePath(filePath) {
        const resolved = path.resolve(this.baseDir, filePath);
        const isContained = (root, candidate) => {
            const relative = path.relative(root, candidate);
            return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
        };
        const realPath = (candidate) => {
            let ancestor = candidate;
            const suffix = [];
            while (!fs.existsSync(ancestor)) {
                // A dangling symlink is not a safe location for a new file.
                try {
                    if (fs.lstatSync(ancestor).isSymbolicLink()) {
                        throw new Error("Cannot access a dangling symbolic link.");
                    }
                }
                catch (error) {
                    if (error.code !== "ENOENT")
                        throw error;
                }
                const parent = path.dirname(ancestor);
                if (parent === ancestor)
                    break;
                suffix.unshift(path.basename(ancestor));
                ancestor = parent;
            }
            return path.resolve(fs.realpathSync(ancestor), ...suffix);
        };
        try {
            if (!isContained(this.baseDir, resolved) || !isContained(realPath(this.baseDir), realPath(resolved))) {
                throw new Error("Path is outside the project folder.");
            }
        }
        catch {
            throw new plain_error_1.PlainError(`Access to file outside the project folder is not allowed: "${filePath}".`, { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Save and read files inside your project directory; symbolic links must stay inside it."
            });
        }
        return resolved;
    }
    readFile(filePathVal) {
        const rawPath = (0, values_1.plainToString)(filePathVal);
        const safePath = this.resolvePath(rawPath);
        if (!fs.existsSync(safePath)) {
            throw new plain_error_1.PlainError(`File not found: "${rawPath}".`, { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Check if the file name is spelled correctly and exists in the project folder."
            });
        }
        try {
            return fs.readFileSync(safePath, "utf-8");
        }
        catch (err) {
            throw new plain_error_1.PlainError(`Could not read file "${rawPath}": ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
    }
    writeFile(filePathVal, contentVal) {
        const rawPath = (0, values_1.plainToString)(filePathVal);
        const safePath = this.resolvePath(rawPath);
        const content = (0, values_1.plainToString)(contentVal);
        try {
            const dir = path.dirname(safePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(safePath, content, "utf-8");
        }
        catch (err) {
            throw new plain_error_1.PlainError(`Could not write to file "${rawPath}": ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
    }
    fileExists(filePathVal) {
        const rawPath = (0, values_1.plainToString)(filePathVal);
        try {
            const safePath = this.resolvePath(rawPath);
            return fs.existsSync(safePath) && fs.statSync(safePath).isFile();
        }
        catch {
            return false;
        }
    }
    appendFile(filePathVal, contentVal) {
        const rawPath = (0, values_1.plainToString)(filePathVal);
        const safePath = this.resolvePath(rawPath);
        const content = (0, values_1.plainToString)(contentVal);
        try {
            const dir = path.dirname(safePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.appendFileSync(safePath, content, "utf-8");
        }
        catch (err) {
            throw new plain_error_1.PlainError(`Could not append to file "${rawPath}": ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
    }
    deleteFile(filePathVal) {
        const rawPath = (0, values_1.plainToString)(filePathVal);
        const safePath = this.resolvePath(rawPath);
        if (!fs.existsSync(safePath)) {
            return false;
        }
        try {
            fs.unlinkSync(safePath);
            return true;
        }
        catch (err) {
            throw new plain_error_1.PlainError(`Could not delete file "${rawPath}": ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
    }
    listFiles(dirPathVal) {
        const rawDir = dirPathVal !== undefined ? (0, values_1.plainToString)(dirPathVal) : ".";
        const safeDir = this.resolvePath(rawDir);
        if (!fs.existsSync(safeDir)) {
            throw new plain_error_1.PlainError(`Folder not found: "${rawDir}".`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        try {
            return fs.readdirSync(safeDir);
        }
        catch (err) {
            throw new plain_error_1.PlainError(`Could not list folder "${rawDir}": ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
    }
    fileSize(filePathVal) {
        const rawPath = (0, values_1.plainToString)(filePathVal);
        const safePath = this.resolvePath(rawPath);
        if (!fs.existsSync(safePath)) {
            throw new plain_error_1.PlainError(`File not found: "${rawPath}".`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        return fs.statSync(safePath).size;
    }
    createFolder(dirPathVal) {
        const rawDir = (0, values_1.plainToString)(dirPathVal);
        const safeDir = this.resolvePath(rawDir);
        try {
            if (!fs.existsSync(safeDir)) {
                fs.mkdirSync(safeDir, { recursive: true });
            }
        }
        catch (err) {
            throw new plain_error_1.PlainError(`Could not create folder "${rawDir}": ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
    }
    folderExists(dirPathVal) {
        const rawDir = (0, values_1.plainToString)(dirPathVal);
        try {
            const safeDir = this.resolvePath(rawDir);
            return fs.existsSync(safeDir) && fs.statSync(safeDir).isDirectory();
        }
        catch {
            return false;
        }
    }
}
exports.FileSystemSandbox = FileSystemSandbox;
//# sourceMappingURL=file.js.map