export interface SourceLocation {
    line: number;
    column: number;
    start?: number;
    end?: number;
    sourceFile?: string;
}
export type PlainErrorKind = "LexerError" | "ParserError" | "RuntimeError" | "TypeError" | "NameError";
export declare class PlainError extends Error {
    readonly kind: PlainErrorKind;
    readonly location: SourceLocation;
    readonly sourceCode?: string;
    readonly suggestion?: string;
    constructor(message: string, location: SourceLocation, options?: {
        kind?: PlainErrorKind;
        sourceCode?: string;
        suggestion?: string;
    });
}
//# sourceMappingURL=plain-error.d.ts.map