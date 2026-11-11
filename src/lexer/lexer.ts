import { Token, TokenType } from "./token";
import { PlainError, SourceLocation } from "../errors/plain-error";

const KEYWORDS: Record<string, TokenType> = {
  set: TokenType.Set,
  to: TokenType.To,
  say: TokenType.Say,
  show: TokenType.Show,
  ask: TokenType.Ask,
  and: TokenType.And,
  save: TokenType.Save,
  as: TokenType.As,
  clear: TokenType.Clear,
  screen: TokenType.Screen,
  if: TokenType.If,
  then: TokenType.Then,
  otherwise: TokenType.Otherwise,
  else: TokenType.Otherwise,
  repeat: TokenType.Repeat,
  times: TokenType.Times,
  while: TokenType.While,
  for: TokenType.For,
  each: TokenType.Each,
  in: TokenType.In,
  end: TokenType.End,
  give: TokenType.Give,
  back: TokenType.Back,
  item: TokenType.Item,
  of: TokenType.Of,
  add: TokenType.Add,
  remove: TokenType.Remove,
  from: TokenType.From,
  wait: TokenType.Wait,
  is: TokenType.Is,
  equal: TokenType.Equal,
  equals: TokenType.Equal,
  not: TokenType.Not,
  greater: TokenType.Greater,
  less: TokenType.Less,
  than: TokenType.Than,
  at: TokenType.At,
  least: TokenType.Least,
  most: TokenType.Most,
  plus: TokenType.Plus,
  minus: TokenType.Minus,
  divided: TokenType.Divided,
  by: TokenType.By,
  remainder: TokenType.Remainder,
  or: TokenType.Or,
};

export class Lexer {
  private source: string;
  private sourceFile?: string;
  private pos = 0;
  private line = 1;
  private column = 1;
  private parenDepth = 0;
  private bracketDepth = 0;

  constructor(source: string, sourceFile?: string) {
    this.source = source;
    this.sourceFile = sourceFile;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];

