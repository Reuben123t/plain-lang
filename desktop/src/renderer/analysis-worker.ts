import {
  analyzeSource, definitionAt, offsetAt, referencesAt, renameAt, signatureAt, symbolAt,
  type AnalysisDiagnostic, type AnalysisFoldingRange, type AnalysisRange, type AnalysisResult,
  type AnalysisSignature, type AnalysisSymbol, type AnalysisTextEdit, type QueryPosition
} from "../../../src/tooling/analyzer";
import { getBuiltin, getBuiltinNames, getModuleBuiltins } from "../../../src/tooling/catalog";
import { formatSource, type FormatOptions } from "../../../src/tooling/formatter";
import { commentColumn } from "../../../src/tooling/source";

export interface CompletionSuggestion {
  name: string;
  kind: "function" | "variable" | "parameter" | "import";
  detail: string;
  documentation?: string;
}

export interface HoverInfo { range: AnalysisRange; code: string; description?: string }

export interface WorkerResults {
  analyze: { diagnostics: AnalysisDiagnostic[] };
  completion: CompletionSuggestion[];
  hover: HoverInfo | undefined;
  definition: AnalysisRange | undefined;
  references: AnalysisRange[];
  prepareRename: { range: AnalysisRange; text: string } | undefined;
  rename: AnalysisTextEdit[];
  signature: AnalysisSignature | undefined;
  symbols: AnalysisSymbol[];
  folds: AnalysisFoldingRange[];
  format: string;
  close: undefined;
}

export type WorkerOperation = keyof WorkerResults;
export interface AnalysisWorkerRequest {
  id: number;
  operation: WorkerOperation;
  uri: string;
  version: number;
  source: string;
  filename?: string;
  position?: QueryPosition;
  newName?: string;
  includeDeclaration?: boolean;
  formatOptions?: FormatOptions;
}
export interface AnalysisWorkerResponse {
  id: number;
  operation: WorkerOperation;
  uri: string;
  version: number;
  result?: WorkerResults[WorkerOperation];
  error?: string;
}

function visibleSymbols(result: AnalysisResult, offset: number): AnalysisSymbol[] {
  const scopes = result.scopes.filter((scope) => scope.range.start.offset <= offset && offset <= scope.range.end.offset)
    .sort((a, b) => (a.range.end.offset - a.range.start.offset) - (b.range.end.offset - b.range.start.offset));
  const names = new Map<string, AnalysisSymbol>();
  for (const scope of scopes) {
    for (const symbol of result.symbols.filter((entry) => entry.scopeId === scope.id)) {
      const key = symbol.name.toLowerCase();
      if (!names.has(key)) names.set(key, symbol);
    }
  }
  return [...names.values()];
}

function inStringOrComment(result: AnalysisResult, offset: number): boolean {
  if (result.tokens.some((token) => token.type === "String" && token.range.start.offset < offset && offset < token.range.end.offset)) return true;
  const start = result.source.lastIndexOf("\n", offset - 1) + 1;
  const end = result.source.indexOf("\n", start);
  const comment = commentColumn(result.source.slice(start, end < 0 ? undefined : end));
  return comment >= 0 && offset - start >= comment;
}

function completions(result: AnalysisResult, position: QueryPosition): CompletionSuggestion[] {
  const offset = offsetAt(result, position);
  if (inStringOrComment(result, offset)) return [];
  const before = result.source.slice(0, offset);
  const member = /([A-Za-z_][A-Za-z0-9_]*)\s*\.\s*[A-Za-z0-9_]*$/.exec(before);
  const symbols = visibleSymbols(result, offset);
  const suggestions = new Map<string, CompletionSuggestion>();
  const addBuiltin = (name: string, entry: NonNullable<ReturnType<typeof getBuiltin>>) => suggestions.set(name.toLowerCase(), {
    name, kind: "function", detail: `${name}(${entry.parameters.join(", ")})`, documentation: entry.description
  });
  if (member) {
    const receiver = symbols.find((symbol) => symbol.name.toLowerCase() === member[1].toLowerCase());
    if (receiver?.kind === "import" && receiver.module && !receiver.parameters) {
      for (const entry of getModuleBuiltins(receiver.module)) {
        for (const name of [entry.name, ...entry.aliases].filter((name) => !name.includes(" "))) addBuiltin(name, entry);
      }
    }
    return [...suggestions.values()];
  }
  for (const name of getBuiltinNames()) {
    const entry = getBuiltin(name);
    if (entry) addBuiltin(name, entry);
  }
  for (const symbol of symbols) {
    suggestions.set(symbol.name.toLowerCase(), {
      name: symbol.name, kind: symbol.kind,
      detail: symbol.kind === "function" || symbol.parameters ? `${symbol.name}(${(symbol.parameters ?? []).join(", ")})` : symbol.kind
    });
  }
  return [...suggestions.values()];
}

