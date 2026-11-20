import type { Program } from "../ast/types";
import { PlainError } from "../errors/plain-error";
import { Lexer } from "../lexer/lexer";
import { Token, TokenType } from "../lexer/token";
import { Parser } from "../parser/parser";
import { getBuiltin } from "./catalog";
import {
  AnalysisPosition, AnalysisRange, commentColumn, getLineStarts, isClosingDelimiter,
  isFunctionWord, isOpeningDelimiter, logicalStatements, matchingDelimiter,
  offsetForPosition, pointAt, rangeAt, sourceLines, tokenizeForTooling
} from "./source";

export type { AnalysisPosition, AnalysisRange } from "./source";

export interface AnalysisDiagnostic {
  message: string;
  severity: "error" | "warning" | "information";
  code: string;
  range: AnalysisRange;
  filename?: string;
  suggestion?: string;
}

export interface AnalysisToken extends Token { range: AnalysisRange }

export interface AnalysisSymbol {
  id: string;
  name: string;
  kind: "function" | "parameter" | "variable" | "import";
  range: AnalysisRange;
  selectionRange: AnalysisRange;
  scopeId: string;
  parameters?: string[];
  module?: string;
}

export interface AnalysisReference {
  name: string;
  range: AnalysisRange;
  scopeId: string;
  symbolId?: string;
  isDeclaration: boolean;
  isWrite: boolean;
}

export interface AnalysisScope {
  id: string;
  parentId?: string;
  kind: "document" | "function" | "block";
  range: AnalysisRange;
  symbolIds: string[];
}

export interface AnalysisFoldingRange {
  startLine: number;
  endLine: number;
  kind: "region" | "comment";
}

export interface AnalysisResult {
  source: string;
  filename?: string;
  diagnostics: AnalysisDiagnostic[];
  tokens: AnalysisToken[];
  symbols: AnalysisSymbol[];
  references: AnalysisReference[];
  scopes: AnalysisScope[];
  foldingRanges: AnalysisFoldingRange[];
  lineStarts: number[];
  ast?: Program;
}

export type QueryPosition = number | { line: number; character: number };
export interface AnalysisTextEdit { range: AnalysisRange; newText: string }
export interface AnalysisSignature {
  name: string;
  parameters: string[];
  signature: string;
  description?: string;
  activeParameter: number;
  range: AnalysisRange;
  symbolId?: string;
}

interface IndexData {
  bindings: Map<string, Map<string, AnalysisSymbol>>;
  scopes: Map<string, AnalysisScope>;
  symbols: Map<string, AnalysisSymbol>;
  visibleFrom: Map<string, number>;
  fallbackReferences: Set<number>;
  importedNames: Map<string, string>;
}

const indexes = new WeakMap<AnalysisResult, IndexData>();
const assignmentTypes = new Set([TokenType.Equal, TokenType.PlusEqual, TokenType.MinusEqual, TokenType.StarEqual, TokenType.SlashEqual]);
const naturalCalls = new Set(["to number", "to text", "starts with", "ends with", "random between", "days between", "current time", "read file", "write file", "file exists"]);

export function positionAt(result: AnalysisResult, offset: number): AnalysisPosition {
  return pointAt(result.source, result.lineStarts, offset);
}

export function offsetAt(result: AnalysisResult, position: QueryPosition): number {
  return offsetForPosition(result.source, result.lineStarts, position);
}

function span(result: AnalysisResult, start: number, end: number): AnalysisRange {
  return rangeAt(result.source, result.lineStarts, start, end);
}

function diagnosticFor(result: AnalysisResult, error: unknown, start?: number, end?: number): AnalysisDiagnostic {
  const plain = error instanceof PlainError ? error : undefined;
  const location = plain?.location;
  start ??= location?.start ?? offsetAt(result, { line: (location?.line ?? 1) - 1, character: (location?.column ?? 1) - 1 });
  const token = result.tokens.find((candidate) => candidate.range.start.offset === start);
  end ??= location?.end ?? token?.range.end.offset ?? Math.min(result.source.length, start + 1);
  return {
    message: error instanceof Error ? error.message : String(error),
    severity: "error",
    code: plain?.kind ?? "AnalysisError",
    range: span(result, start, end),
    filename: result.filename,
    ...(plain?.suggestion ? { suggestion: plain.suggestion } : {})
  };
}