    while (!this.isAtEnd()) {
      const char = this.peek();

      // Skip whitespace other than newlines
      if (char === " " || char === "\t" || char === "\r") {
        this.advance();
        continue;
      }

      // Newlines
      if (char === "\n") {
        const loc = this.currentLocation();
        this.advance();
        // Inside parentheses or brackets, newlines can be ignored
        if (this.parenDepth === 0 && this.bracketDepth === 0) {
          // Avoid duplicate consecutive newlines
          if (tokens.length > 0 && tokens[tokens.length - 1].type !== TokenType.Newline) {
            tokens.push({
              type: TokenType.Newline,
              value: "\n",
              raw: "\n",
              location: loc
            });
          }
        }
        continue;
      }

      // Comments (# or //)
      if (char === "#" || (char === "/" && this.peekNext() === "/")) {
        this.skipComment();
        continue;
      }

      // Strings
      if (char === '"' || char === "'") {
        tokens.push(this.readString());
        continue;
      }

      // Numbers
      if (this.isDigit(char)) {
        tokens.push(this.readNumber());
        continue;
      }

      // Identifiers & keywords
      if (this.isAlpha(char)) {
        tokens.push(this.readIdentifierOrKeyword());
        continue;
      }

      // Two-character symbols
      const loc = this.currentLocation();
      if (char === "=" && this.peekNext() === "=") {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.EqualEqual, value: "==", raw: "==", location: loc });
        continue;
      }
      if (char === "!" && this.peekNext() === "=") {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.BangEqual, value: "!=", raw: "!=", location: loc });
        continue;
      }
      if (char === "<" && this.peekNext() === "=") {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.LessEqual, value: "<=", raw: "<=", location: loc });
        continue;
      }
      if (char === ">" && this.peekNext() === "=") {
        this.advance();
        this.advance();
        tokens.push({ type: TokenType.GreaterEqual, value: ">=", raw: ">=", location: loc });
        continue;
      }

      // Single-character symbols
      switch (char) {
        case "+":
          this.advance();
          tokens.push({ type: TokenType.PlusSign, value: "+", raw: "+", location: loc });
          break;
        case "-":
          this.advance();
          tokens.push({ type: TokenType.MinusSign, value: "-", raw: "-", location: loc });
          break;
        case "*":
          this.advance();
          tokens.push({ type: TokenType.StarSign, value: "*", raw: "*", location: loc });
          break;
        case "/":
          this.advance();
          tokens.push({ type: TokenType.SlashSign, value: "/", raw: "/", location: loc });
          break;
        case "%":
          this.advance();
          tokens.push({ type: TokenType.PercentSign, value: "%", raw: "%", location: loc });
          break;
        case "<":
          this.advance();
          tokens.push({ type: TokenType.LessSign, value: "<", raw: "<", location: loc });
          break;
        case ">":
          this.advance();
          tokens.push({ type: TokenType.GreaterSign, value: ">", raw: ">", location: loc });
          break;
        case "(":
          this.advance();
          this.parenDepth++;
          tokens.push({ type: TokenType.LeftParen, value: "(", raw: "(", location: loc });
          break;
        case ")":
          this.advance();
          this.parenDepth = Math.max(0, this.parenDepth - 1);
          tokens.push({ type: TokenType.RightParen, value: ")", raw: ")", location: loc });
          break;
        case "[":
          this.advance();
          this.bracketDepth++;
          tokens.push({ type: TokenType.LeftBracket, value: "[", raw: "[", location: loc });
          break;
        case "]":
          this.advance();
          this.bracketDepth = Math.max(0, this.bracketDepth - 1);
          tokens.push({ type: TokenType.RightBracket, value: "]", raw: "]", location: loc });
          break;
        case ",":
          this.advance();
          tokens.push({ type: TokenType.Comma, value: ",", raw: ",", location: loc });
          break;
        default:
          throw new PlainError(
            `I don't recognize the character '${char}'.`,
            loc,
            {
              kind: "LexerError",
              sourceCode: this.source,
              suggestion: "Check for typos or unwanted punctuation symbols."
            }
          );
      }
    }

    // Append final newline if not present, then EOF
    if (tokens.length > 0 && tokens[tokens.length - 1].type !== TokenType.Newline) {
      tokens.push({
        type: TokenType.Newline,
        value: "\n",
        raw: "\n",
        location: this.currentLocation()
      });
    }

    tokens.push({
      type: TokenType.EOF,
      value: "",
      raw: "",
      location: this.currentLocation()
    });

    return tokens;
  }

  private readString(): Token {
    const quote = this.peek();
    const loc = this.currentLocation();
    this.advance(); // consume opening quote

    let result = "";
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === "\n") {
        throw new PlainError(
          "You opened a text quote here, but forgot to close it before the end of the line.",
          loc,
          {
            kind: "LexerError",
            sourceCode: this.source,
            suggestion: `Add a closing ${quote} at the end of your text.`
          }
        );
      }

      if (this.peek() === "\\") {
        this.advance(); // consume escape backslash
        if (this.isAtEnd()) break;
        const esc = this.peek();
        if (esc === "n") result += "\n";
        else if (esc === "t") result += "\t";
        else if (esc === "r") result += "\r";
        else if (esc === quote) result += quote;
        else if (esc === "\\") result += "\\";
        else result += esc;
        this.advance();
      } else {
        result += this.peek();
        this.advance();
      }
    }

    if (this.isAtEnd()) {
      throw new PlainError(
        "You opened a text quote here, but didn't close it before the end of the file.",
        loc,
        {
          kind: "LexerError",
          sourceCode: this.source,
          suggestion: `Add a closing ${quote} at the end of your text.`
        }
      );
    }

    this.advance(); // consume closing quote
    return {
      type: TokenType.String,
      value: result,
      raw: this.source.slice(loc.start, this.pos),
      location: loc
    };
  }

  private readNumber(): Token {
    const loc = this.currentLocation();
    const start = this.pos;

    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance(); // consume dot
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const raw = this.source.slice(start, this.pos);
    const num = parseFloat(raw);

    return {
      type: TokenType.Number,
      value: num,
      raw,
      location: loc
    };
  }

  private readIdentifierOrKeyword(): Token {
    const loc = this.currentLocation();
    const start = this.pos;

    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const raw = this.source.slice(start, this.pos);
    const lower = raw.toLowerCase();

    if (lower === "true") {
      return { type: TokenType.Boolean, value: true, raw, location: loc };
    }
    if (lower === "false") {
      return { type: TokenType.Boolean, value: false, raw, location: loc };
    }
    if (lower === "nothing" || lower === "null") {
      return { type: TokenType.Nothing, value: null, raw, location: loc };
    }

    if (KEYWORDS[lower]) {
      return {
        type: KEYWORDS[lower],
        value: lower,
        raw,
        location: loc
      };
    }

    return {
      type: TokenType.Identifier,
      value: raw,
      raw,
      location: loc
    };
  }

  private skipComment(): void {
    while (!this.isAtEnd() && this.peek() !== "\n") {
      this.advance();
    }
  }

  private peek(): string {
    return this.pos < this.source.length ? this.source[this.pos] : "";
  }

  private peekNext(): string {
    return this.pos + 1 < this.source.length ? this.source[this.pos + 1] : "";
  }

  private advance(): string {
    const char = this.peek();
    this.pos++;
    if (char === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    return char;
  }

  private isAtEnd(): boolean {
    return this.pos >= this.source.length;
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isAlpha(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private currentLocation(): SourceLocation {
    return {
      line: this.line,
      column: this.column,
      start: this.pos,
      sourceFile: this.sourceFile
    };
  }
}

