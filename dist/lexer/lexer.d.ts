import { Token } from "./token";
export declare class Lexer {
    private source;
    private sourceFile?;
    private pos;
    private line;
    private column;
    private parenDepth;
    private bracketDepth;
    constructor(source: string, sourceFile?: string);
    tokenize(): Token[];
    private readString;
    private readNumber;
    private readIdentifierOrKeyword;
    private skipComment;
    private peek;
    private peekNext;
    private advance;
    private isAtEnd;
    private isDigit;
    private isAlpha;
    private isAlphaNumeric;
    private currentLocation;
}
//# sourceMappingURL=lexer.d.ts.map