"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = formatError;
const plain_error_1 = require("./plain-error");
function formatError(error, fallbackSource) {
    if (!(error instanceof plain_error_1.PlainError)) {
        if (error instanceof Error) {
            return `[Internal Error] ${error.message}`;
        }
        return `[Unknown Error] ${String(error)}`;
    }
    const { message, location, sourceCode, suggestion } = error;
    const source = sourceCode || fallbackSource || "";
    const lines = source ? source.split(/\r?\n/) : [];
    const fileLabel = location.sourceFile ? `${location.sourceFile}:` : "";
    const header = `Error at ${fileLabel}line ${location.line}, column ${location.column}:`;
    let snippet = "";
    if (lines.length > 0 && location.line >= 1 && location.line <= lines.length) {
        const rawLine = lines[location.line - 1];
        const lineNumStr = String(location.line).padStart(3, " ");
        const gutter = ` ${lineNumStr} | `;
        const pointerSpaces = " ".repeat(gutter.length + Math.max(0, location.column - 1));
        snippet = `\n${gutter}${rawLine}\n${pointerSpaces}^`;
    }
    let result = `${header}\n${snippet}\n\n${message}`;
    if (suggestion) {
        result += `\n\nSuggestion: ${suggestion}`;
    }
    return result;
}
//# sourceMappingURL=formatter.js.map