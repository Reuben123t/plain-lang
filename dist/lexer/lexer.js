"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lexer = void 0;
const token_1 = require("./token");
const plain_error_1 = require("../errors/plain-error");
const KEYWORDS = {
    set: token_1.TokenType.Set,
    to: token_1.TokenType.To,
    say: token_1.TokenType.Say,
    show: token_1.TokenType.Show,
    ask: token_1.TokenType.Ask,
    and: token_1.TokenType.And,
    save: token_1.TokenType.Save,
    as: token_1.TokenType.As,
    clear: token_1.TokenType.Clear,
    screen: token_1.TokenType.Screen,
    if: token_1.TokenType.If,
    then: token_1.TokenType.Then,
    otherwise: token_1.TokenType.Otherwise,
    else: token_1.TokenType.Otherwise,
    repeat: token_1.TokenType.Repeat,
    times: token_1.TokenType.Times,
    while: token_1.TokenType.While,
    for: token_1.TokenType.For,
    each: token_1.TokenType.Each,
    in: token_1.TokenType.In,
    end: token_1.TokenType.End,
    give: token_1.TokenType.Give,
    back: token_1.TokenType.Back,
    item: token_1.TokenType.Item,
    of: token_1.TokenType.Of,
    add: token_1.TokenType.Add,
    remove: token_1.TokenType.Remove,
    from: token_1.TokenType.From,
    wait: token_1.TokenType.Wait,
    is: token_1.TokenType.Is,
    equal: token_1.TokenType.Equal,
    equals: token_1.TokenType.Equal,
    not: token_1.TokenType.Not,
    greater: token_1.TokenType.Greater,
    less: token_1.TokenType.Less,
    than: token_1.TokenType.Than,
    at: token_1.TokenType.At,
    least: token_1.TokenType.Least,
    most: token_1.TokenType.Most,
    plus: token_1.TokenType.Plus,
    minus: token_1.TokenType.Minus,
    divided: token_1.TokenType.Divided,
    by: token_1.TokenType.By,
    remainder: token_1.TokenType.Remainder,
    or: token_1.TokenType.Or,
    import: token_1.TokenType.Import,
    def: token_1.TokenType.Def,
    fn: token_1.TokenType.Def,
    function: token_1.TokenType.Def,
    return: token_1.TokenType.Return,
};
class Lexer {
    source;
    sourceFile;
    pos = 0;
    line = 1;
    column = 1;
    parenDepth = 0;
    bracketDepth = 0;
    constructor(source, sourceFile) {
        // Strip UTF-8 Byte Order Mark (BOM) if present (\uFEFF)
        if (source && source.charCodeAt(0) === 0xFEFF) {
            source = source.slice(1);
        }
        this.source = source;
        this.sourceFile = sourceFile;
    }
    tokenize() {
        const tokens = [];
        while (!this.isAtEnd()) {
            const char = this.peek();
            // Skip whitespace and BOM if encountered anywhere
            if (char === " " || char === "\t" || char === "\r" || char === "\uFEFF") {
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
                    if (tokens.length > 0 && tokens[tokens.length - 1].type !== token_1.TokenType.Newline) {
                        tokens.push({
                            type: token_1.TokenType.Newline,
                            value: "\n",
                            raw: "\n",
                            location: loc
                        });
                    }
                }
                continue;
            }
            // Comments (#)
            if (char === "#") {
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
                tokens.push({ type: token_1.TokenType.EqualEqual, value: "==", raw: "==", location: loc });
                continue;
            }
            if (char === "=" && this.peekNext() === ">") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.FatArrow, value: "=>", raw: "=>", location: loc });
                continue;
            }
            if (char === "!" && this.peekNext() === "=") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.BangEqual, value: "!=", raw: "!=", location: loc });
                continue;
            }
            if (char === "<" && this.peekNext() === "=") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.LessEqual, value: "<=", raw: "<=", location: loc });
                continue;
            }
            if (char === ">" && this.peekNext() === "=") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.GreaterEqual, value: ">=", raw: ">=", location: loc });
                continue;
            }
            if (char === "+" && this.peekNext() === "=") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.PlusEqual, value: "+=", raw: "+=", location: loc });
                continue;
            }
            if (char === "-" && this.peekNext() === "=") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.MinusEqual, value: "-=", raw: "-=", location: loc });
                continue;
            }
            if (char === "*" && this.peekNext() === "=") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.StarEqual, value: "*=", raw: "*=", location: loc });
                continue;
            }
            if (char === "/" && this.peekNext() === "=") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.SlashEqual, value: "/=", raw: "/=", location: loc });
                continue;
            }
            if (char === "/" && this.peekNext() === "/") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.SlashSlash, value: "//", raw: "//", location: loc });
                continue;
            }
            if (char === "*" && this.peekNext() === "*") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.StarStar, value: "**", raw: "**", location: loc });
                continue;
            }
            if (char === "-" && this.peekNext() === ">") {
                this.advance();
                this.advance();
                tokens.push({ type: token_1.TokenType.Arrow, value: "->", raw: "->", location: loc });
                continue;
            }
            // Single-character symbols
            switch (char) {
                case "=":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.Equal, value: "=", raw: "=", location: loc });
                    break;
                case ":":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.Colon, value: ":", raw: ":", location: loc });
                    break;
                case "{":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.LeftBrace, value: "{", raw: "{", location: loc });
                    break;
                case "}":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.RightBrace, value: "}", raw: "}", location: loc });
                    break;
                case "|":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.Pipe, value: "|", raw: "|", location: loc });
                    break;
                case ".":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.Dot, value: ".", raw: ".", location: loc });
                    break;
                case "+":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.PlusSign, value: "+", raw: "+", location: loc });
                    break;
                case "-":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.MinusSign, value: "-", raw: "-", location: loc });
                    break;
                case "*":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.StarSign, value: "*", raw: "*", location: loc });
                    break;
                case "/":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.SlashSign, value: "/", raw: "/", location: loc });
                    break;
                case "%":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.PercentSign, value: "%", raw: "%", location: loc });
                    break;
                case "<":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.LessSign, value: "<", raw: "<", location: loc });
                    break;
                case ">":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.GreaterSign, value: ">", raw: ">", location: loc });
                    break;
                case "(":
                    this.advance();
                    this.parenDepth++;
                    tokens.push({ type: token_1.TokenType.LeftParen, value: "(", raw: "(", location: loc });
                    break;
                case ")":
                    this.advance();
                    this.parenDepth = Math.max(0, this.parenDepth - 1);
                    tokens.push({ type: token_1.TokenType.RightParen, value: ")", raw: ")", location: loc });
                    break;
                case "[":
                    this.advance();
                    this.bracketDepth++;
                    tokens.push({ type: token_1.TokenType.LeftBracket, value: "[", raw: "[", location: loc });
                    break;
                case "]":
                    this.advance();
                    this.bracketDepth = Math.max(0, this.bracketDepth - 1);
                    tokens.push({ type: token_1.TokenType.RightBracket, value: "]", raw: "]", location: loc });
                    break;
                case ",":
                    this.advance();
                    tokens.push({ type: token_1.TokenType.Comma, value: ",", raw: ",", location: loc });
                    break;
                default:
                    throw new plain_error_1.PlainError(`I don't recognize the character '${char}'.`, loc, {
                        kind: "LexerError",
                        sourceCode: this.source,
                        suggestion: "Check for typos or unwanted punctuation symbols."
                    });
            }
        }
        // Append final newline if not present, then EOF
        if (tokens.length > 0 && tokens[tokens.length - 1].type !== token_1.TokenType.Newline) {
            tokens.push({
                type: token_1.TokenType.Newline,
                value: "\n",
                raw: "\n",
                location: this.currentLocation()
            });
        }
        tokens.push({
            type: token_1.TokenType.EOF,
            value: "",
            raw: "",
            location: this.currentLocation()
        });
        return tokens;
    }
    readString() {
        const quote = this.peek();
        const loc = this.currentLocation();
        this.advance(); // consume opening quote
        let result = "";
        while (!this.isAtEnd() && this.peek() !== quote) {
            if (this.peek() === "\n") {
                throw new plain_error_1.PlainError("You opened a text quote here, but forgot to close it before the end of the line.", loc, {
                    kind: "LexerError",
                    sourceCode: this.source,
                    suggestion: `Add a closing ${quote} at the end of your text.`
                });
            }
            if (this.peek() === "\\") {
                this.advance(); // consume escape backslash
                if (this.isAtEnd())
                    break;
                const esc = this.peek();
                if (esc === "n")
                    result += "\n";
                else if (esc === "t")
                    result += "\t";
                else if (esc === "r")
                    result += "\r";
                else if (esc === quote)
                    result += quote;
                else if (esc === "\\")
                    result += "\\";
                else
                    result += esc;
                this.advance();
            }
            else {
                result += this.peek();
                this.advance();
            }
        }
        if (this.isAtEnd()) {
            throw new plain_error_1.PlainError("You opened a text quote here, but didn't close it before the end of the file.", loc, {
                kind: "LexerError",
                sourceCode: this.source,
                suggestion: `Add a closing ${quote} at the end of your text.`
            });
        }
        this.advance(); // consume closing quote
        return {
            type: token_1.TokenType.String,
            value: result,
            raw: this.source.slice(loc.start, this.pos),
            location: loc
        };
    }
    readNumber() {
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
            type: token_1.TokenType.Number,
            value: num,
            raw,
            location: loc
        };
    }
    readIdentifierOrKeyword() {
        const loc = this.currentLocation();
        const start = this.pos;
        while (this.isAlphaNumeric(this.peek())) {
            this.advance();
        }
        const raw = this.source.slice(start, this.pos);
        const lower = raw.toLowerCase();
        if (lower === "true") {
            return { type: token_1.TokenType.Boolean, value: true, raw, location: loc };
        }
        if (lower === "false") {
            return { type: token_1.TokenType.Boolean, value: false, raw, location: loc };
        }
        if (lower === "nothing" || lower === "null") {
            return { type: token_1.TokenType.Nothing, value: null, raw, location: loc };
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
            type: token_1.TokenType.Identifier,
            value: raw,
            raw,
            location: loc
        };
    }
    skipComment() {
        while (!this.isAtEnd() && this.peek() !== "\n") {
            this.advance();
        }
    }
    peek() {
        return this.pos < this.source.length ? this.source[this.pos] : "";
    }
    peekNext() {
        return this.pos + 1 < this.source.length ? this.source[this.pos + 1] : "";
    }
    advance() {
        const char = this.peek();
        this.pos++;
        if (char === "\n") {
            this.line++;
            this.column = 1;
        }
        else {
            this.column++;
        }
        return char;
    }
    isAtEnd() {
        return this.pos >= this.source.length;
    }
    isDigit(char) {
        return char >= "0" && char <= "9";
    }
    isAlpha(char) {
        return ((char >= "a" && char <= "z") ||
            (char >= "A" && char <= "Z") ||
            char === "_");
    }
    isAlphaNumeric(char) {
        return this.isAlpha(char) || this.isDigit(char);
    }
    currentLocation() {
        return {
            line: this.line,
            column: this.column,
            start: this.pos,
            sourceFile: this.sourceFile
        };
    }
}
exports.Lexer = Lexer;
//# sourceMappingURL=lexer.js.map