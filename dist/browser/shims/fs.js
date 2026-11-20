"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.existsSync = existsSync;
exports.readFileSync = readFileSync;
exports.statSync = statSync;
function existsSync() { return false; }
function readFileSync() { throw new Error("The browser runtime cannot read local files."); }
function statSync() { throw new Error("The browser runtime cannot inspect local files."); }
//# sourceMappingURL=fs.js.map