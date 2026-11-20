import type { Program } from "../ast/types";
import { Token } from "../lexer/token";
import { AnalysisPosition, AnalysisRange } from "./source";
export type { AnalysisPosition, AnalysisRange } from "./source";
export interface AnalysisDiagnostic {
    message: string;
    severity: "error" | "warning" | "information";
    code: string;
    range: AnalysisRange;
    filename?: string;
    suggestion?: string;
}
export interface AnalysisToken extends Token {
    range: AnalysisRange;
}
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
export type QueryPosition = number | {
    line: number;
    character: number;
};
export interface AnalysisTextEdit {
    range: AnalysisRange;
    newText: string;
}
export interface AnalysisSignature {
    name: string;
    parameters: string[];
    signature: string;
    description?: string;
    activeParameter: number;
    range: AnalysisRange;
    symbolId?: string;
}
export declare function positionAt(result: AnalysisResult, offset: number): AnalysisPosition;
export declare function offsetAt(result: AnalysisResult, position: QueryPosition): number;
/** Analyze syntax and same-document bindings without loading or executing imports. */
export declare function analyzeSource(source: string, filename?: string): AnalysisResult;
export declare function symbolAt(result: AnalysisResult, position: QueryPosition): AnalysisSymbol | undefined;
export declare function definitionAt(result: AnalysisResult, position: QueryPosition): AnalysisRange | undefined;
export declare function referencesAt(result: AnalysisResult, position: QueryPosition, includeDeclaration?: boolean): AnalysisRange[];
/** Same-document rename only. Refuse keywords and binding capture rather than guessing. */
export declare function renameAt(result: AnalysisResult, position: QueryPosition, newName: string): AnalysisTextEdit[];
/** Token-based call context remains available for unfinished argument lists. */
export declare function signatureAt(result: AnalysisResult, position: QueryPosition): AnalysisSignature | undefined;
//# sourceMappingURL=analyzer.d.ts.map