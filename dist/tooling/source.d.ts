import { Token, TokenType } from "../lexer/token";
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
export declare function sourceLines(source: string): SourceLine[];
export declare function getLineStarts(source: string): number[];
export declare function lineEnd(source: string, starts: number[], line: number): number;
export declare function pointAt(source: string, starts: number[], value: number): AnalysisPosition;
export declare function offsetForPosition(source: string, starts: number[], position: number | {
    line: number;
    character: number;
}): number;
export declare function rangeAt(source: string, starts: number[], start: number, end: number): AnalysisRange;
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
export declare function tokenizeForTooling(source: string, filename?: string): {
    tokens: Token[];
    issues: LexicalIssue[];
};
export declare function isOpeningDelimiter(type: TokenType): boolean;
export declare function isClosingDelimiter(type: TokenType): boolean;
export declare function matchingDelimiter(open: TokenType, close: TokenType): boolean;
export declare function isFunctionWord(token: Token | undefined): boolean;
/** Logical statements include multiline delimiters, and split inline end/else. */
export declare function logicalStatements<T extends Token>(tokens: T[]): T[][];
/** Find a real comment marker, ignoring escaped quotes and # inside strings. */
export declare function commentColumn(line: string): number;
//# sourceMappingURL=source.d.ts.map