/** Analyze syntax and same-document bindings without loading or executing imports. */
export function analyzeSource(source: string, filename?: string): AnalysisResult {
  const result: AnalysisResult = {
    source, filename, diagnostics: [], tokens: [], symbols: [], references: [],
    scopes: [], foldingRanges: [], lineStarts: getLineStarts(source)
  };
  const lexical = tokenizeForTooling(source, filename);
  result.tokens = lexical.tokens.map((token) => {
    const start = token.location.start ?? offsetAt(result, { line: token.location.line - 1, character: token.location.column - 1 });
    const end = token.type === TokenType.EOF ? start : Math.min(source.length, start + token.raw.length);
    return { ...token, range: span(result, start, end) };
  });
  for (const issue of lexical.issues) result.diagnostics.push(diagnosticFor(result, issue.error, issue.start, issue.end));
  // After a lexical error, parsing masked source would invent cascading syntax
  // errors. The recovered tokens are still sufficient for editor navigation.
  if (!lexical.issues.length) {
    try {
      result.ast = new Parser(lexical.tokens, source, filename).parse();
    } catch (error) {
      result.diagnostics.push(diagnosticFor(result, error));
    }
  }
  indexDocument(result);
  return result;
}

function lookup(
  data: IndexData,
  name: string,
  scopeId: string,
  before?: number,
  renamed?: { id: string; name: string }
): AnalysisSymbol | undefined {
  const key = name.toLowerCase();
  let scope: AnalysisScope | undefined = data.scopes.get(scopeId);
  while (scope) {
    const bindings = data.bindings.get(scope.id)!;
    let symbol: AnalysisSymbol | undefined;
    if (renamed) {
      symbol = [...bindings.values()].find((entry) => (entry.id === renamed.id ? renamed.name : entry.name).toLowerCase() === key);
    } else symbol = bindings.get(key);
    if (symbol && (before === undefined || (data.visibleFrom.get(symbol.id) ?? 0) <= before)) return symbol;
    scope = scope.parentId ? data.scopes.get(scope.parentId) : undefined;
  }
  return undefined;
}

