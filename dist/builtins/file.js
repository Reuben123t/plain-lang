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
    resolveSafePath(filePath) {
        const resolved = path.resolve(this.baseDir, filePath);
        // Ensure path is within or relative to baseDir to prevent directory traversal
        const relative = path.relative(this.baseDir, resolved);
        if (relative.startsWith("..") && !path.isAbsolute(relative)) {
            throw new plain_error_1.PlainError(`Access to file outside the project folder is not allowed: "${filePath}".`, { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Save and read files inside your project directory."
            });
        }
        return resolved;
    }
    readFile(filePathVal) {
        const rawPath = (0, values_1.plainToString)(filePathVal);
        const safePath = this.resolveSafePath(rawPath);
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
        const safePath = this.resolveSafePath(rawPath);
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
            const safePath = this.resolveSafePath(rawPath);
            return fs.existsSync(safePath);
        }
        catch {
            return false;
        }
    }
}
exports.FileSystemSandbox = FileSystemSandbox;
//# sourceMappingURL=file.js.map