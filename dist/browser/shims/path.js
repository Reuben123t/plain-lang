"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = resolve;
exports.join = join;
exports.dirname = dirname;
function normalize(parts) {
    const stack = [];
    for (const part of parts.join("/").split("/")) {
        if (!part || part === ".")
            continue;
        if (part === "..")
            stack.pop();
        else
            stack.push(part);
    }
    return "/" + stack.join("/");
}
function resolve(...parts) { return normalize(parts); }
function join(...parts) { return normalize(parts); }
function dirname(value) { const normalized = normalize([value]); return normalized.slice(0, normalized.lastIndexOf("/")) || "/"; }
//# sourceMappingURL=path.js.map