function indexDocument(result: AnalysisResult): void {
  const data: IndexData = {
    bindings: new Map(), scopes: new Map(), symbols: new Map(), visibleFrom: new Map(),
    fallbackReferences: new Set(), importedNames: new Map()
  };
  indexes.set(result, data);
  const documentScope: AnalysisScope = { id: "document", kind: "document", range: span(result, 0, result.source.length), symbolIds: [] };
  const addScope = (scope: AnalysisScope) => {
    data.scopes.set(scope.id, scope);
    data.bindings.set(scope.id, new Map());
    result.scopes.push(scope);
  };
  addScope(documentScope);
  let scope = documentScope;
  interface Block {
    token: AnalysisToken;
    kind: "function" | "if" | "loop";
    scope?: AnalysisScope;
    symbol?: AnalysisSymbol;
    branchLine?: number;
  }
  const blocks: Block[] = [];
  const fold = (startLine: number, endLine: number, kind: "region" | "comment" = "region") => {
    if (endLine > startLine) result.foldingRanges.push({ startLine, endLine, kind });
  };
  const finishBlock = (block: Block, end: number) => {
    const endPosition = positionAt(result, end);
    fold(block.token.range.start.line, endPosition.line);
    if (block.branchLine !== undefined) fold(block.branchLine, Math.max(block.branchLine, endPosition.line - 1));
    if (block.scope) {
      block.scope.range = span(result, block.token.range.start.offset, end);
      if (block.symbol) block.symbol.range = block.scope.range;
      scope = data.scopes.get(block.scope.parentId!)!;
    }
  };

  function bind(
    token: AnalysisToken,
    kind: AnalysisSymbol["kind"],
    declarationRange: AnalysisRange,
    forceLocal = false,
    visibleFrom = declarationRange.end.offset
  ): AnalysisSymbol {
    const key = token.raw.toLowerCase();
    let symbol = forceLocal ? data.bindings.get(scope.id)!.get(key) : lookup(data, token.raw, scope.id);
    const isDeclaration = !symbol;
    if (!symbol) {
      symbol = {
        id: `${scope.id}:${token.range.start.offset}:${key}`,
        name: token.raw, kind, range: declarationRange, selectionRange: token.range, scopeId: scope.id
      };
      data.bindings.get(scope.id)!.set(key, symbol);
      data.symbols.set(symbol.id, symbol);
      data.visibleFrom.set(symbol.id, visibleFrom);
      scope.symbolIds.push(symbol.id);
      result.symbols.push(symbol);
    }
    result.references.push({
      name: token.raw, range: token.range, scopeId: scope.id, symbolId: symbol.id,
      isDeclaration, isWrite: true
    });
    return symbol;
  }

  for (const statement of logicalStatements(result.tokens)) {
    const first = statement[0];
    const last = statement[statement.length - 1];
    const statementRange = span(result, first.range.start.offset, last.range.end.offset);
    const consumed = new Set<AnalysisToken>();
    const writes = new Set<AnalysisToken>();
    const lower = first.raw.toLowerCase();
    if (first.type === TokenType.End) {
      const block = blocks.pop();
      if (block) finishBlock(block, first.range.end.offset);
      continue;
    }
    const isBranch = first.type === TokenType.Otherwise || lower === "elif";
    if (isBranch) {
      const block = blocks[blocks.length - 1];
      if (block?.kind === "if") {
        fold(block.branchLine ?? block.token.range.start.line, first.range.start.line - 1);
        block.branchLine = first.range.start.line;
      }
      consumed.add(first);
    }
    if (first.type === TokenType.Def || first.type === TokenType.To) {
      const name = statement[1];
      if (isFunctionWord(name)) {
        const symbol = bind(name, "function", statementRange, true, first.range.start.offset);
        const child: AnalysisScope = {
          id: `function:${first.range.start.offset}`, parentId: scope.id, kind: "function",
          range: span(result, first.range.start.offset, result.source.length), symbolIds: []
        };
        addScope(child);
        scope = child;
        blocks.push({ token: first, kind: "function", scope: child, symbol });
        const parameters: string[] = [];
        let index = statement[2]?.type === TokenType.LeftParen ? 3 : 2;
        let expectName = true;
        for (; index < statement.length; index++) {
          const token = statement[index];
          if (token.type === TokenType.RightParen || token.type === TokenType.Colon) break;
          if (expectName && isFunctionWord(token)) {
            parameters.push(token.raw);
            bind(token, "parameter", token.range, true, first.range.start.offset);
            expectName = false;
          } else if (!expectName && (token.type === TokenType.Comma || token.type === TokenType.And)) expectName = true;
          else break;
        }
        symbol.parameters = parameters;
      }
      // Declaration names and parameters are not expression references, even if
      // the header is incomplete. Never guess parameter names from body lines.
      continue;
    }

    if (first.type === TokenType.Import || first.type === TokenType.From) {
      const sourceToken = statement[1];
      const module = sourceToken?.type === TokenType.String ? String(sourceToken.value) : sourceToken?.raw;
      if (module) {
        if (first.type === TokenType.Import) {
          const asIndex = statement.findIndex((token) => token.type === TokenType.As);
          const name = asIndex >= 0 ? statement[asIndex + 1] : (isFunctionWord(sourceToken) ? sourceToken : undefined);
          if (name && isFunctionWord(name)) {
            const symbol = bind(name, "import", statementRange);
            symbol.module = module;
          }
        } else {
          const importIndex = statement.findIndex((token) => token.type === TokenType.Import);
          for (let i = importIndex + 1; importIndex >= 0 && i < statement.length; i++) {
            const original = statement[i];
            if (!original || !isFunctionWord(original)) continue;
            let name = original;
            if (statement[i + 1]?.type === TokenType.As && isFunctionWord(statement[i + 2])) {
              name = statement[i + 2];
              i += 2;
            }
            const symbol = bind(name, "import", statementRange);
            symbol.module = module;
            const qualifiedName = `${module}.${original.raw}`;
            data.importedNames.set(symbol.id, qualifiedName);
            const builtin = getBuiltin(qualifiedName);
            if (builtin) symbol.parameters = [...builtin.parameters];
          }
        }
      }
      continue;
    }

    let assignmentName: AnalysisToken | undefined;
    let rhsIndex = -1;
    let fallbackAllowed = false;
    if (first.type === TokenType.Set && statement[1]?.type === TokenType.Identifier) {
      assignmentName = statement[1];
      rhsIndex = 3;
      fallbackAllowed = [TokenType.Equal, TokenType.EqualEqual, TokenType.To].includes(statement[2]?.type);
    } else if (first.type === TokenType.Identifier && assignmentTypes.has(statement[1]?.type)) {
      assignmentName = first;
      rhsIndex = 2;
      fallbackAllowed = statement[1].type === TokenType.Equal;
    }
    if (assignmentName) {
      bind(assignmentName, "variable", statementRange);
      consumed.add(assignmentName);
      if (fallbackAllowed && statement.length === rhsIndex + 1 && statement[rhsIndex]?.type === TokenType.Identifier) {
        data.fallbackReferences.add(statement[rhsIndex].range.start.offset);
      }
    } else if (first.type === TokenType.Identifier && statement[1]?.type === TokenType.LeftBracket) {
      // Index writes mutate an existing binding; they must not declare a new one.
      if (statement.some((token) => assignmentTypes.has(token.type))) writes.add(first);
    }
    if (first.type === TokenType.For) {
      const name = statement[first.type === TokenType.For && statement[1]?.type === TokenType.Each ? 2 : 1];
      if (name?.type === TokenType.Identifier) {
        bind(name, "variable", statementRange);
        consumed.add(name);
      }
    }
    if (first.type === TokenType.Ask) {
      const asIndex = statement.findIndex((token, i) => token.type === TokenType.As && statement[i - 1]?.type === TokenType.Save);
      const name = statement[asIndex + 1];
      if (asIndex >= 0 && name?.type === TokenType.Identifier) {
        bind(name, "variable", statementRange);
        consumed.add(name);
      }
    }
    if (first.type === TokenType.Add || first.type === TokenType.Remove) {
      const separator = first.type === TokenType.Add ? TokenType.To : TokenType.From;
      const index = statement.findIndex((token) => token.type === separator);
      if (index >= 0 && statement[index + 1]) writes.add(statement[index + 1]);
    }

    const delimiters: TokenType[] = [];
    for (let i = 0; i < statement.length; i++) {
      const token = statement[i];
      if (isOpeningDelimiter(token.type)) { delimiters.push(token.type); continue; }
      if (isClosingDelimiter(token.type)) {
        if (matchingDelimiter(delimiters[delimiters.length - 1], token.type)) delimiters.pop();
        continue;
      }
      if (consumed.has(token)) continue;
      if (token.type !== TokenType.Identifier && !isFunctionWord(token)) continue;
      // Statement keywords, property names and dictionary keys are not bindings.
      if (i === 0 && token.type !== TokenType.Identifier) continue;
      if (statement[i - 1]?.type === TokenType.Dot) continue;
      if (delimiters[delimiters.length - 1] === TokenType.LeftBrace && statement[i + 1]?.type === TokenType.Colon) continue;
      const pair = `${token.raw.toLowerCase()} ${statement[i + 1]?.raw.toLowerCase()}`;
      if (naturalCalls.has(pair) && !consumed.has(statement[i + 1])) {
        result.references.push({
          name: pair, range: span(result, token.range.start.offset, statement[i + 1].range.end.offset),
          scopeId: scope.id, isDeclaration: false, isWrite: false
        });
        i++;
        continue;
      }
      // 'item N of ...' is an operator, not a reference to a variable named item.
      if (token.type === TokenType.Item && statement[i + 1]?.type !== TokenType.LeftParen) continue;
      result.references.push({ name: token.raw, range: token.range, scopeId: scope.id, isDeclaration: false, isWrite: writes.has(token) });
    }
    if (!isBranch) {
      if (first.type === TokenType.If) blocks.push({ token: first, kind: "if" });
      else if ([TokenType.Repeat, TokenType.For, TokenType.While].includes(first.type)) blocks.push({ token: first, kind: "loop" });
    }
  }
  while (blocks.length) finishBlock(blocks.pop()!, result.source.length);
  for (const reference of result.references) {
    if (reference.symbolId) continue;
    const before = data.fallbackReferences.has(reference.range.start.offset) ? reference.range.start.offset : undefined;
    reference.symbolId = lookup(data, reference.name, reference.scopeId, before)?.id;
  }
  result.references.sort((a, b) => a.range.start.offset - b.range.start.offset);

  const delimiterStack: AnalysisToken[] = [];
  for (const token of result.tokens) {
    if (isOpeningDelimiter(token.type)) delimiterStack.push(token);
    else if (isClosingDelimiter(token.type) && matchingDelimiter(delimiterStack[delimiterStack.length - 1]?.type, token.type)) {
      fold(delimiterStack.pop()!.range.start.line, token.range.end.line);
    }
  }
  let commentStart = -1;
  const lines = sourceLines(result.source);
  for (let i = 0; i <= lines.length; i++) {
    const comment = i < lines.length && /^\s*#/.test(lines[i].text);
    if (comment && commentStart < 0) commentStart = i;
    if (!comment && commentStart >= 0) {
      fold(commentStart, i - 1, "comment");
      commentStart = -1;
    }
  }
  result.foldingRanges = result.foldingRanges.filter((range, index, all) =>
    all.findIndex((other) => other.startLine === range.startLine && other.endLine === range.endLine && other.kind === range.kind) === index
  ).sort((a, b) => a.startLine - b.startLine || b.endLine - a.endLine);
}