function hover(result: AnalysisResult, position: QueryPosition): HoverInfo | undefined {
  const offset = offsetAt(result, position);
  if (inStringOrComment(result, offset)) return undefined;
  const reference = result.references.find((entry) => entry.range.start.offset <= offset && offset <= entry.range.end.offset);
  const symbol = symbolAt(result, position);
  if (symbol && reference) return {
    range: reference.range,
    code: symbol.kind === "function" || symbol.parameters ? `${symbol.name}(${(symbol.parameters ?? []).join(", ")})` : `${symbol.kind} ${symbol.name}`,
    ...(symbol.module ? { description: `Imported from ${symbol.module}.` } : {})
  };
  if (reference) {
    const builtin = getBuiltin(reference.name);
    if (builtin) return { range: reference.range, code: builtin.signature, description: builtin.description };
  }
  // Member names are deliberately not lexical references; resolve only imported modules.
  const token = result.tokens.find((entry) => entry.range.start.offset <= offset && offset <= entry.range.end.offset && /^[A-Za-z_]\w*$/.test(entry.raw));
  if (!token) return undefined;
  const prefix = result.source.slice(0, token.range.start.offset);
  const receiverMatch = /([A-Za-z_]\w*)\s*\.\s*$/.exec(prefix);
  if (!receiverMatch) return undefined;
  const receiverOffset = prefix.lastIndexOf(receiverMatch[1], receiverMatch.index + receiverMatch[1].length);
  const receiver = symbolAt(result, receiverOffset);
  const builtin = receiver?.kind === "import" && receiver.module && !receiver.parameters ? getBuiltin(`${receiver.module}.${token.raw}`) : undefined;
  return builtin ? { range: token.range, code: `${receiverMatch[1]}.${token.raw}(${builtin.parameters.join(", ")})`, description: builtin.description } : undefined;
}

/** The AnalysisResult and its WeakMap-backed index never leave this worker/cache. */
export class AnalysisWorkerHandler {
  private cache = new Map<string, { version: number; result: AnalysisResult }>();

  handle(request: AnalysisWorkerRequest): AnalysisWorkerResponse {
    const response = { id: request.id, operation: request.operation, uri: request.uri, version: request.version };
    try {
      if (request.operation === "close") {
        this.cache.delete(request.uri);
        return { ...response, result: undefined };
      }
      const cached = this.cache.get(request.uri);
      if (cached && cached.version > request.version) throw new Error("Stale document version.");
      const result = cached && cached.version === request.version && cached.result.source === request.source && cached.result.filename === request.filename
        ? cached.result : analyzeSource(request.source, request.filename);
      this.cache.set(request.uri, { version: request.version, result });
      const position = request.position ?? 0;
      let value: WorkerResults[WorkerOperation];
      switch (request.operation) {
        case "analyze": value = { diagnostics: result.diagnostics }; break;
        case "completion": value = completions(result, position); break;
        case "hover": value = hover(result, position); break;
        case "definition": value = definitionAt(result, position); break;
        case "references": value = referencesAt(result, position, request.includeDeclaration ?? true); break;
        case "prepareRename": {
          const symbol = symbolAt(result, position);
          const offset = offsetAt(result, position);
          const reference = result.references.find((entry) => entry.symbolId === symbol?.id && entry.range.start.offset <= offset && offset <= entry.range.end.offset);
          value = symbol && reference ? { range: reference.range, text: reference.name } : undefined;
          break;
        }
        case "rename": value = renameAt(result, position, request.newName ?? ""); break;
        case "signature": value = signatureAt(result, position); break;
        case "symbols": value = result.symbols; break;
        case "folds": value = result.foldingRanges; break;
        case "format": value = formatSource(request.source, request.formatOptions); break;
      }
      return { ...response, result: value };
    } catch (error) {
      return { ...response, error: error instanceof Error ? error.message : String(error) };
    }
  }
}

// Importing the handler in node tests must not install a global message listener.
const workerScope = globalThis as unknown as {
  document?: unknown;
  postMessage?: (response: AnalysisWorkerResponse) => void;
  addEventListener?: (type: string, listener: (event: MessageEvent<AnalysisWorkerRequest>) => void) => void;
};
if (typeof workerScope.document === "undefined" && typeof workerScope.postMessage === "function" && typeof workerScope.addEventListener === "function") {
  const handler = new AnalysisWorkerHandler();
  workerScope.addEventListener("message", (event) => workerScope.postMessage!(handler.handle(event.data)));
}
