"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSource = formatSource;
function codeBeforeComment(line) {
    let quote = "";
    let escaped = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (quote) {
            if (escaped)
                escaped = false;
            else if (char === "\\")
                escaped = true;
            else if (char === quote)
                quote = "";
        }
        else if (char === "'" || char === '"')
            quote = char;
        else if (char === "#")
            return line.slice(0, i);
    }
    return line;
}
function delimiters(line) {
    const code = codeBeforeComment(line);
    let quote = "";
    let escaped = false;
    let opens = 0;
    let closes = 0;
    for (const char of code) {
        if (quote) {
            if (escaped)
                escaped = false;
            else if (char === "\\")
                escaped = true;
            else if (char === quote)
                quote = "";
        }
        else if (char === "'" || char === '"')
            quote = char;
        else if (char === "[" || char === "{" || char === "(")
            opens++;
        else if (char === "]" || char === "}" || char === ")")
            closes++;
    }
    return { opens, closes };
}
function blockKind(code) {
    const first = code.trim().toLowerCase();
    if (!first)
        return undefined;
    if (/^end\b/.test(first))
        return "close";
    if (/^(?:else\b|elif\b|otherwise\b)/.test(first))
        return "branch";
    if (/^(?:if\b|def\b|to\b|for\b|while\b|repeat\b)/.test(first))
        return "open";
    return undefined;
}
/** Format block indentation without changing tokens, comments, or line endings. */
function formatSource(source, options = {}) {
    if (!source)
        return source;
    const unit = options.insertSpaces === false ? "\t" : " ".repeat(Math.max(1, Math.floor(options.tabSize ?? 4)));
    const lines = source.match(/[^\r\n]*(?:\r\n|\n|\r|$)/g)?.filter((line, index, all) => line.length > 0 || index < all.length - 1) ?? [source];
    let blockDepth = 0;
    let delimiterDepth = 0;
    let pendingOpen = false;
    const result = [];
    for (const rawLine of lines) {
        const ending = rawLine.endsWith("\r\n") ? "\r\n" : rawLine.endsWith("\n") ? "\n" : rawLine.endsWith("\r") ? "\r" : "";
        const line = ending ? rawLine.slice(0, -ending.length) : rawLine;
        const bom = result.length === 0 && line.startsWith("\uFEFF") ? "\uFEFF" : "";
        const content = bom ? line.slice(1) : line;
        const body = content.replace(/^[\t ]+/, "");
        if (!body.trim()) {
            result.push(line + ending);
            continue;
        }
        const code = codeBeforeComment(body);
        const kind = blockKind(code);
        if (kind === "close")
            blockDepth = Math.max(0, blockDepth - 1);
        const depthBeforeLine = Math.max(0, delimiterDepth - (delimiters(code).closes > 0 && /^[\])}]/.test(code.trim()) ? 1 : 0));
        const indentDepth = Math.max(0, blockDepth + depthBeforeLine - (kind === "branch" ? 1 : 0));
        result.push(bom + unit.repeat(indentDepth) + body + ending);
        const counts = delimiters(code);
        delimiterDepth = Math.max(0, delimiterDepth + counts.opens - counts.closes);
        if (kind === "open") {
            if (delimiterDepth > 0)
                pendingOpen = true;
            else
                blockDepth++;
        }
        if (pendingOpen && delimiterDepth === 0) {
            blockDepth++;
            pendingOpen = false;
        }
    }
    return result.join("");
}
//# sourceMappingURL=formatter.js.map