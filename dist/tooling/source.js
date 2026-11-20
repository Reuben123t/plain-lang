"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sourceLines = sourceLines;
exports.getLineStarts = getLineStarts;
exports.lineEnd = lineEnd;
exports.pointAt = pointAt;
exports.offsetForPosition = offsetForPosition;
exports.rangeAt = rangeAt;
exports.tokenizeForTooling = tokenizeForTooling;
exports.isOpeningDelimiter = isOpeningDelimiter;
exports.isClosingDelimiter = isClosingDelimiter;
exports.matchingDelimiter = matchingDelimiter;
exports.isFunctionWord = isFunctionWord;
exports.logicalStatements = logicalStatements;
exports.commentColumn = commentColumn;
const lexer_1 = require("../lexer/lexer");
const token_1 = require("../lexer/token");
const plain_error_1 = require("../errors/plain-error");
function sourceLines(source) {
    const lines = [];
    const pattern = /([^\r\n]*)(\r\n|\n|\r|$)/g;
    let match;
    while ((match = pattern.exec(source))) {
        lines.push({ text: match[1], newline: match[2], start: match.index });
        if (!match[2])
            break;
    }
    return lines;
}
function getLineStarts(source) {
    const starts = [0];
    for (let i = 0; i < source.length; i++) {
        if (source[i] === "\r") {
            if (source[i + 1] === "\n")
                i++;
            starts.push(i + 1);
        }
        else if (source[i] === "\n") {
            starts.push(i + 1);
        }
    }
    return starts;
}
function finiteInteger(value, fallback = 0) {
    return Number.isFinite(value) ? Math.trunc(value) : fallback;
}
function lineEnd(source, starts, line) {
    let end = starts[line + 1] ?? source.length;
    if (end > starts[line] && source[end - 1] === "\n")
        end--;
    if (end > starts[line] && source[end - 1] === "\r")
        end--;
    return end;
}
function pointAt(source, starts, value) {
    const offset = Math.max(0, Math.min(source.length, finiteInteger(value, source.length)));
    let low = 0;
    let high = starts.length - 1;
    while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        if (starts[middle] <= offset)
            low = middle;
        else
            high = middle - 1;
    }
    return { line: low, character: Math.min(offset, lineEnd(source, starts, low)) - starts[low], offset };
}
function offsetForPosition(source, starts, position) {
    if (typeof position === "number")
        return pointAt(source, starts, position).offset;
    const line = Math.max(0, finiteInteger(position.line));
    if (line >= starts.length)
        return source.length;
    return Math.min(lineEnd(source, starts, line), starts[line] + Math.max(0, finiteInteger(position.character)));
}
function rangeAt(source, starts, start, end) {
    return { start: pointAt(source, starts, start), end: pointAt(source, starts, Math.max(start, end)) };
}
/**
 * Use the language lexer, not an approximate second lexer. On an unfinished or
 * invalid token, mask only that token/line and retry so later declarations remain
 * useful in an editor. Masking never changes offsets and never runs user code.
 */
function tokenizeForTooling(source, filename) {
    let masked = source.startsWith("\uFEFF") ? " " + source.slice(1) : source;
    const issues = [];
    const starts = getLineStarts(source);
    for (let attempt = 0; attempt < 32; attempt++) {
        try {
            return { tokens: new lexer_1.Lexer(masked, filename).tokenize(), issues };
        }
        catch (error) {
            const location = error instanceof plain_error_1.PlainError ? error.location : undefined;
            const start = Math.max(0, Math.min(source.length, location?.start ?? offsetForPosition(source, starts, {
                line: (location?.line ?? 1) - 1,
                character: (location?.column ?? 1) - 1
            })));
            let end = Math.min(source.length, start + (source.codePointAt(start) > 0xffff ? 2 : 1));
            if (masked[start] === '"' || masked[start] === "'") {
                const newline = masked.indexOf("\n", start);
                end = newline < 0 ? source.length : newline;
                if (end > start && source[end - 1] === "\r")
                    end--;
            }
            issues.push({ error, start, end });
            if (end <= start)
                break;
            masked = masked.slice(0, start) + masked.slice(start, end).replace(/[^\r\n]/g, " ") + masked.slice(end);
        }
    }
    // Bound recovery work for heavily corrupted buffers. Keep the successfully
    // lexable prefix instead of repeatedly scanning the rest of a large document.
    const last = issues[issues.length - 1];
    const prefix = last ? masked.slice(0, last.start) : "";
    try {
        const tokens = new lexer_1.Lexer(prefix, filename).tokenize();
        const eof = pointAt(source, starts, source.length);
        tokens[tokens.length - 1] = {
            type: token_1.TokenType.EOF, value: "", raw: "",
            location: { line: eof.line + 1, column: eof.character + 1, start: eof.offset, sourceFile: filename }
        };
        return { tokens, issues };
    }
    catch {
        return { tokens: [{ type: token_1.TokenType.EOF, value: "", raw: "", location: { line: 1, column: 1, start: 0, sourceFile: filename } }], issues };
    }
}
function isOpeningDelimiter(type) {
    return type === token_1.TokenType.LeftParen || type === token_1.TokenType.LeftBracket || type === token_1.TokenType.LeftBrace;
}
function isClosingDelimiter(type) {
    return type === token_1.TokenType.RightParen || type === token_1.TokenType.RightBracket || type === token_1.TokenType.RightBrace;
}
function matchingDelimiter(open, close) {
    return (open === token_1.TokenType.LeftParen && close === token_1.TokenType.RightParen) ||
        (open === token_1.TokenType.LeftBracket && close === token_1.TokenType.RightBracket) ||
        (open === token_1.TokenType.LeftBrace && close === token_1.TokenType.RightBrace);
}
function isFunctionWord(token) {
    return !!token && [token_1.TokenType.Identifier, token_1.TokenType.Add, token_1.TokenType.Remove, token_1.TokenType.Item,
        token_1.TokenType.Ask, token_1.TokenType.Show, token_1.TokenType.Wait, token_1.TokenType.Clear].includes(token.type);
}
/** Logical statements include multiline delimiters, and split inline end/else. */
function logicalStatements(tokens) {
    const statements = [];
    let current = [];
    const delimiters = [];
    const flush = () => {
        if (current.length)
            statements.push(current);
        current = [];
    };
    for (const token of tokens) {
        if (token.type === token_1.TokenType.EOF) {
            flush();
            break;
        }
        if (token.type === token_1.TokenType.Newline) {
            if (!delimiters.length)
                flush();
            continue;
        }
        if (!delimiters.length && (token.type === token_1.TokenType.End || token.type === token_1.TokenType.Otherwise || token.raw.toLowerCase() === "elif")) {
            flush();
        }
        current.push(token);
        if (isOpeningDelimiter(token.type))
            delimiters.push(token.type);
        else if (isClosingDelimiter(token.type) && matchingDelimiter(delimiters[delimiters.length - 1], token.type))
            delimiters.pop();
        if (!delimiters.length && token.type === token_1.TokenType.End)
            flush();
    }
    flush();
    return statements;
}
/** Find a real comment marker, ignoring escaped quotes and # inside strings. */
function commentColumn(line) {
    let quote = "";
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (quote) {
            if (char === "\\")
                i++;
            else if (char === quote)
                quote = "";
        }
        else if (char === '"' || char === "'")
            quote = char;
        else if (char === "#")
            return i;
    }
    return -1;
}
//# sourceMappingURL=source.js.map