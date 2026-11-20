export interface FormatOptions {
    insertSpaces?: boolean;
    tabSize?: number;
}
/** Format block indentation without changing tokens, comments, or line endings. */
export declare function formatSource(source: string, options?: FormatOptions): string;
//# sourceMappingURL=formatter.d.ts.map