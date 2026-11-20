import { Lexer } from "../lexer/lexer";
import { Token, TokenType } from "../lexer/token";
import { PlainError } from "../errors/plain-error";

/** Editor positions and offsets are zero-based UTF-16; range ends are exclusive. */
export interface AnalysisPosition {
  line: number;
  character: number;
  offset: number;
}

export interface AnalysisRange {
  start: AnalysisPosition;
  end: AnalysisPosition;
}

export interface SourceLine {
  text: string;
  newline: string;
  start: number;
}

export function sourceLines(source: string): SourceLine[] {
  const lines: SourceLine[] = [];
  const pattern = /([^\r\n]*)(\r\n|\n|\r|$)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) {
    lines.push({ text: match[1], newline: match[2], start: match.index });
    if (!match[2]) break;
  }
  return lines;
}

export function getLineStarts(source: string): number[] {
  const starts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\r") {
      if (source[i + 1] === "\n") i++;
      starts.push(i + 1);
    } else if (source[i] === "\n") {
      starts.push(i + 1);
    }
  }
  return starts;
}

function finiteInteger(value: number, fallback = 0): number {
  return Number.isFinite(value) ? Math.trunc(value) : fallback;
}

export function lineEnd(source: string, starts: number[], line: number): number {
  let end = starts[line + 1] ?? source.length;
  if (end > starts[line] && source[end - 1] === "\n") end--;
  if (end > starts[line] && source[end - 1] === "\r") end--;
  return end;
}

export function pointAt(source: string, starts: number[], value: number): AnalysisPosition {
  const offset = Math.max(0, Math.min(source.length, finiteInteger(value, source.length)));
  let low = 0;
  let high = starts.length - 1;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (starts[middle] <= offset) low = middle;
    else high = middle - 1;
  }
  return { line: low, character: Math.min(offset, lineEnd(source, starts, low)) - starts[low], offset };
}

export function offsetForPosition(
  source: string,
  starts: number[],
  position: number | { line: number; character: number }
): number {
  if (typeof position === "number") return pointAt(source, starts, position).offset;
  const line = Math.max(0, finiteInteger(position.line));
  if (line >= starts.length) return source.length;
  return Math.min(lineEnd(source, starts, line), starts[line] + Math.max(0, finiteInteger(position.character)));
}

export function rangeAt(source: string, starts: number[], start: number, end: number): AnalysisRange {
  return { start: pointAt(source, starts, start), end: pointAt(source, starts, Math.max(start, end)) };
}

export interface LexicalIssue {
  error: unknown;
  start: number;
  end: number;
}

/**
 * Use the language lexer, not an approximate second lexer. On an unfinished or
 * invalid token, mask only that token/line and retry so later declarations remain
 * useful in an editor. Masking never changes offsets and never runs user code.
 */
export function tokenizeForTooling(source: string, filename?: string): { tokens: Token[]; issues: LexicalIssue[] } {
  let masked = source.startsWith("\uFEFF") ? " " + source.slice(1) : source;
  const issues: LexicalIssue[] = [];
  const starts = getLineStarts(source);
  for (let attempt = 0; attempt < 32; attempt++) {
    try {
      return { tokens: new Lexer(masked, filename).tokenize(), issues };
    } catch (error) {
      const location = error instanceof PlainError ? error.location : undefined;
      const start = Math.max(0, Math.min(source.length, location?.start ?? offsetForPosition(source, starts, {
        line: (location?.line ?? 1) - 1,
        character: (location?.column ?? 1) - 1
      })));
      let end = Math.min(source.length, start + (source.codePointAt(start)! > 0xffff ? 2 : 1));
      if (masked[start] === '"' || masked[start] === "'") {
        const newline = masked.indexOf("\n", start);
        end = newline < 0 ? source.length : newline;
        if (end > start && source[end - 1] === "\r") end--;
      }
      issues.push({ error, start, end });
      if (end <= start) break;
      masked = masked.slice(0, start) + masked.slice(start, end).replace(/[^\r\n]/g, " ") + masked.slice(end);
    }
  }
  // Bound recovery work for heavily corrupted buffers. Keep the successfully
  // lexable prefix instead of repeatedly scanning the rest of a large document.
  const last = issues[issues.length - 1];
  const prefix = last ? masked.slice(0, last.start) : "";
  try {
    const tokens = new Lexer(prefix, filename).tokenize();
    const eof = pointAt(source, starts, source.length);
    tokens[tokens.length - 1] = {
      type: TokenType.EOF, value: "", raw: "",
      location: { line: eof.line + 1, column: eof.character + 1, start: eof.offset, sourceFile: filename }
    };
    return { tokens, issues };
  } catch {
    return { tokens: [{ type: TokenType.EOF, value: "", raw: "", location: { line: 1, column: 1, start: 0, sourceFile: filename } }], issues };
  }
}

export function isOpeningDelimiter(type: TokenType): boolean {
  return type === TokenType.LeftParen || type === TokenType.LeftBracket || type === TokenType.LeftBrace;
}

export function isClosingDelimiter(type: TokenType): boolean {
  return type === TokenType.RightParen || type === TokenType.RightBracket || type === TokenType.RightBrace;
}

export function matchingDelimiter(open: TokenType, close: TokenType): boolean {
  return (open === TokenType.LeftParen && close === TokenType.RightParen) ||
    (open === TokenType.LeftBracket && close === TokenType.RightBracket) ||
    (open === TokenType.LeftBrace && close === TokenType.RightBrace);
}

export function isFunctionWord(token: Token | undefined): boolean {
  return !!token && [TokenType.Identifier, TokenType.Add, TokenType.Remove, TokenType.Item,
    TokenType.Ask, TokenType.Show, TokenType.Wait, TokenType.Clear].includes(token.type);
}

/** Logical statements include multiline delimiters, and split inline end/else. */
export function logicalStatements<T extends Token>(tokens: T[]): T[][] {
  const statements: T[][] = [];
  let current: T[] = [];
  const delimiters: TokenType[] = [];
  const flush = () => {
    if (current.length) statements.push(current);
    current = [];
  };
  for (const token of tokens) {
    if (token.type === TokenType.EOF) { flush(); break; }
    if (token.type === TokenType.Newline) {
      if (!delimiters.length) flush();
      continue;
    }
    if (!delimiters.length && (token.type === TokenType.End || token.type === TokenType.Otherwise || token.raw.toLowerCase() === "elif")) {
      flush();
    }
    current.push(token);
    if (isOpeningDelimiter(token.type)) delimiters.push(token.type);
    else if (isClosingDelimiter(token.type) && matchingDelimiter(delimiters[delimiters.length - 1], token.type)) delimiters.pop();
    if (!delimiters.length && token.type === TokenType.End) flush();
  }
  flush();
  return statements;
}

/** Find a real comment marker, ignoring escaped quotes and # inside strings. */
export function commentColumn(line: string): number {
  let quote = "";
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quote) {
      if (char === "\\") i++;
      else if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "#") return i;
  }
  return -1;
}
