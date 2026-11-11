export interface SourceLocation {
  line: number;
  column: number;
  start?: number;
  end?: number;
  sourceFile?: string;
}

export type PlainErrorKind =
  | "LexerError"
  | "ParserError"
  | "RuntimeError"
  | "TypeError"
  | "NameError";

export class PlainError extends Error {
  public readonly kind: PlainErrorKind;
  public readonly location: SourceLocation;
  public readonly sourceCode?: string;
  public readonly suggestion?: string;

  constructor(
    message: string,
    location: SourceLocation,
    options?: {
      kind?: PlainErrorKind;
      sourceCode?: string;
      suggestion?: string;
    }
  ) {
    super(message);
    this.name = options?.kind || "PlainError";
    this.kind = options?.kind || "RuntimeError";
    this.location = location;
    this.sourceCode = options?.sourceCode;
    this.suggestion = options?.suggestion;
    Object.setPrototypeOf(this, PlainError.prototype);
  }
}