function referenceAt(result: AnalysisResult, position: QueryPosition): AnalysisReference | undefined {
  const offset = offsetAt(result, position);
  return result.references.find((reference) => reference.range.start.offset <= offset && offset < reference.range.end.offset) ??
    result.references.find((reference) => reference.range.end.offset === offset && reference.range.end.offset > reference.range.start.offset);
}

export function symbolAt(result: AnalysisResult, position: QueryPosition): AnalysisSymbol | undefined {
  const id = referenceAt(result, position)?.symbolId;
  return id ? indexes.get(result)?.symbols.get(id) ?? result.symbols.find((symbol) => symbol.id === id) : undefined;
}

export function definitionAt(result: AnalysisResult, position: QueryPosition): AnalysisRange | undefined {
  return symbolAt(result, position)?.selectionRange;
}

export function referencesAt(result: AnalysisResult, position: QueryPosition, includeDeclaration = true): AnalysisRange[] {
  const symbol = symbolAt(result, position);
  if (!symbol) return [];
  return result.references.filter((reference) => reference.symbolId === symbol.id && (includeDeclaration || !reference.isDeclaration)).map((reference) => reference.range);
}

/** Same-document rename only. Refuse keywords and binding capture rather than guessing. */
export function renameAt(result: AnalysisResult, position: QueryPosition, newName: string): AnalysisTextEdit[] {
  const symbol = symbolAt(result, position);
  if (!symbol) return [];
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(newName) || new Lexer(newName).tokenize()[0].type !== TokenType.Identifier) {
    throw new Error("The new name must be an identifier, not a keyword.");
  }
  const data = indexes.get(result)!;
  const renamed = { id: symbol.id, name: newName };
  const sibling = data.bindings.get(symbol.scopeId)!.get(newName.toLowerCase());
  if (sibling && sibling.id !== symbol.id) throw new Error(`The name '${newName}' conflicts with a declaration in this scope.`);
  for (const reference of result.references) {
    const before = data.fallbackReferences.has(reference.range.start.offset) ? reference.range.start.offset : undefined;
    if (reference.symbolId === symbol.id) {
      if (lookup(data, newName, reference.scopeId, before, renamed)?.id !== symbol.id) {
        throw new Error(`Renaming to '${newName}' would capture a reference in a nested scope.`);
      }
    } else if (reference.name.toLowerCase() === newName.toLowerCase()) {
      const after = lookup(data, newName, reference.scopeId, before, renamed)?.id;
      if (after !== reference.symbolId) throw new Error(`Renaming to '${newName}' would capture another reference.`);
    }
  }
  return referencesAt(result, position).map((range) => ({ range, newText: newName }));
}

/** Token-based call context remains available for unfinished argument lists. */
export function signatureAt(result: AnalysisResult, position: QueryPosition): AnalysisSignature | undefined {
  const offset = offsetAt(result, position);
  if (result.tokens.some((token) => token.type === TokenType.String && token.range.start.offset < offset && offset < token.range.end.offset)) return undefined;
  const point = positionAt(result, offset);
  const line = result.source.slice(result.lineStarts[point.line], result.lineStarts[point.line + 1] ?? result.source.length);
  const comment = commentColumn(line);
  if (comment >= 0 && point.character >= comment) return undefined;
  const tokens = result.tokens.filter((token) => token.type !== TokenType.Newline && token.type !== TokenType.EOF);
  interface CallFrame { token: AnalysisToken; index: number; name?: string; nameToken?: AnalysisToken; receiver?: AnalysisToken; active: number }
  const stack: CallFrame[] = [];
  for (let i = 0; i < tokens.length && tokens[i].range.start.offset < offset; i++) {
    const token = tokens[i];
    if (isOpeningDelimiter(token.type)) {
      const frame: CallFrame = { token, index: i, active: 0 };
      const previous = tokens[i - 1];
      if (token.type === TokenType.LeftParen && isFunctionWord(previous)) {
        const declaration = result.references.find((reference) => reference.range.start.offset === previous.range.start.offset && reference.isDeclaration);
        if (!declaration || result.symbols.find((symbol) => symbol.id === declaration.symbolId)?.kind !== "function") {
          frame.name = previous.raw;
          frame.nameToken = previous;
          if (tokens[i - 2]?.type === TokenType.Dot) frame.receiver = tokens[i - 3];
          else if (tokens[i - 2] && naturalCalls.has(`${tokens[i - 2].raw.toLowerCase()} ${previous.raw.toLowerCase()}`)) {
            frame.name = `${tokens[i - 2].raw} ${previous.raw}`;
            frame.nameToken = tokens[i - 2];
          }
        }
      }
      stack.push(frame);
    } else if (isClosingDelimiter(token.type)) {
      if (matchingDelimiter(stack[stack.length - 1]?.token.type, token.type)) stack.pop();
    } else if (token.type === TokenType.Comma && stack.length) stack[stack.length - 1].active++;
  }
  const call = [...stack].reverse().find((frame) => frame.name && frame.nameToken);
  if (!call?.name || !call.nameToken) return undefined;
  let end = result.source.length;
  let depth = 0;
  for (let i = call.index; i < tokens.length; i++) {
    if (isOpeningDelimiter(tokens[i].type)) depth++;
    else if (isClosingDelimiter(tokens[i].type) && --depth === 0) { end = tokens[i].range.end.offset; break; }
  }
  const range = span(result, (call.receiver ?? call.nameToken).range.start.offset, end);
  let symbol: AnalysisSymbol | undefined;
  let builtin;
  if (call.receiver) {
    const receiver = symbolAt(result, call.receiver.range.start.offset);
    if (receiver?.kind === "import" && receiver.module) builtin = getBuiltin(`${receiver.module}.${call.name}`);
  } else {
    symbol = symbolAt(result, call.nameToken.range.start.offset);
    if (symbol?.kind === "function") return {
      name: symbol.name, parameters: [...(symbol.parameters ?? [])],
      signature: `${symbol.name}(${(symbol.parameters ?? []).join(", ")})`,
      activeParameter: call.active, range, symbolId: symbol.id
    };
    if (symbol?.kind === "import") {
      const importedName = indexes.get(result)?.importedNames.get(symbol.id);
      if (importedName) builtin = getBuiltin(importedName);
    } else if (!symbol) builtin = getBuiltin(call.name);
  }
  if (!builtin) return undefined;
  return {
    name: call.receiver ? `${call.receiver.raw}.${call.name}` : call.name,
    parameters: [...builtin.parameters], signature: `${call.name}(${builtin.parameters.join(", ")})`,
    description: builtin.description, activeParameter: call.active, range,
    ...(symbol ? { symbolId: symbol.id } : {})
  };
}
