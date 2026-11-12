"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/cli/cli.ts
var cli_exports = {};
__export(cli_exports, {
  main: () => main
});
module.exports = __toCommonJS(cli_exports);
var fs5 = __toESM(require("fs"));
var path5 = __toESM(require("path"));

// src/errors/plain-error.ts
var PlainError = class _PlainError extends Error {
  kind;
  location;
  sourceCode;
  suggestion;
  constructor(message, location, options) {
    super(message);
    this.name = options?.kind || "PlainError";
    this.kind = options?.kind || "RuntimeError";
    this.location = location;
    this.sourceCode = options?.sourceCode;
    this.suggestion = options?.suggestion;
    Object.setPrototypeOf(this, _PlainError.prototype);
  }
};

// src/lexer/lexer.ts
var KEYWORDS = {
  set: "Set" /* Set */,
  to: "To" /* To */,
  say: "Say" /* Say */,
  show: "Show" /* Show */,
  ask: "Ask" /* Ask */,
  and: "And" /* And */,
  save: "Save" /* Save */,
  as: "As" /* As */,
  clear: "Clear" /* Clear */,
  screen: "Screen" /* Screen */,
  if: "If" /* If */,
  then: "Then" /* Then */,
  otherwise: "Otherwise" /* Otherwise */,
  else: "Otherwise" /* Otherwise */,
  repeat: "Repeat" /* Repeat */,
  times: "Times" /* Times */,
  while: "While" /* While */,
  for: "For" /* For */,
  each: "Each" /* Each */,
  in: "In" /* In */,
  end: "End" /* End */,
  give: "Give" /* Give */,
  back: "Back" /* Back */,
  item: "Item" /* Item */,
  of: "Of" /* Of */,
  add: "Add" /* Add */,
  remove: "Remove" /* Remove */,
  from: "From" /* From */,
  wait: "Wait" /* Wait */,
  is: "Is" /* Is */,
  equal: "Equal" /* Equal */,
  equals: "Equal" /* Equal */,
  not: "Not" /* Not */,
  greater: "Greater" /* Greater */,
  less: "Less" /* Less */,
  than: "Than" /* Than */,
  at: "At" /* At */,
  least: "Least" /* Least */,
  most: "Most" /* Most */,
  plus: "Plus" /* Plus */,
  minus: "Minus" /* Minus */,
  divided: "Divided" /* Divided */,
  by: "By" /* By */,
  remainder: "Remainder" /* Remainder */,
  or: "Or" /* Or */
};
var Lexer = class {
  source;
  sourceFile;
  pos = 0;
  line = 1;
  column = 1;
  parenDepth = 0;
  bracketDepth = 0;
  constructor(source, sourceFile) {
    this.source = source;
    this.sourceFile = sourceFile;
  }
  tokenize() {
    const tokens = [];
    while (!this.isAtEnd()) {
      const char = this.peek();
      if (char === " " || char === "	" || char === "\r") {
        this.advance();
        continue;
      }
      if (char === "\n") {
        const loc2 = this.currentLocation();
        this.advance();
        if (this.parenDepth === 0 && this.bracketDepth === 0) {
          if (tokens.length > 0 && tokens[tokens.length - 1].type !== "Newline" /* Newline */) {
            tokens.push({
              type: "Newline" /* Newline */,
              value: "\n",
              raw: "\n",
              location: loc2
            });
          }
        }
        continue;
      }
      if (char === "#" || char === "/" && this.peekNext() === "/") {
        this.skipComment();
        continue;
      }
      if (char === '"' || char === "'") {
        tokens.push(this.readString());
        continue;
      }
      if (this.isDigit(char)) {
        tokens.push(this.readNumber());
        continue;
      }
      if (this.isAlpha(char)) {
        tokens.push(this.readIdentifierOrKeyword());
        continue;
      }
      const loc = this.currentLocation();
      if (char === "=" && this.peekNext() === "=") {
        this.advance();
        this.advance();
        tokens.push({ type: "EqualEqual" /* EqualEqual */, value: "==", raw: "==", location: loc });
        continue;
      }
      if (char === "!" && this.peekNext() === "=") {
        this.advance();
        this.advance();
        tokens.push({ type: "BangEqual" /* BangEqual */, value: "!=", raw: "!=", location: loc });
        continue;
      }
      if (char === "<" && this.peekNext() === "=") {
        this.advance();
        this.advance();
        tokens.push({ type: "LessEqual" /* LessEqual */, value: "<=", raw: "<=", location: loc });
        continue;
      }
      if (char === ">" && this.peekNext() === "=") {
        this.advance();
        this.advance();
        tokens.push({ type: "GreaterEqual" /* GreaterEqual */, value: ">=", raw: ">=", location: loc });
        continue;
      }
      switch (char) {
        case "+":
          this.advance();
          tokens.push({ type: "PlusSign" /* PlusSign */, value: "+", raw: "+", location: loc });
          break;
        case "-":
          this.advance();
          tokens.push({ type: "MinusSign" /* MinusSign */, value: "-", raw: "-", location: loc });
          break;
        case "*":
          this.advance();
          tokens.push({ type: "StarSign" /* StarSign */, value: "*", raw: "*", location: loc });
          break;
        case "/":
          this.advance();
          tokens.push({ type: "SlashSign" /* SlashSign */, value: "/", raw: "/", location: loc });
          break;
        case "%":
          this.advance();
          tokens.push({ type: "PercentSign" /* PercentSign */, value: "%", raw: "%", location: loc });
          break;
        case "<":
          this.advance();
          tokens.push({ type: "LessSign" /* LessSign */, value: "<", raw: "<", location: loc });
          break;
        case ">":
          this.advance();
          tokens.push({ type: "GreaterSign" /* GreaterSign */, value: ">", raw: ">", location: loc });
          break;
        case "(":
          this.advance();
          this.parenDepth++;
          tokens.push({ type: "LeftParen" /* LeftParen */, value: "(", raw: "(", location: loc });
          break;
        case ")":
          this.advance();
          this.parenDepth = Math.max(0, this.parenDepth - 1);
          tokens.push({ type: "RightParen" /* RightParen */, value: ")", raw: ")", location: loc });
          break;
        case "[":
          this.advance();
          this.bracketDepth++;
          tokens.push({ type: "LeftBracket" /* LeftBracket */, value: "[", raw: "[", location: loc });
          break;
        case "]":
          this.advance();
          this.bracketDepth = Math.max(0, this.bracketDepth - 1);
          tokens.push({ type: "RightBracket" /* RightBracket */, value: "]", raw: "]", location: loc });
          break;
        case ",":
          this.advance();
          tokens.push({ type: "Comma" /* Comma */, value: ",", raw: ",", location: loc });
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
    if (tokens.length > 0 && tokens[tokens.length - 1].type !== "Newline" /* Newline */) {
      tokens.push({
        type: "Newline" /* Newline */,
        value: "\n",
        raw: "\n",
        location: this.currentLocation()
      });
    }
    tokens.push({
      type: "EOF" /* EOF */,
      value: "",
      raw: "",
      location: this.currentLocation()
    });
    return tokens;
  }
  readString() {
    const quote = this.peek();
    const loc = this.currentLocation();
    this.advance();
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
        this.advance();
        if (this.isAtEnd()) break;
        const esc = this.peek();
        if (esc === "n") result += "\n";
        else if (esc === "t") result += "	";
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
    this.advance();
    return {
      type: "String" /* String */,
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
      this.advance();
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }
    const raw = this.source.slice(start, this.pos);
    const num = parseFloat(raw);
    return {
      type: "Number" /* Number */,
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
      return { type: "Boolean" /* Boolean */, value: true, raw, location: loc };
    }
    if (lower === "false") {
      return { type: "Boolean" /* Boolean */, value: false, raw, location: loc };
    }
    if (lower === "nothing" || lower === "null") {
      return { type: "Nothing" /* Nothing */, value: null, raw, location: loc };
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
      type: "Identifier" /* Identifier */,
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
    } else {
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
    return char >= "a" && char <= "z" || char >= "A" && char <= "Z" || char === "_";
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
};

// src/parser/parser.ts
var Parser = class {
  tokens;
  current = 0;
  source;
  sourceFile;
  constructor(tokens, source, sourceFile) {
    this.tokens = tokens;
    this.source = source;
    this.sourceFile = sourceFile;
  }
  parse() {
    const startLoc = this.peek().location;
    const body = [];
    this.skipNewlines();
    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
      this.skipNewlines();
    }
    return {
      type: "Program",
      body,
      location: startLoc
    };
  }
  // ==========================================
  // Statements
  // ==========================================
  parseStatement() {
    this.skipNewlines();
    const token = this.peek();
    switch (token.type) {
      case "Set" /* Set */:
        return this.parseSetStatement();
      case "Say" /* Say */:
        return this.parseSayStatement();
      case "Show" /* Show */:
        return this.parseShowStatement();
      case "Ask" /* Ask */:
        return this.parseAskStatement();
      case "Clear" /* Clear */:
        return this.parseClearStatement();
      case "If" /* If */:
        return this.parseIfStatement();
      case "Repeat" /* Repeat */:
        return this.parseRepeatStatement();
      case "For" /* For */:
        return this.parseForEachStatement();
      case "To" /* To */:
        return this.parseFunctionDefStatement();
      case "Give" /* Give */:
        return this.parseReturnStatement();
      case "Add" /* Add */:
        return this.parseListAddStatement();
      case "Remove" /* Remove */:
        return this.parseListRemoveStatement();
      case "Wait" /* Wait */:
        return this.parseWaitStatement();
      default:
        return this.parseExpressionStatement();
    }
  }
  parseSetStatement() {
    const setToken = this.advance();
    if (this.isAtEnd() || this.peek().type !== "Identifier" /* Identifier */) {
      throw new PlainError(
        `I expected a variable name after 'set'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: set score to 100"
        }
      );
    }
    const nameToken = this.advance();
    const varName = nameToken.value;
    if (!this.match("To" /* To */)) {
      throw new PlainError(
        `I expected 'to' after the variable name in 'set ${varName} to ...'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: `Write 'set ${varName} to <value>'`
        }
      );
    }
    if (this.isAtStatementEnd()) {
      throw new PlainError(
        `I expected a value after 'set ${varName} to'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: `Provide a value, such as: set ${varName} to 10`
        }
      );
    }
    const value = this.parseExpression();
    this.expectStatementEnd();
    return {
      type: "SetStatement",
      name: varName,
      value,
      location: setToken.location
    };
  }
  parseSayStatement() {
    const token = this.advance();
    if (this.isAtStatementEnd()) {
      throw new PlainError(
        `I expected something to say after 'say'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: 'Example: say "Hello, world!"'
        }
      );
    }
    const value = this.parseExpression();
    this.expectStatementEnd();
    return {
      type: "SayStatement",
      value,
      location: token.location
    };
  }
  parseShowStatement() {
    const token = this.advance();
    if (this.isAtStatementEnd()) {
      throw new PlainError(
        `I expected something to show after 'show'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: show total"
        }
      );
    }
    const value = this.parseExpression();
    this.expectStatementEnd();
    return {
      type: "ShowStatement",
      value,
      location: token.location
    };
  }
  parseAskStatement() {
    const token = this.advance();
    if (this.isAtStatementEnd()) {
      throw new PlainError(
        `I expected a prompt message after 'ask'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: 'Example: ask "What is your name?" and save as name'
        }
      );
    }
    const prompt = this.parseExpression();
    let targetVariable;
    if (this.check("And" /* And */)) {
      this.advance();
      if (!this.match("Save" /* Save */)) {
        throw new PlainError(
          `I expected 'save as' after 'and' in ask statement.`,
          this.peek().location,
          {
            kind: "ParserError",
            sourceCode: this.source,
            suggestion: 'Pattern: ask "Prompt" and save as variable_name'
          }
        );
      }
      if (!this.match("As" /* As */)) {
        throw new PlainError(
          `I expected 'as' after 'save' in ask statement.`,
          this.peek().location,
          {
            kind: "ParserError",
            sourceCode: this.source,
            suggestion: 'Pattern: ask "Prompt" and save as variable_name'
          }
        );
      }
      if (!this.check("Identifier" /* Identifier */)) {
        throw new PlainError(
          `I expected a variable name to store the answer.`,
          this.peek().location,
          {
            kind: "ParserError",
            sourceCode: this.source,
            suggestion: 'Example: ask "Your name?" and save as username'
          }
        );
      }
      targetVariable = this.advance().value;
    }
    this.expectStatementEnd();
    return {
      type: "AskStatement",
      prompt,
      targetVariable,
      location: token.location
    };
  }
  parseClearStatement() {
    const token = this.advance();
    if (!this.match("Screen" /* Screen */)) {
      throw new PlainError(
        `I expected 'screen' after 'clear'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Write 'clear screen' to wipe the terminal display."
        }
      );
    }
    this.expectStatementEnd();
    return {
      type: "ClearScreenStatement",
      location: token.location
    };
  }
  parseIfStatement() {
    const token = this.advance();
    const condition = this.parseExpression();
    this.match("Then" /* Then */);
    this.expectStatementEnd();
    const consequent = [];
    const otherwiseIfBranches = [];
    let alternate;
    while (!this.isAtEnd() && !this.check("Otherwise" /* Otherwise */) && !this.check("End" /* End */)) {
      this.skipNewlines();
      if (this.check("Otherwise" /* Otherwise */) || this.check("End" /* End */)) break;
      consequent.push(this.parseStatement());
      this.skipNewlines();
    }
    while (this.match("Otherwise" /* Otherwise */)) {
      if (this.match("If" /* If */)) {
        const branchLoc = this.previous().location;
        const branchCond = this.parseExpression();
        this.match("Then" /* Then */);
        this.expectStatementEnd();
        const branchBody = [];
        while (!this.isAtEnd() && !this.check("Otherwise" /* Otherwise */) && !this.check("End" /* End */)) {
          this.skipNewlines();
          if (this.check("Otherwise" /* Otherwise */) || this.check("End" /* End */)) break;
          branchBody.push(this.parseStatement());
          this.skipNewlines();
        }
        otherwiseIfBranches.push({
          condition: branchCond,
          body: branchBody,
          location: branchLoc
        });
      } else {
        this.expectStatementEnd();
        alternate = [];
        while (!this.isAtEnd() && !this.check("End" /* End */)) {
          this.skipNewlines();
          if (this.check("End" /* End */)) break;
          alternate.push(this.parseStatement());
          this.skipNewlines();
        }
        break;
      }
    }
    if (!this.match("End" /* End */)) {
      throw new PlainError(
        `You started an 'if' block on line ${token.location.line}, but forgot to close it with 'end'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Add 'end' after your if/otherwise block."
        }
      );
    }
    this.expectStatementEnd();
    return {
      type: "IfStatement",
      condition,
      consequent,
      otherwiseIfBranches,
      alternate,
      location: token.location
    };
  }
  inRepeatCount = false;
  parseRepeatStatement() {
    const token = this.advance();
    if (this.match("While" /* While */)) {
      const condition = this.parseExpression();
      this.expectStatementEnd();
      const body2 = [];
      while (!this.isAtEnd() && !this.check("End" /* End */)) {
        this.skipNewlines();
        if (this.check("End" /* End */)) break;
        body2.push(this.parseStatement());
        this.skipNewlines();
      }
      if (!this.match("End" /* End */)) {
        throw new PlainError(
          `You started a 'repeat while' loop on line ${token.location.line}, but didn't close it with 'end'.`,
          this.peek().location,
          {
            kind: "ParserError",
            sourceCode: this.source,
            suggestion: "Add 'end' to close the repeat while loop."
          }
        );
      }
      this.expectStatementEnd();
      return {
        type: "RepeatWhileStatement",
        condition,
        body: body2,
        location: token.location
      };
    }
    this.inRepeatCount = true;
    let count;
    try {
      count = this.parseExpression();
    } finally {
      this.inRepeatCount = false;
    }
    if (!this.match("Times" /* Times */)) {
      throw new PlainError(
        `I expected 'times' after the number in 'repeat ... times'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: 'Example: repeat 5 times\n    say "Hello"\nend'
        }
      );
    }
    this.expectStatementEnd();
    const body = [];
    while (!this.isAtEnd() && !this.check("End" /* End */)) {
      this.skipNewlines();
      if (this.check("End" /* End */)) break;
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    if (!this.match("End" /* End */)) {
      throw new PlainError(
        `You started a 'repeat' loop on line ${token.location.line}, but didn't close it with 'end'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Add 'end' to close the repeat loop."
        }
      );
    }
    this.expectStatementEnd();
    return {
      type: "RepeatTimesStatement",
      count,
      body,
      location: token.location
    };
  }
  parseForEachStatement() {
    const token = this.advance();
    if (!this.match("Each" /* Each */)) {
      throw new PlainError(
        `I expected 'each' after 'for'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Pattern: for each item in list\n    say item\nend"
        }
      );
    }
    if (!this.check("Identifier" /* Identifier */)) {
      throw new PlainError(
        `I expected an item variable name after 'for each'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: for each score in scores"
        }
      );
    }
    const itemVariable = this.advance().value;
    if (!this.match("In" /* In */)) {
      throw new PlainError(
        `I expected 'in' after the item variable '${itemVariable}'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: `Example: for each ${itemVariable} in my_list`
        }
      );
    }
    const list = this.parseExpression();
    this.expectStatementEnd();
    const body = [];
    while (!this.isAtEnd() && !this.check("End" /* End */)) {
      this.skipNewlines();
      if (this.check("End" /* End */)) break;
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    if (!this.match("End" /* End */)) {
      throw new PlainError(
        `You started a 'for each' loop on line ${token.location.line}, but didn't close it with 'end'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Add 'end' to close the loop."
        }
      );
    }
    this.expectStatementEnd();
    return {
      type: "ForEachStatement",
      itemVariable,
      list,
      body,
      location: token.location
    };
  }
  isWord(token) {
    return token.type === "Identifier" /* Identifier */ || token.type === "Add" /* Add */ || token.type === "Remove" /* Remove */ || token.type === "Item" /* Item */ || token.type === "Ask" /* Ask */ || token.type === "Show" /* Show */ || token.type === "Wait" /* Wait */ || token.type === "Clear" /* Clear */;
  }
  parseFunctionDefStatement() {
    const token = this.advance();
    if (!this.isWord(this.peek())) {
      throw new PlainError(
        `I expected a function name after 'to'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: 'Example: to greet person\n    say "Hello " plus person\nend'
        }
      );
    }
    const name = this.advance().raw;
    const parameters = [];
    if (this.match("LeftParen" /* LeftParen */)) {
      if (!this.check("RightParen" /* RightParen */)) {
        do {
          if (!this.isWord(this.peek())) {
            throw new PlainError(
              `I expected a parameter name in the parameter list.`,
              this.peek().location,
              { kind: "ParserError", sourceCode: this.source }
            );
          }
          parameters.push(this.advance().raw);
        } while (this.match("Comma" /* Comma */));
      }
      this.consume("RightParen" /* RightParen */, "I expected ')' after function parameters.");
    } else {
      while (!this.isAtStatementEnd()) {
        if (this.isWord(this.peek())) {
          parameters.push(this.advance().raw);
          if (this.check("And" /* And */)) {
            this.advance();
          } else if (this.check("Comma" /* Comma */)) {
            this.advance();
          }
        } else {
          break;
        }
      }
    }
    this.expectStatementEnd();
    const body = [];
    while (!this.isAtEnd() && !this.check("End" /* End */)) {
      this.skipNewlines();
      if (this.check("End" /* End */)) break;
      body.push(this.parseStatement());
      this.skipNewlines();
    }
    if (!this.match("End" /* End */)) {
      throw new PlainError(
        `You defined the function '${name}' on line ${token.location.line}, but didn't close it with 'end'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Add 'end' at the end of the function definition."
        }
      );
    }
    this.expectStatementEnd();
    return {
      type: "FunctionDefStatement",
      name,
      parameters,
      body,
      location: token.location
    };
  }
  parseReturnStatement() {
    const token = this.advance();
    if (!this.match("Back" /* Back */)) {
      throw new PlainError(
        `I expected 'back' after 'give'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "To return a value from a function, write: give back <value>"
        }
      );
    }
    let value;
    if (!this.isAtStatementEnd()) {
      value = this.parseExpression();
    }
    this.expectStatementEnd();
    return {
      type: "ReturnStatement",
      value,
      location: token.location
    };
  }
  parseListAddStatement() {
    const token = this.advance();
    const value = this.parseExpression();
    if (!this.match("To" /* To */)) {
      throw new PlainError(
        `I expected 'to' after the value in 'add ... to <list>'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: add 90 to scores"
        }
      );
    }
    if (!this.check("Identifier" /* Identifier */)) {
      throw new PlainError(
        `I expected the name of the list variable after 'to'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: add 90 to scores"
        }
      );
    }
    const targetVariable = this.advance().value;
    this.expectStatementEnd();
    return {
      type: "ListAddStatement",
      value,
      targetVariable,
      location: token.location
    };
  }
  parseListRemoveStatement() {
    const token = this.advance();
    const value = this.parseExpression();
    if (!this.match("From" /* From */)) {
      throw new PlainError(
        `I expected 'from' after the value in 'remove ... from <list>'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: 'Example: remove "green" from colors'
        }
      );
    }
    if (!this.check("Identifier" /* Identifier */)) {
      throw new PlainError(
        `I expected the name of the list variable after 'from'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: 'Example: remove "green" from colors'
        }
      );
    }
    const targetVariable = this.advance().value;
    this.expectStatementEnd();
    return {
      type: "ListRemoveStatement",
      value,
      targetVariable,
      location: token.location
    };
  }
  parseWaitStatement() {
    const token = this.advance();
    const duration = this.parseExpression();
    this.expectStatementEnd();
    return {
      type: "WaitStatement",
      duration,
      location: token.location
    };
  }
  parseExpressionStatement() {
    const expr = this.parseExpression();
    this.expectStatementEnd();
    return {
      type: "ExpressionStatement",
      expression: expr,
      location: expr.location
    };
  }
  // ==========================================
  // Expressions
  // ==========================================
  parseExpression() {
    return this.parseLogicalOr();
  }
  parseLogicalOr() {
    let left = this.parseLogicalAnd();
    while (this.match("Or" /* Or */)) {
      const opToken = this.previous();
      const right = this.parseLogicalAnd();
      left = {
        type: "BinaryExpression",
        operator: "or",
        left,
        right,
        location: opToken.location
      };
    }
    return left;
  }
  parseLogicalAnd() {
    let left = this.parseComparison();
    while (this.check("And" /* And */)) {
      const next = this.peekNext();
      if (next && next.type === "Save" /* Save */) {
        break;
      }
      this.advance();
      const opToken = this.previous();
      const right = this.parseComparison();
      left = {
        type: "BinaryExpression",
        operator: "and",
        left,
        right,
        location: opToken.location
      };
    }
    return left;
  }
  parseComparison() {
    let left = this.parseAdditive();
    while (true) {
      if (this.match("EqualEqual" /* EqualEqual */)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "==", left, right, location: left.location };
        continue;
      }
      if (this.match("BangEqual" /* BangEqual */)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "!=", left, right, location: left.location };
        continue;
      }
      if (this.match("LessSign" /* LessSign */)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "<", left, right, location: left.location };
        continue;
      }
      if (this.match("GreaterSign" /* GreaterSign */)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: ">", left, right, location: left.location };
        continue;
      }
      if (this.match("LessEqual" /* LessEqual */)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "<=", left, right, location: left.location };
        continue;
      }
      if (this.match("GreaterEqual" /* GreaterEqual */)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: ">=", left, right, location: left.location };
        continue;
      }
      if (this.check("Is" /* Is */)) {
        const isToken = this.advance();
        if (this.match("Equal" /* Equal */)) {
          this.match("To" /* To */);
          const right2 = this.parseAdditive();
          left = { type: "BinaryExpression", operator: "==", left, right: right2, location: isToken.location };
          continue;
        }
        if (this.match("Not" /* Not */)) {
          if (this.match("Equal" /* Equal */)) {
            this.match("To" /* To */);
          }
          const right2 = this.parseAdditive();
          left = { type: "BinaryExpression", operator: "!=", left, right: right2, location: isToken.location };
          continue;
        }
        if (this.match("Greater" /* Greater */)) {
          this.consume("Than" /* Than */, "I expected 'than' after 'greater'.");
          const right2 = this.parseAdditive();
          left = { type: "BinaryExpression", operator: ">", left, right: right2, location: isToken.location };
          continue;
        }
        if (this.match("Less" /* Less */)) {
          this.consume("Than" /* Than */, "I expected 'than' after 'less'.");
          const right2 = this.parseAdditive();
          left = { type: "BinaryExpression", operator: "<", left, right: right2, location: isToken.location };
          continue;
        }
        if (this.match("At" /* At */)) {
          if (this.match("Least" /* Least */)) {
            const right2 = this.parseAdditive();
            left = { type: "BinaryExpression", operator: ">=", left, right: right2, location: isToken.location };
            continue;
          }
          if (this.match("Most" /* Most */)) {
            const right2 = this.parseAdditive();
            left = { type: "BinaryExpression", operator: "<=", left, right: right2, location: isToken.location };
            continue;
          }
          throw new PlainError(
            `I expected 'least' or 'most' after 'is at'.`,
            this.peek().location,
            { kind: "ParserError", sourceCode: this.source, suggestion: "Use 'is at least' or 'is at most'." }
          );
        }
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "==", left, right, location: isToken.location };
        continue;
      }
      break;
    }
    return left;
  }
  parseAdditive() {
    let left = this.parseMultiplicative();
    while (this.match("Plus" /* Plus */, "PlusSign" /* PlusSign */, "Minus" /* Minus */, "MinusSign" /* MinusSign */)) {
      const opToken = this.previous();
      const operator = opToken.type === "Plus" /* Plus */ || opToken.type === "PlusSign" /* PlusSign */ ? "+" : "-";
      const right = this.parseMultiplicative();
      left = {
        type: "BinaryExpression",
        operator,
        left,
        right,
        location: opToken.location
      };
    }
    return left;
  }
  parseMultiplicative() {
    let left = this.parseUnary();
    while (true) {
      if (this.match("StarSign" /* StarSign */)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "*", left, right, location: left.location };
        continue;
      }
      if (!this.inRepeatCount && this.match("Times" /* Times */)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "*", left, right, location: left.location };
        continue;
      }
      if (this.match("SlashSign" /* SlashSign */)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "/", left, right, location: left.location };
        continue;
      }
      if (this.match("Divided" /* Divided */)) {
        this.consume("By" /* By */, "I expected 'by' after 'divided'.");
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "/", left, right, location: left.location };
        continue;
      }
      if (this.match("PercentSign" /* PercentSign */)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "%", left, right, location: left.location };
        continue;
      }
      if (this.match("Remainder" /* Remainder */)) {
        this.consume("Of" /* Of */, "I expected 'of' after 'remainder'.");
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "%", left, right, location: left.location };
        continue;
      }
      break;
    }
    return left;
  }
  parseUnary() {
    if (this.match("Not" /* Not */)) {
      const token = this.previous();
      const argument = this.parseUnary();
      return {
        type: "UnaryExpression",
        operator: "not",
        argument,
        location: token.location
      };
    }
    if (this.match("MinusSign" /* MinusSign */)) {
      const token = this.previous();
      const argument = this.parseUnary();
      return {
        type: "UnaryExpression",
        operator: "-",
        argument,
        location: token.location
      };
    }
    return this.parsePrimary();
  }
  parsePrimary() {
    const token = this.peek();
    if (this.match("Number" /* Number */)) {
      return {
        type: "NumberLiteral",
        value: this.previous().value,
        location: token.location
      };
    }
    if (this.match("String" /* String */)) {
      return {
        type: "StringLiteral",
        value: this.previous().value,
        location: token.location
      };
    }
    if (this.match("Boolean" /* Boolean */)) {
      return {
        type: "BooleanLiteral",
        value: this.previous().value,
        location: token.location
      };
    }
    if (this.match("Nothing" /* Nothing */)) {
      return {
        type: "NothingLiteral",
        location: token.location
      };
    }
    if (this.match("LeftParen" /* LeftParen */)) {
      const expr = this.parseExpression();
      this.consume("RightParen" /* RightParen */, "I expected a closing ')' here.");
      return expr;
    }
    if (this.match("LeftBracket" /* LeftBracket */)) {
      const elements = [];
      if (!this.check("RightBracket" /* RightBracket */)) {
        do {
          this.skipNewlines();
          if (this.check("RightBracket" /* RightBracket */)) break;
          elements.push(this.parseExpression());
          this.skipNewlines();
        } while (this.match("Comma" /* Comma */));
      }
      this.consume("RightBracket" /* RightBracket */, "I expected a closing ']' for the list.");
      return {
        type: "ListLiteral",
        elements,
        location: token.location
      };
    }
    if (this.match("Item" /* Item */)) {
      const index = this.parseUnary();
      this.consume("Of" /* Of */, "I expected 'of' after the item number in 'item N of list'.");
      const list = this.parseUnary();
      return {
        type: "ItemOfExpression",
        index,
        list,
        location: token.location
      };
    }
    if (this.check("To" /* To */)) {
      const next = this.peekNext();
      if (next && next.type === "Identifier" /* Identifier */ && (next.value === "number" || next.value === "text")) {
        this.advance();
        const fnName = this.advance().value === "number" ? "to_number" : "to_text";
        return this.parseFunctionCallArgs(fnName, token.location);
      }
    }
    if (this.checkWord("starts")) {
      const next = this.peekNext();
      if (next && (next.value === "with" || next.type === "Identifier" /* Identifier */)) {
        this.advance();
        this.advance();
        return this.parseFunctionCallArgs("starts_with", token.location);
      }
    }
    if (this.checkWord("ends")) {
      const next = this.peekNext();
      if (next && (next.value === "with" || next.type === "Identifier" /* Identifier */)) {
        this.advance();
        this.advance();
        return this.parseFunctionCallArgs("ends_with", token.location);
      }
    }
    if (this.checkWord("random")) {
      const next = this.peekNext();
      if (next && (next.value === "between" || next.type === "Identifier" /* Identifier */)) {
        this.advance();
        this.advance();
        return this.parseFunctionCallArgs("random_between", token.location);
      }
    }
    if (this.checkWord("days")) {
      const next = this.peekNext();
      if (next && (next.value === "between" || next.type === "Identifier" /* Identifier */)) {
        this.advance();
        this.advance();
        return this.parseFunctionCallArgs("days_between", token.location);
      }
    }
    if (this.checkWord("current")) {
      const next = this.peekNext();
      if (next && (next.value === "time" || next.type === "Identifier" /* Identifier */)) {
        this.advance();
        this.advance();
        if (this.match("LeftParen" /* LeftParen */)) {
          this.consume("RightParen" /* RightParen */, "I expected ')' after 'current time()'.");
        }
        return {
          type: "CallExpression",
          callee: "current_time",
          arguments: [],
          location: token.location
        };
      }
    }
    if (this.checkWord("read")) {
      const next = this.peekNext();
      if (next && (next.value === "file" || next.type === "Identifier" /* Identifier */)) {
        this.advance();
        this.advance();
        return this.parseFunctionCallArgs("read_file", token.location);
      }
    }
    if (this.checkWord("write")) {
      const next = this.peekNext();
      if (next && (next.value === "file" || next.type === "Identifier" /* Identifier */)) {
        this.advance();
        this.advance();
        return this.parseFunctionCallArgs("write_file", token.location);
      }
    }
    if (this.checkWord("file")) {
      const next = this.peekNext();
      if (next && (next.value === "exists" || next.type === "Identifier" /* Identifier */)) {
        this.advance();
        this.advance();
        return this.parseFunctionCallArgs("file_exists", token.location);
      }
    }
    if (this.isWord(token)) {
      const nameToken = this.advance();
      const name = nameToken.raw;
      if (this.match("LeftParen" /* LeftParen */)) {
        const args = [];
        if (!this.check("RightParen" /* RightParen */)) {
          do {
            this.skipNewlines();
            if (this.check("RightParen" /* RightParen */)) break;
            args.push(this.parseExpression());
            this.skipNewlines();
          } while (this.match("Comma" /* Comma */));
        }
        this.consume("RightParen" /* RightParen */, `I expected a closing ')' for function '${name}'.`);
        return {
          type: "CallExpression",
          callee: name,
          arguments: args,
          location: token.location
        };
      }
      if (this.canStartArgument()) {
        const args = [];
        const firstArg = this.parseUnary();
        args.push(firstArg);
        while (this.match("And" /* And */) || this.match("Comma" /* Comma */)) {
          if (this.canStartArgument()) {
            args.push(this.parseUnary());
          } else {
            break;
          }
        }
        return {
          type: "CallExpression",
          callee: name,
          arguments: args,
          location: token.location
        };
      }
      return {
        type: "Identifier",
        name,
        location: token.location
      };
    }
    throw new PlainError(
      `I didn't understand '${token.raw || token.type}' here.`,
      token.location,
      {
        kind: "ParserError",
        sourceCode: this.source,
        suggestion: "Check for missing values, quotes, or keywords."
      }
    );
  }
  parseFunctionCallArgs(callee, loc) {
    const args = [];
    if (this.match("LeftParen" /* LeftParen */)) {
      if (!this.check("RightParen" /* RightParen */)) {
        do {
          this.skipNewlines();
          if (this.check("RightParen" /* RightParen */)) break;
          args.push(this.parseExpression());
          this.skipNewlines();
        } while (this.match("Comma" /* Comma */));
      }
      this.consume("RightParen" /* RightParen */, `I expected a closing ')' for '${callee}'.`);
    } else if (this.canStartArgument()) {
      args.push(this.parseUnary());
      while (this.match("And" /* And */) || this.match("Comma" /* Comma */)) {
        if (this.canStartArgument()) {
          args.push(this.parseUnary());
        } else {
          break;
        }
      }
    }
    return {
      type: "CallExpression",
      callee,
      arguments: args,
      location: loc
    };
  }
  canStartArgument() {
    if (this.isAtStatementEnd()) return false;
    const type = this.peek().type;
    return type === "Number" /* Number */ || type === "String" /* String */ || type === "Boolean" /* Boolean */ || type === "Nothing" /* Nothing */ || type === "LeftBracket" /* LeftBracket */ || type === "LeftParen" /* LeftParen */ || type === "Identifier" /* Identifier */ || type === "Item" /* Item */;
  }
  checkWord(word) {
    const tok = this.peek();
    return tok.type === "Identifier" /* Identifier */ && typeof tok.value === "string" && tok.value.toLowerCase() === word.toLowerCase();
  }
  // ==========================================
  // Helper methods
  // ==========================================
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }
  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }
  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }
  isAtEnd() {
    return this.peek().type === "EOF" /* EOF */;
  }
  peek() {
    return this.tokens[this.current];
  }
  peekNext() {
    if (this.current + 1 < this.tokens.length) {
      return this.tokens[this.current + 1];
    }
    return void 0;
  }
  previous() {
    return this.tokens[this.current - 1];
  }
  consume(type, errorMessage) {
    if (this.check(type)) return this.advance();
    throw new PlainError(errorMessage, this.peek().location, {
      kind: "ParserError",
      sourceCode: this.source
    });
  }
  skipNewlines() {
    while (!this.isAtEnd() && this.peek().type === "Newline" /* Newline */) {
      this.advance();
    }
  }
  isAtStatementEnd() {
    if (this.isAtEnd()) return true;
    const type = this.peek().type;
    return type === "Newline" /* Newline */ || type === "EOF" /* EOF */ || type === "End" /* End */ || type === "Otherwise" /* Otherwise */ || type === "Then" /* Then */;
  }
  expectStatementEnd() {
    if (this.isAtEnd()) return;
    if (this.peek().type === "Newline" /* Newline */) {
      this.advance();
      this.skipNewlines();
      return;
    }
    if (this.peek().type === "End" /* End */ || this.peek().type === "Otherwise" /* Otherwise */) {
      return;
    }
    throw new PlainError(
      `I expected the instruction to finish here on line ${this.peek().location.line}.`,
      this.peek().location,
      {
        kind: "ParserError",
        sourceCode: this.source,
        suggestion: "Each instruction in PLAIN should usually be on its own line."
      }
    );
  }
};

// src/runtime/interpreter.ts
var readline = __toESM(require("readline"));

// src/runtime/environment.ts
var Environment = class {
  variables = /* @__PURE__ */ new Map();
  parent;
  constructor(parent) {
    this.parent = parent;
  }
  define(name, value) {
    const key = name.toLowerCase();
    this.variables.set(key, value);
  }
  assign(name, value) {
    const key = name.toLowerCase();
    if (this.variables.has(key)) {
      this.variables.set(key, value);
      return;
    }
    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }
    this.variables.set(key, value);
  }
  lookup(name, location, sourceCode) {
    const key = name.toLowerCase();
    if (this.variables.has(key)) {
      return this.variables.get(key);
    }
    if (this.parent) {
      return this.parent.lookup(name, location, sourceCode);
    }
    const available = this.getAllVariableNames();
    const suggestion = this.findClosestMatch(name, available);
    const loc = location || { line: 1, column: 1 };
    throw new PlainError(
      `I couldn't find a variable or function named '${name}'.`,
      loc,
      {
        kind: "NameError",
        sourceCode,
        suggestion: suggestion ? `Did you mean '${suggestion}'?` : `Make sure '${name}' was created with 'set ${name} to ...' before using it.`
      }
    );
  }
  has(name) {
    const key = name.toLowerCase();
    if (this.variables.has(key)) return true;
    return this.parent ? this.parent.has(name) : false;
  }
  getAllVariableNames() {
    const names = /* @__PURE__ */ new Set();
    for (const key of this.variables.keys()) {
      names.add(key);
    }
    if (this.parent) {
      for (const key of this.parent.getAllVariableNames()) {
        names.add(key);
      }
    }
    return Array.from(names);
  }
  findClosestMatch(target, candidates) {
    const t = target.toLowerCase();
    let bestMatch;
    let minDistance = 3;
    for (const candidate of candidates) {
      const dist = this.levenshtein(t, candidate);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = candidate;
      }
    }
    return bestMatch;
  }
  levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
};

// src/runtime/values.ts
function isPlainFunction(val) {
  return typeof val === "object" && val !== null && val.type === "function";
}
function plainToString(value) {
  if (value === null || value === void 0) {
    return "nothing";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) return String(value);
    return String(Math.round(value * 1e10) / 1e10);
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    const items = value.map((v) => {
      if (typeof v === "string") return `"${v}"`;
      return plainToString(v);
    });
    return `[${items.join(", ")}]`;
  }
  if (isPlainFunction(value)) {
    return `<function ${value.name}>`;
  }
  return String(value);
}
function plainToBoolean(value) {
  if (value === null || value === void 0) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// src/builtins/math.ts
var mathBuiltins = {
  to_number: (val) => {
    if (typeof val === "number") return val;
    if (typeof val === "boolean") return val ? 1 : 0;
    const str = plainToString(val).trim();
    const num = Number(str);
    if (isNaN(num) || str === "") {
      throw new PlainError(
        `I cannot convert "${str}" into a number.`,
        { line: 1, column: 1 },
        {
          kind: "TypeError",
          suggestion: "Make sure the text contains only digits (for example, '42' or '3.14')."
        }
      );
    }
    return num;
  },
  to_text: (val) => {
    return plainToString(val);
  },
  round: (num) => {
    return Math.round(mathBuiltins.to_number(num));
  },
  floor: (num) => {
    return Math.floor(mathBuiltins.to_number(num));
  },
  ceiling: (num) => {
    return Math.ceil(mathBuiltins.to_number(num));
  },
  absolute: (num) => {
    return Math.abs(mathBuiltins.to_number(num));
  },
  minimum: (...args) => {
    if (args.length === 0) {
      throw new PlainError("minimum(...) requires at least one number.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const numbers = args.map((a) => mathBuiltins.to_number(a));
    return Math.min(...numbers);
  },
  maximum: (...args) => {
    if (args.length === 0) {
      throw new PlainError("maximum(...) requires at least one number.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const numbers = args.map((a) => mathBuiltins.to_number(a));
    return Math.max(...numbers);
  },
  random_between: (minVal, maxVal) => {
    const min = Math.ceil(mathBuiltins.to_number(minVal));
    const max = Math.floor(mathBuiltins.to_number(maxVal));
    if (min > max) {
      return Math.floor(Math.random() * (min - max + 1)) + max;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  // Powers and Roots
  square: (n) => {
    const num = mathBuiltins.to_number(n);
    return num * num;
  },
  cube: (n) => {
    const num = mathBuiltins.to_number(n);
    return num * num * num;
  },
  square_root: (n) => {
    const num = mathBuiltins.to_number(n);
    if (num < 0) {
      throw new PlainError("Cannot take the square root of a negative number.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return Math.sqrt(num);
  },
  cube_root: (n) => {
    return Math.cbrt(mathBuiltins.to_number(n));
  },
  power: (baseVal, expVal) => {
    return Math.pow(mathBuiltins.to_number(baseVal), mathBuiltins.to_number(expVal));
  },
  // Arithmetic Utilities
  factorial: (n) => {
    const num = Math.round(mathBuiltins.to_number(n));
    if (num < 0) throw new PlainError("Factorial is not defined for negative numbers.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    if (num > 170) throw new PlainError("Number is too large for factorial calculation.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    let res = 1;
    for (let i = 2; i <= num; i++) res *= i;
    return res;
  },
  gcd: (aVal, bVal) => {
    let a = Math.abs(Math.round(mathBuiltins.to_number(aVal)));
    let b = Math.abs(Math.round(mathBuiltins.to_number(bVal)));
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  },
  lcm: (aVal, bVal) => {
    const a = Math.abs(Math.round(mathBuiltins.to_number(aVal)));
    const b = Math.abs(Math.round(mathBuiltins.to_number(bVal)));
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / mathBuiltins.gcd(a, b);
  },
  is_prime: (nVal) => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  },
  next_prime: (nVal) => {
    let n = Math.round(mathBuiltins.to_number(nVal)) + 1;
    while (!mathBuiltins.is_prime(n)) {
      n++;
    }
    return n;
  },
  primes_up_to: (limitVal) => {
    const limit = Math.round(mathBuiltins.to_number(limitVal));
    const primes = [];
    for (let i = 2; i <= limit; i++) {
      if (mathBuiltins.is_prime(i)) primes.push(i);
    }
    return primes;
  },
  factors: (nVal) => {
    const n = Math.abs(Math.round(mathBuiltins.to_number(nVal)));
    const res = [];
    for (let i = 1; i <= n; i++) {
      if (n % i === 0) res.push(i);
    }
    return res;
  },
  is_even: (nVal) => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    return n % 2 === 0;
  },
  is_odd: (nVal) => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    return n % 2 !== 0;
  },
  sign: (nVal) => {
    const n = mathBuiltins.to_number(nVal);
    return Math.sign(n);
  },
  clamp: (val, minVal, maxVal) => {
    const v = mathBuiltins.to_number(val);
    const min = mathBuiltins.to_number(minVal);
    const max = mathBuiltins.to_number(maxVal);
    return Math.min(Math.max(v, min), max);
  },
  percentage: (partVal, totalVal) => {
    const total = mathBuiltins.to_number(totalVal);
    if (total === 0) throw new PlainError("Cannot calculate percentage of a total of zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(partVal) / total * 100;
  },
  percent_change: (oldVal, newVal) => {
    const oldV = mathBuiltins.to_number(oldVal);
    if (oldV === 0) throw new PlainError("Initial value cannot be zero for percent change.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return (mathBuiltins.to_number(newVal) - oldV) / oldV * 100;
  },
  // Trigonometry (takes degrees for student simplicity, or standard rad)
  sine: (degVal) => {
    const rad = mathBuiltins.to_number(degVal) * Math.PI / 180;
    return Math.sin(rad);
  },
  cosine: (degVal) => {
    const rad = mathBuiltins.to_number(degVal) * Math.PI / 180;
    return Math.cos(rad);
  },
  tangent: (degVal) => {
    const rad = mathBuiltins.to_number(degVal) * Math.PI / 180;
    return Math.tan(rad);
  },
  arcsine: (val) => {
    const n = mathBuiltins.to_number(val);
    return Math.asin(n) * 180 / Math.PI;
  },
  arccosine: (val) => {
    const n = mathBuiltins.to_number(val);
    return Math.acos(n) * 180 / Math.PI;
  },
  arctangent: (val) => {
    const n = mathBuiltins.to_number(val);
    return Math.atan(n) * 180 / Math.PI;
  },
  to_degrees: (radVal) => {
    return mathBuiltins.to_number(radVal) * 180 / Math.PI;
  },
  to_radians: (degVal) => {
    return mathBuiltins.to_number(degVal) * Math.PI / 180;
  },
  // Logarithms & Exponentials
  log: (nVal) => {
    const n = mathBuiltins.to_number(nVal);
    if (n <= 0) throw new PlainError("Logarithm is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return Math.log(n);
  },
  log10: (nVal) => {
    const n = mathBuiltins.to_number(nVal);
    if (n <= 0) throw new PlainError("Logarithm base 10 is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return Math.log10(n);
  },
  log2: (nVal) => {
    const n = mathBuiltins.to_number(nVal);
    if (n <= 0) throw new PlainError("Logarithm base 2 is only defined for numbers greater than 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return Math.log2(n);
  },
  exp: (nVal) => {
    return Math.exp(mathBuiltins.to_number(nVal));
  },
  pi: () => Math.PI,
  euler_e: () => Math.E,
  // Financial / Student Math
  simple_interest: (principalVal, ratePercentVal, timeYearsVal) => {
    const p = mathBuiltins.to_number(principalVal);
    const r = mathBuiltins.to_number(ratePercentVal) / 100;
    const t = mathBuiltins.to_number(timeYearsVal);
    return p * r * t;
  },
  compound_interest: (pVal, rVal, tVal, nVal) => {
    const p = mathBuiltins.to_number(pVal);
    const r = mathBuiltins.to_number(rVal) / 100;
    const t = mathBuiltins.to_number(tVal);
    const n = nVal ? mathBuiltins.to_number(nVal) : 1;
    return p * Math.pow(1 + r / n, n * t) - p;
  },
  permutations: (nVal, rVal) => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    const r = Math.round(mathBuiltins.to_number(rVal));
    if (r < 0 || r > n) return 0;
    return mathBuiltins.factorial(n) / mathBuiltins.factorial(n - r);
  },
  combinations: (nVal, rVal) => {
    const n = Math.round(mathBuiltins.to_number(nVal));
    const r = Math.round(mathBuiltins.to_number(rVal));
    if (r < 0 || r > n) return 0;
    return mathBuiltins.factorial(n) / (mathBuiltins.factorial(r) * mathBuiltins.factorial(n - r));
  },
  quadratic_roots: (aVal, bVal, cVal) => {
    const a = mathBuiltins.to_number(aVal);
    const b = mathBuiltins.to_number(bVal);
    const c = mathBuiltins.to_number(cVal);
    if (a === 0) throw new PlainError("In ax^2 + bx + c = 0, 'a' cannot be 0.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const disc = b * b - 4 * a * c;
    if (disc < 0) return [];
    if (disc === 0) return [-b / (2 * a)];
    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
    return [r1, r2];
  }
};

// src/builtins/list.ts
function ensureList(val, fnName) {
  if (!Array.isArray(val)) {
    throw new PlainError(
      `'${fnName}' expects a list, but received a ${typeof val}.`,
      { line: 1, column: 1 },
      {
        kind: "TypeError",
        suggestion: "Create a list using square brackets, like: set my_list to [1, 2, 3]"
      }
    );
  }
  return val;
}
var listBuiltins = {
  count: (val) => {
    if (Array.isArray(val)) return val.length;
    if (typeof val === "string") return val.length;
    return 1;
  },
  first: (val) => {
    const list = ensureList(val, "first");
    if (list.length === 0) {
      throw new PlainError("I cannot get the first item because the list is empty.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return list[0];
  },
  last: (val) => {
    const list = ensureList(val, "last");
    if (list.length === 0) {
      throw new PlainError("I cannot get the last item because the list is empty.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return list[list.length - 1];
  },
  item_of: (indexVal, listVal) => {
    const list = ensureList(listVal, "item ... of");
    const index = mathBuiltins.to_number(indexVal);
    if (!Number.isInteger(index) || index < 1 || index > list.length) {
      throw new PlainError(
        `List item ${index} is out of range. The list contains ${list.length} item${list.length === 1 ? "" : "s"}.`,
        { line: 1, column: 1 },
        { kind: "RuntimeError", suggestion: "Remember that PLAIN uses 1-based indexing: item 1 is the first item." }
      );
    }
    return list[index - 1];
  },
  sort: (val) => {
    const list = [...ensureList(val, "sort")];
    return list.sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
      return plainToString(a).localeCompare(plainToString(b));
    });
  },
  reverse: (val) => {
    const list = [...ensureList(val, "reverse")];
    return list.reverse();
  },
  sum: (val) => {
    const list = ensureList(val, "sum");
    let total = 0;
    for (const item of list) {
      total += mathBuiltins.to_number(item);
    }
    return total;
  },
  average: (val) => {
    const list = ensureList(val, "average");
    if (list.length === 0) {
      throw new PlainError("I cannot calculate the average of an empty list.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return listBuiltins.sum(list) / list.length;
  },
  highest: (val) => {
    const list = ensureList(val, "highest");
    if (list.length === 0) {
      throw new PlainError("I cannot find the highest item because the list is empty.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const numbers = list.map((item) => mathBuiltins.to_number(item));
    return Math.max(...numbers);
  },
  lowest: (val) => {
    const list = ensureList(val, "lowest");
    if (list.length === 0) {
      throw new PlainError("I cannot find the lowest item because the list is empty.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const numbers = list.map((item) => mathBuiltins.to_number(item));
    return Math.min(...numbers);
  },
  unique: (val) => {
    const list = ensureList(val, "unique");
    const seen = /* @__PURE__ */ new Set();
    const res = [];
    for (const item of list) {
      const k = typeof item + ":" + plainToString(item);
      if (!seen.has(k)) {
        seen.add(k);
        res.push(item);
      }
    }
    return res;
  },
  shuffle: (val) => {
    const list = [...ensureList(val, "shuffle")];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  },
  sample: (val) => {
    const list = ensureList(val, "sample");
    if (list.length === 0) return null;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  },
  take: (val, countVal) => {
    const list = ensureList(val, "take");
    const count = Math.max(0, Math.round(mathBuiltins.to_number(countVal)));
    return list.slice(0, count);
  },
  drop: (val, countVal) => {
    const list = ensureList(val, "drop");
    const count = Math.max(0, Math.round(mathBuiltins.to_number(countVal)));
    return list.slice(count);
  },
  flatten: (val) => {
    const list = ensureList(val, "flatten");
    const res = [];
    for (const item of list) {
      if (Array.isArray(item)) {
        res.push(...item);
      } else {
        res.push(item);
      }
    }
    return res;
  },
  chunk: (val, sizeVal) => {
    const list = ensureList(val, "chunk");
    const size = Math.max(1, Math.round(mathBuiltins.to_number(sizeVal)));
    const res = [];
    for (let i = 0; i < list.length; i += size) {
      res.push(list.slice(i, i + size));
    }
    return res;
  },
  intersection: (listAVal, listBVal) => {
    const a = ensureList(listAVal, "intersection");
    const b = ensureList(listBVal, "intersection");
    return a.filter((itemA) => b.some((itemB) => plainToString(itemA) === plainToString(itemB)));
  },
  union: (listAVal, listBVal) => {
    const a = ensureList(listAVal, "union");
    const b = ensureList(listBVal, "union");
    return listBuiltins.unique([...a, ...b]);
  },
  difference: (listAVal, listBVal) => {
    const a = ensureList(listAVal, "difference");
    const b = ensureList(listBVal, "difference");
    return a.filter((itemA) => !b.some((itemB) => plainToString(itemA) === plainToString(itemB)));
  },
  zip: (listAVal, listBVal) => {
    const a = ensureList(listAVal, "zip");
    const b = ensureList(listBVal, "zip");
    const minLen = Math.min(a.length, b.length);
    const res = [];
    for (let i = 0; i < minLen; i++) {
      res.push([a[i], b[i]]);
    }
    return res;
  },
  find_index: (listVal, itemVal) => {
    const list = ensureList(listVal, "find_index");
    for (let i = 0; i < list.length; i++) {
      if (list[i] === itemVal || plainToString(list[i]) === plainToString(itemVal)) {
        return i + 1;
      }
    }
    return 0;
  },
  slice_list: (listVal, startVal, endVal) => {
    const list = ensureList(listVal, "slice_list");
    const start = Math.max(0, mathBuiltins.to_number(startVal) - 1);
    if (endVal !== void 0) {
      const end = mathBuiltins.to_number(endVal);
      return list.slice(start, end);
    }
    return list.slice(start);
  },
  insert_at: (listVal, indexVal, itemVal) => {
    const list = [...ensureList(listVal, "insert_at")];
    const idx = Math.max(0, Math.min(list.length, mathBuiltins.to_number(indexVal) - 1));
    list.splice(idx, 0, itemVal);
    return list;
  },
  is_empty: (val) => {
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === "string") return val.length === 0;
    return val === null || val === void 0;
  },
  is_sorted: (val) => {
    const list = ensureList(val, "is_sorted");
    for (let i = 0; i < list.length - 1; i++) {
      if (typeof list[i] === "number" && typeof list[i + 1] === "number") {
        if (list[i] > list[i + 1]) return false;
      } else {
        if (plainToString(list[i]).localeCompare(plainToString(list[i + 1])) > 0) return false;
      }
    }
    return true;
  },
  fill_list: (val, countVal) => {
    const count = Math.max(0, Math.round(mathBuiltins.to_number(countVal)));
    return new Array(count).fill(val);
  },
  range_list: (startVal, endVal, stepVal) => {
    const start = mathBuiltins.to_number(startVal);
    const end = mathBuiltins.to_number(endVal);
    const step = stepVal ? mathBuiltins.to_number(stepVal) : start <= end ? 1 : -1;
    if (step === 0) throw new PlainError("Step cannot be zero in range.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const res = [];
    if (step > 0) {
      for (let i = start; i <= end; i += step) res.push(i);
    } else {
      for (let i = start; i >= end; i += step) res.push(i);
    }
    return res;
  }
};

// src/builtins/time.ts
var MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
var DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
function parseDateOrThrow(val) {
  const str = plainToString(val);
  const d = new Date(str);
  if (isNaN(d.getTime())) {
    throw new PlainError(
      `Invalid date format '${str}'. Use 'YYYY-MM-DD' (e.g. '2026-05-15').`,
      { line: 1, column: 1 },
      { kind: "TypeError", suggestion: "Provide a date like '2026-11-12' or '2026-01-01'." }
    );
  }
  return d;
}
function formatDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
var timeBuiltins = {
  today: () => {
    return formatDateString(/* @__PURE__ */ new Date());
  },
  current_time: () => {
    const now = /* @__PURE__ */ new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  },
  current_year: () => {
    return (/* @__PURE__ */ new Date()).getFullYear();
  },
  current_month: () => {
    return (/* @__PURE__ */ new Date()).getMonth() + 1;
  },
  current_month_name: () => {
    return MONTH_NAMES[(/* @__PURE__ */ new Date()).getMonth()];
  },
  current_day: () => {
    return (/* @__PURE__ */ new Date()).getDate();
  },
  current_hour: () => {
    return (/* @__PURE__ */ new Date()).getHours();
  },
  current_minute: () => {
    return (/* @__PURE__ */ new Date()).getMinutes();
  },
  current_second: () => {
    return (/* @__PURE__ */ new Date()).getSeconds();
  },
  timestamp: () => {
    return Date.now();
  },
  day_of_week: (dateVal) => {
    const d = dateVal !== void 0 ? parseDateOrThrow(dateVal) : /* @__PURE__ */ new Date();
    return DAY_NAMES[d.getDay()];
  },
  is_leap_year: (yearVal) => {
    const y = yearVal !== void 0 ? mathBuiltins.to_number(yearVal) : (/* @__PURE__ */ new Date()).getFullYear();
    return y % 4 === 0 && y % 100 !== 0 || y % 400 === 0;
  },
  days_in_month: (yearVal, monthVal) => {
    const y = mathBuiltins.to_number(yearVal);
    const m = mathBuiltins.to_number(monthVal);
    if (m < 1 || m > 12) {
      throw new PlainError(`Month must be between 1 and 12, got ${m}.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return new Date(y, m, 0).getDate();
  },
  days_between: (d1Val, d2Val) => {
    const date1 = parseDateOrThrow(d1Val);
    const date2 = parseDateOrThrow(d2Val);
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.round(diffMs / (1e3 * 60 * 60 * 24));
  },
  add_days: (dateVal, daysVal) => {
    const d = parseDateOrThrow(dateVal);
    const days = mathBuiltins.to_number(daysVal);
    d.setDate(d.getDate() + days);
    return formatDateString(d);
  },
  format_date: (dateVal, formatVal) => {
    const d = parseDateOrThrow(dateVal);
    const fmt = plainToString(formatVal);
    const y = String(d.getFullYear());
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    const s = String(d.getSeconds()).padStart(2, "0");
    return fmt.replace(/YYYY/g, y).replace(/MM/g, m).replace(/DD/g, day).replace(/hh/g, h).replace(/mm/g, min).replace(/ss/g, s);
  },
  sleep: async (secondsVal) => {
    const sec = mathBuiltins.to_number(secondsVal);
    const ms = Math.max(0, sec * 1e3);
    return new Promise((resolve6) => setTimeout(resolve6, ms));
  }
};

// src/builtins/text.ts
var textBuiltins = {
  join: (...args) => {
    return args.map((a) => plainToString(a)).join("");
  },
  uppercase: (val) => {
    return plainToString(val).toUpperCase();
  },
  lowercase: (val) => {
    return plainToString(val).toLowerCase();
  },
  length: (val) => {
    if (typeof val === "string") return val.length;
    if (Array.isArray(val)) return val.length;
    if (typeof val === "number") return String(val).length;
    return plainToString(val).length;
  },
  contains: (target, part) => {
    if (Array.isArray(target)) {
      return target.some((item) => item === part || plainToString(item) === plainToString(part));
    }
    const str = plainToString(target);
    const search = plainToString(part);
    return str.includes(search);
  },
  replace: (target, oldPart, newPart) => {
    const str = plainToString(target);
    const sOld = plainToString(oldPart);
    const sNew = plainToString(newPart);
    return str.split(sOld).join(sNew);
  },
  trim: (target) => {
    return plainToString(target).trim();
  },
  starts_with: (target, part) => {
    return plainToString(target).startsWith(plainToString(part));
  },
  ends_with: (target, part) => {
    return plainToString(target).endsWith(plainToString(part));
  },
  reverse_text: (target) => {
    return plainToString(target).split("").reverse().join("");
  },
  title_case: (target) => {
    return plainToString(target).replace(/\b\w/g, (c) => c.toUpperCase());
  },
  camel_case: (target) => {
    const str = plainToString(target);
    return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : "").replace(/^(.)/, (c) => c.toLowerCase());
  },
  snake_case: (target) => {
    return plainToString(target).replace(/\W+/g, " ").split(/ |\B(?=[A-Z])/).map((w) => w.toLowerCase()).join("_");
  },
  kebab_case: (target) => {
    return plainToString(target).replace(/\W+/g, " ").split(/ |\B(?=[A-Z])/).map((w) => w.toLowerCase()).join("-");
  },
  word_count: (target) => {
    const str = plainToString(target).trim();
    if (str === "") return 0;
    return str.split(/\s+/).length;
  },
  line_count: (target) => {
    const str = plainToString(target);
    if (str === "") return 0;
    return str.split(/\r?\n/).length;
  },
  char_count: (target, charVal) => {
    const str = plainToString(target);
    const ch = plainToString(charVal);
    let count = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === ch) count++;
    }
    return count;
  },
  pad_start: (target, lenVal, padVal) => {
    const str = plainToString(target);
    const targetLen = mathBuiltins.to_number(lenVal);
    const pad = padVal ? plainToString(padVal) : " ";
    return str.padStart(targetLen, pad);
  },
  pad_end: (target, lenVal, padVal) => {
    const str = plainToString(target);
    const targetLen = mathBuiltins.to_number(lenVal);
    const pad = padVal ? plainToString(padVal) : " ";
    return str.padEnd(targetLen, pad);
  },
  repeat_text: (target, timesVal) => {
    const count = Math.max(0, Math.round(mathBuiltins.to_number(timesVal)));
    return plainToString(target).repeat(count);
  },
  is_digit: (target) => {
    const str = plainToString(target).trim();
    return str.length > 0 && /^\d+$/.test(str);
  },
  is_alpha: (target) => {
    const str = plainToString(target);
    return str.length > 0 && /^[a-zA-Z]+$/.test(str);
  },
  is_alphanumeric: (target) => {
    const str = plainToString(target);
    return str.length > 0 && /^[a-zA-Z0-9]+$/.test(str);
  },
  is_uppercase: (target) => {
    const str = plainToString(target);
    return str === str.toUpperCase() && str !== str.toLowerCase();
  },
  is_lowercase: (target) => {
    const str = plainToString(target);
    return str === str.toLowerCase() && str !== str.toUpperCase();
  },
  is_palindrome: (target) => {
    const clean = plainToString(target).toLowerCase().replace(/[^a-z0-9]/g, "");
    const rev = clean.split("").reverse().join("");
    return clean.length > 0 && clean === rev;
  },
  count_vowels: (target) => {
    const str = plainToString(target).toLowerCase();
    let count = 0;
    const vowels = /* @__PURE__ */ new Set(["a", "e", "i", "o", "u"]);
    for (const c of str) {
      if (vowels.has(c)) count++;
    }
    return count;
  },
  count_consonants: (target) => {
    const str = plainToString(target).toLowerCase();
    let count = 0;
    for (const c of str) {
      if (c >= "a" && c <= "z" && !"aeiou".includes(c)) count++;
    }
    return count;
  },
  words: (target) => {
    const str = plainToString(target).trim();
    if (str === "") return [];
    return str.split(/\s+/);
  },
  lines: (target) => {
    const str = plainToString(target);
    return str.split(/\r?\n/);
  },
  split_text: (target, delimiterVal) => {
    return plainToString(target).split(plainToString(delimiterVal));
  },
  slice_text: (target, startVal, endVal) => {
    const str = plainToString(target);
    const start = Math.max(0, mathBuiltins.to_number(startVal) - 1);
    if (endVal !== void 0) {
      const end = mathBuiltins.to_number(endVal);
      return str.slice(start, end);
    }
    return str.slice(start);
  },
  caesar_cipher: (target, shiftVal) => {
    const str = plainToString(target);
    let shift = Math.round(mathBuiltins.to_number(shiftVal)) % 26;
    if (shift < 0) shift += 26;
    let res = "";
    for (const c of str) {
      if (c >= "a" && c <= "z") {
        res += String.fromCharCode((c.charCodeAt(0) - 97 + shift) % 26 + 97);
      } else if (c >= "A" && c <= "Z") {
        res += String.fromCharCode((c.charCodeAt(0) - 65 + shift) % 26 + 65);
      } else {
        res += c;
      }
    }
    return res;
  },
  base64_encode: (target) => {
    return Buffer.from(plainToString(target), "utf-8").toString("base64");
  },
  base64_decode: (target) => {
    return Buffer.from(plainToString(target), "base64").toString("utf-8");
  },
  slugify: (target) => {
    return plainToString(target).toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
  }
};

// src/builtins/geometry.ts
var geometryBuiltins = {
  hypotenuse: (aVal, bVal) => {
    const a = mathBuiltins.to_number(aVal);
    const b = mathBuiltins.to_number(bVal);
    return Math.sqrt(a * a + b * b);
  },
  distance_2d: (x1, y1, x2, y2) => {
    const dx = mathBuiltins.to_number(x2) - mathBuiltins.to_number(x1);
    const dy = mathBuiltins.to_number(y2) - mathBuiltins.to_number(y1);
    return Math.sqrt(dx * dx + dy * dy);
  },
  distance_3d: (x1, y1, z1, x2, y2, z2) => {
    const dx = mathBuiltins.to_number(x2) - mathBuiltins.to_number(x1);
    const dy = mathBuiltins.to_number(y2) - mathBuiltins.to_number(y1);
    const dz = mathBuiltins.to_number(z2) - mathBuiltins.to_number(z1);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },
  area_circle: (radiusVal) => {
    const r = mathBuiltins.to_number(radiusVal);
    return Math.PI * r * r;
  },
  circumference_circle: (radiusVal) => {
    const r = mathBuiltins.to_number(radiusVal);
    return 2 * Math.PI * r;
  },
  area_triangle: (baseVal, heightVal) => {
    return 0.5 * mathBuiltins.to_number(baseVal) * mathBuiltins.to_number(heightVal);
  },
  area_rectangle: (lengthVal, widthVal) => {
    return mathBuiltins.to_number(lengthVal) * mathBuiltins.to_number(widthVal);
  },
  perimeter_rectangle: (lengthVal, widthVal) => {
    return 2 * (mathBuiltins.to_number(lengthVal) + mathBuiltins.to_number(widthVal));
  },
  area_trapezoid: (base1Val, base2Val, heightVal) => {
    const b1 = mathBuiltins.to_number(base1Val);
    const b2 = mathBuiltins.to_number(base2Val);
    const h = mathBuiltins.to_number(heightVal);
    return 0.5 * (b1 + b2) * h;
  },
  volume_cube: (sideVal) => {
    const s = mathBuiltins.to_number(sideVal);
    return s * s * s;
  },
  volume_sphere: (radiusVal) => {
    const r = mathBuiltins.to_number(radiusVal);
    return 4 / 3 * Math.PI * Math.pow(r, 3);
  },
  surface_area_sphere: (radiusVal) => {
    const r = mathBuiltins.to_number(radiusVal);
    return 4 * Math.PI * r * r;
  },
  volume_cylinder: (radiusVal, heightVal) => {
    const r = mathBuiltins.to_number(radiusVal);
    const h = mathBuiltins.to_number(heightVal);
    return Math.PI * r * r * h;
  },
  surface_area_cylinder: (radiusVal, heightVal) => {
    const r = mathBuiltins.to_number(radiusVal);
    const h = mathBuiltins.to_number(heightVal);
    return 2 * Math.PI * r * h + 2 * Math.PI * r * r;
  },
  volume_cone: (radiusVal, heightVal) => {
    const r = mathBuiltins.to_number(radiusVal);
    const h = mathBuiltins.to_number(heightVal);
    return 1 / 3 * Math.PI * r * r * h;
  }
};

// src/builtins/stats.ts
function getNumericArray(val, fnName) {
  if (!Array.isArray(val)) {
    throw new PlainError(`'${fnName}' expects a list of numbers.`, { line: 1, column: 1 }, { kind: "TypeError" });
  }
  if (val.length === 0) {
    throw new PlainError(`'${fnName}' cannot be calculated on an empty list.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
  }
  return val.map((v) => mathBuiltins.to_number(v));
}
var statsBuiltins = {
  mean: (listVal) => {
    const arr = getNumericArray(listVal, "mean");
    const sum = arr.reduce((acc, v) => acc + v, 0);
    return sum / arr.length;
  },
  median: (listVal) => {
    const arr = [...getNumericArray(listVal, "median")].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2 !== 0) return arr[mid];
    return (arr[mid - 1] + arr[mid]) / 2;
  },
  mode: (listVal) => {
    if (!Array.isArray(listVal) || listVal.length === 0) {
      throw new PlainError("'mode' expects a non-empty list.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const freq = {};
    let maxCount = 0;
    let modeVal = listVal[0];
    for (const item of listVal) {
      const key = plainToString(item);
      if (!freq[key]) freq[key] = { item, count: 0 };
      freq[key].count++;
      if (freq[key].count > maxCount) {
        maxCount = freq[key].count;
        modeVal = item;
      }
    }
    return modeVal;
  },
  range_of: (listVal) => {
    const arr = getNumericArray(listVal, "range_of");
    return Math.max(...arr) - Math.min(...arr);
  },
  variance: (listVal) => {
    const arr = getNumericArray(listVal, "variance");
    const avg = statsBuiltins.mean(arr);
    const sumSqDiff = arr.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0);
    return sumSqDiff / arr.length;
  },
  standard_deviation: (listVal) => {
    return Math.sqrt(statsBuiltins.variance(listVal));
  },
  z_score: (valueVal, meanVal, stdevVal) => {
    const v = mathBuiltins.to_number(valueVal);
    const m = mathBuiltins.to_number(meanVal);
    const s = mathBuiltins.to_number(stdevVal);
    if (s === 0) throw new PlainError("Standard deviation cannot be zero for z-score.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return (v - m) / s;
  },
  percentile: (listVal, pVal) => {
    const arr = [...getNumericArray(listVal, "percentile")].sort((a, b) => a - b);
    const p = mathBuiltins.to_number(pVal);
    if (p < 0 || p > 100) throw new PlainError("Percentile must be between 0 and 100.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const idx = p / 100 * (arr.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return arr[lower];
    return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
  },
  quartiles: (listVal) => {
    return [
      statsBuiltins.percentile(listVal, 25),
      statsBuiltins.percentile(listVal, 50),
      statsBuiltins.percentile(listVal, 75)
    ];
  },
  iqr: (listVal) => {
    const q1 = statsBuiltins.percentile(listVal, 25);
    const q3 = statsBuiltins.percentile(listVal, 75);
    return q3 - q1;
  },
  frequency_table: (listVal) => {
    if (!Array.isArray(listVal)) throw new PlainError("'frequency_table' expects a list.", { line: 1, column: 1 }, { kind: "TypeError" });
    const table = {};
    for (const item of listVal) {
      const k = plainToString(item);
      table[k] = (table[k] || 0) + 1;
    }
    return table;
  },
  covariance: (listAVal, listBVal) => {
    const a = getNumericArray(listAVal, "covariance");
    const b = getNumericArray(listBVal, "covariance");
    if (a.length !== b.length) throw new PlainError("Lists must have equal lengths for covariance.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const meanA = statsBuiltins.mean(a);
    const meanB = statsBuiltins.mean(b);
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - meanA) * (b[i] - meanB);
    }
    return sum / a.length;
  },
  correlation: (listAVal, listBVal) => {
    const cov = statsBuiltins.covariance(listAVal, listBVal);
    const stdevA = statsBuiltins.standard_deviation(listAVal);
    const stdevB = statsBuiltins.standard_deviation(listBVal);
    if (stdevA === 0 || stdevB === 0) return 0;
    return cov / (stdevA * stdevB);
  },
  linear_regression: (xListVal, yListVal) => {
    const x = getNumericArray(xListVal, "linear_regression");
    const y = getNumericArray(yListVal, "linear_regression");
    if (x.length !== y.length) throw new PlainError("Lists must have equal lengths for linear regression.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const meanX = statsBuiltins.mean(x);
    const meanY = statsBuiltins.mean(y);
    let num = 0;
    let den = 0;
    for (let i = 0; i < x.length; i++) {
      num += (x[i] - meanX) * (y[i] - meanY);
      den += Math.pow(x[i] - meanX, 2);
    }
    if (den === 0) throw new PlainError("Denominator in linear regression is zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const slope = num / den;
    const intercept = meanY - slope * meanX;
    return { slope, intercept };
  },
  cumulative_sum: (listVal) => {
    const arr = getNumericArray(listVal, "cumulative_sum");
    const res = [];
    let cur = 0;
    for (const v of arr) {
      cur += v;
      res.push(cur);
    }
    return res;
  },
  product_of: (listVal) => {
    const arr = getNumericArray(listVal, "product_of");
    return arr.reduce((acc, v) => acc * v, 1);
  }
};

// src/builtins/science.ts
var PERIODIC_TABLE = {
  H: { number: 1, name: "Hydrogen", mass: 1.008 },
  HE: { number: 2, name: "Helium", mass: 4.0026 },
  LI: { number: 3, name: "Lithium", mass: 6.94 },
  BE: { number: 4, name: "Beryllium", mass: 9.0122 },
  B: { number: 5, name: "Boron", mass: 10.81 },
  C: { number: 6, name: "Carbon", mass: 12.011 },
  N: { number: 7, name: "Nitrogen", mass: 14.007 },
  O: { number: 8, name: "Oxygen", mass: 15.999 },
  F: { number: 9, name: "Fluorine", mass: 18.998 },
  NE: { number: 10, name: "Neon", mass: 20.18 },
  NA: { number: 11, name: "Sodium", mass: 22.99 },
  MG: { number: 12, name: "Magnesium", mass: 24.305 },
  AL: { number: 13, name: "Aluminium", mass: 26.982 },
  SI: { number: 14, name: "Silicon", mass: 28.085 },
  P: { number: 15, name: "Phosphorus", mass: 30.974 },
  S: { number: 16, name: "Sulfur", mass: 32.06 },
  CL: { number: 17, name: "Chlorine", mass: 35.45 },
  AR: { number: 18, name: "Argon", mass: 39.948 },
  K: { number: 19, name: "Potassium", mass: 39.098 },
  CA: { number: 20, name: "Calcium", mass: 40.078 },
  TI: { number: 22, name: "Titanium", mass: 47.867 },
  CR: { number: 24, name: "Chromium", mass: 51.996 },
  MN: { number: 25, name: "Manganese", mass: 54.938 },
  FE: { number: 26, name: "Iron", mass: 55.845 },
  CO: { number: 27, name: "Cobalt", mass: 58.933 },
  NI: { number: 28, name: "Nickel", mass: 58.693 },
  CU: { number: 29, name: "Copper", mass: 63.546 },
  ZN: { number: 30, name: "Zinc", mass: 65.38 },
  BR: { number: 35, name: "Bromine", mass: 79.904 },
  AG: { number: 47, name: "Silver", mass: 107.87 },
  SN: { number: 50, name: "Tin", mass: 118.71 },
  I: { number: 53, name: "Iodine", mass: 126.9 },
  PT: { number: 78, name: "Platinum", mass: 195.08 },
  AU: { number: 79, name: "Gold", mass: 196.97 },
  HG: { number: 80, name: "Mercury", mass: 200.59 },
  PB: { number: 82, name: "Lead", mass: 207.2 },
  U: { number: 92, name: "Uranium", mass: 238.03 }
};
function lookupElement(queryVal) {
  const query = plainToString(queryVal).trim().toUpperCase();
  if (PERIODIC_TABLE[query]) return PERIODIC_TABLE[query];
  for (const sym of Object.keys(PERIODIC_TABLE)) {
    if (PERIODIC_TABLE[sym].name.toUpperCase() === query) {
      return PERIODIC_TABLE[sym];
    }
  }
  throw new PlainError(`Element '${query}' not found in periodic table.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
}
var scienceBuiltins = {
  // Chemistry
  atomic_mass: (queryVal) => {
    return lookupElement(queryVal).mass;
  },
  atomic_number: (queryVal) => {
    return lookupElement(queryVal).number;
  },
  element_name: (queryVal) => {
    return lookupElement(queryVal).name;
  },
  density: (massVal, volumeVal) => {
    const v = mathBuiltins.to_number(volumeVal);
    if (v === 0) throw new PlainError("Volume cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(massVal) / v;
  },
  // Physics Formulas
  speed: (distanceVal, timeVal) => {
    const t = mathBuiltins.to_number(timeVal);
    if (t === 0) throw new PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(distanceVal) / t;
  },
  acceleration: (vInitVal, vFinalVal, timeVal) => {
    const t = mathBuiltins.to_number(timeVal);
    if (t === 0) throw new PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return (mathBuiltins.to_number(vFinalVal) - mathBuiltins.to_number(vInitVal)) / t;
  },
  force: (massVal, accelVal) => {
    return mathBuiltins.to_number(massVal) * mathBuiltins.to_number(accelVal);
  },
  momentum: (massVal, velocityVal) => {
    return mathBuiltins.to_number(massVal) * mathBuiltins.to_number(velocityVal);
  },
  kinetic_energy: (massVal, velocityVal) => {
    const v = mathBuiltins.to_number(velocityVal);
    return 0.5 * mathBuiltins.to_number(massVal) * v * v;
  },
  potential_energy: (massVal, heightVal, gVal) => {
    const g = gVal ? mathBuiltins.to_number(gVal) : 9.80665;
    return mathBuiltins.to_number(massVal) * g * mathBuiltins.to_number(heightVal);
  },
  work_done: (forceVal, distanceVal) => {
    return mathBuiltins.to_number(forceVal) * mathBuiltins.to_number(distanceVal);
  },
  power_watts: (workVal, timeVal) => {
    const t = mathBuiltins.to_number(timeVal);
    if (t === 0) throw new PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(workVal) / t;
  },
  ohms_voltage: (currentVal, resistanceVal) => {
    return mathBuiltins.to_number(currentVal) * mathBuiltins.to_number(resistanceVal);
  },
  ohms_current: (voltageVal, resistanceVal) => {
    const r = mathBuiltins.to_number(resistanceVal);
    if (r === 0) throw new PlainError("Resistance cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(voltageVal) / r;
  },
  ohms_resistance: (voltageVal, currentVal) => {
    const i = mathBuiltins.to_number(currentVal);
    if (i === 0) throw new PlainError("Current cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(voltageVal) / i;
  },
  electrical_power: (voltageVal, currentVal) => {
    return mathBuiltins.to_number(voltageVal) * mathBuiltins.to_number(currentVal);
  },
  free_fall_time: (heightVal, gVal) => {
    const h = mathBuiltins.to_number(heightVal);
    const g = gVal ? mathBuiltins.to_number(gVal) : 9.80665;
    if (h < 0) throw new PlainError("Height cannot be negative.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return Math.sqrt(2 * h / g);
  },
  projectile_range: (v0Val, angleDegVal, gVal) => {
    const v0 = mathBuiltins.to_number(v0Val);
    const rad = 2 * mathBuiltins.to_number(angleDegVal) * Math.PI / 180;
    const g = gVal ? mathBuiltins.to_number(gVal) : 9.80665;
    return v0 * v0 * Math.sin(rad) / g;
  }
};

// src/builtins/student.ts
var studentBuiltins = {
  // Grades & GPA
  letter_grade: (percentageVal) => {
    const score = mathBuiltins.to_number(percentageVal);
    if (score >= 97) return "A+";
    if (score >= 93) return "A";
    if (score >= 90) return "A-";
    if (score >= 87) return "B+";
    if (score >= 83) return "B";
    if (score >= 80) return "B-";
    if (score >= 77) return "C+";
    if (score >= 73) return "C";
    if (score >= 70) return "C-";
    if (score >= 67) return "D+";
    if (score >= 60) return "D";
    return "F";
  },
  gpa_from_percentage: (percentageVal) => {
    const score = mathBuiltins.to_number(percentageVal);
    if (score >= 93) return 4;
    if (score >= 90) return 3.7;
    if (score >= 87) return 3.3;
    if (score >= 83) return 3;
    if (score >= 80) return 2.7;
    if (score >= 77) return 2.3;
    if (score >= 73) return 2;
    if (score >= 70) return 1.7;
    if (score >= 67) return 1.3;
    if (score >= 60) return 1;
    return 0;
  },
  gpa_from_grades: (gradesListVal, creditsListVal) => {
    if (!Array.isArray(gradesListVal) || !Array.isArray(creditsListVal)) {
      throw new PlainError("'gpa_from_grades' expects two lists: grades and credits.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    if (gradesListVal.length !== creditsListVal.length || gradesListVal.length === 0) {
      throw new PlainError("Grade and credit lists must be non-empty and of equal length.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    let totalPoints = 0;
    let totalCredits = 0;
    for (let i = 0; i < gradesListVal.length; i++) {
      const g = mathBuiltins.to_number(gradesListVal[i]);
      const c = mathBuiltins.to_number(creditsListVal[i]);
      totalPoints += g * c;
      totalCredits += c;
    }
    if (totalCredits === 0) return 0;
    return Math.round(totalPoints / totalCredits * 100) / 100;
  },
  weighted_score: (scoresListVal, weightsListVal) => {
    if (!Array.isArray(scoresListVal) || !Array.isArray(weightsListVal)) {
      throw new PlainError("'weighted_score' expects two lists: scores and weights.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    if (scoresListVal.length !== weightsListVal.length || scoresListVal.length === 0) {
      throw new PlainError("Scores and weights lists must be non-empty and of equal length.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    let weightedSum = 0;
    let totalWeight = 0;
    for (let i = 0; i < scoresListVal.length; i++) {
      const s = mathBuiltins.to_number(scoresListVal[i]);
      const w = mathBuiltins.to_number(weightsListVal[i]);
      weightedSum += s * w;
      totalWeight += w;
    }
    if (totalWeight === 0) return 0;
    return weightedSum / totalWeight;
  },
  // Temperature Conversions
  celsius_to_fahrenheit: (cVal) => {
    return mathBuiltins.to_number(cVal) * 9 / 5 + 32;
  },
  fahrenheit_to_celsius: (fVal) => {
    return (mathBuiltins.to_number(fVal) - 32) * 5 / 9;
  },
  celsius_to_kelvin: (cVal) => {
    return mathBuiltins.to_number(cVal) + 273.15;
  },
  kelvin_to_celsius: (kVal) => {
    return mathBuiltins.to_number(kVal) - 273.15;
  },
  // Distance Conversions
  km_to_miles: (kmVal) => {
    return mathBuiltins.to_number(kmVal) * 0.621371;
  },
  miles_to_km: (milesVal) => {
    return mathBuiltins.to_number(milesVal) / 0.621371;
  },
  meters_to_feet: (mVal) => {
    return mathBuiltins.to_number(mVal) * 3.28084;
  },
  feet_to_meters: (ftVal) => {
    return mathBuiltins.to_number(ftVal) / 3.28084;
  },
  cm_to_inches: (cmVal) => {
    return mathBuiltins.to_number(cmVal) / 2.54;
  },
  inches_to_cm: (inVal) => {
    return mathBuiltins.to_number(inVal) * 2.54;
  },
  // Mass / Weight Conversions
  kg_to_pounds: (kgVal) => {
    return mathBuiltins.to_number(kgVal) * 2.20462;
  },
  pounds_to_kg: (lbsVal) => {
    return mathBuiltins.to_number(lbsVal) / 2.20462;
  },
  grams_to_ounces: (gVal) => {
    return mathBuiltins.to_number(gVal) / 28.3495;
  },
  ounces_to_grams: (ozVal) => {
    return mathBuiltins.to_number(ozVal) * 28.3495;
  },
  // Volume Conversions
  liters_to_gallons: (lVal) => {
    return mathBuiltins.to_number(lVal) * 0.264172;
  },
  gallons_to_liters: (galVal) => {
    return mathBuiltins.to_number(galVal) / 0.264172;
  },
  // Time unit conversions
  hours_to_minutes: (hVal) => {
    return mathBuiltins.to_number(hVal) * 60;
  },
  minutes_to_seconds: (mVal) => {
    return mathBuiltins.to_number(mVal) * 60;
  }
};

// src/builtins/system.ts
var os = __toESM(require("os"));
var crypto = __toESM(require("crypto"));
var SUITS = ["Hearts", "Diamonds", "Clubs", "Spades"];
var RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"];
var STUDENT_DICTIONARY = {
  algorithm: "A step-by-step set of instructions or rules designed to solve a specific problem or perform a task.",
  hypothesis: "A proposed, testable explanation for an observed phenomenon made as a starting point for further investigation.",
  photosynthesis: "The biological process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.",
  gravity: "The universal force of attraction acting between all matter, proportional to their masses and inversely to the distance squared.",
  variable: "A symbolic name associated with a value and whose associated value may be changed or modified.",
  function: "A reusable block of code designed to perform a particular computation or operation when called.",
  derivative: "In calculus, the rate at which a function's value changes with respect to a change in its input.",
  integral: "In calculus, a mathematical object that can be interpreted as an area or a generalization of area.",
  osmosis: "The spontaneous net movement of solvent molecules through a selectively permeable membrane into a region of higher solute concentration.",
  mitosis: "A type of cell division that results in two daughter cells each having the same number and kind of chromosomes as the parent nucleus.",
  ecosystem: "A biological community of interacting organisms and their physical environment.",
  entropy: "A measure of the thermal energy per unit temperature that is unavailable for doing useful work; a measure of molecular disorder.",
  momentum: "The quantity of motion of a moving body, measured as a product of its mass and velocity.",
  velocity: "The speed of something in a given direction.",
  acceleration: "The rate of change of velocity per unit of time.",
  metaphor: "A figure of speech in which a word or phrase is applied to an object or action to which it is not literally applicable.",
  simile: "A figure of speech involving the comparison of one thing with another thing of a different kind using 'like' or 'as'.",
  alliteration: "The occurrence of the same letter or sound at the beginning of adjacent or closely connected words.",
  democracy: "A system of government by the whole population or all eligible members of a state, typically through elected representatives.",
  republic: "A state in which supreme power is held by the people and their elected representatives, with an elected or nominated president.",
  inflation: "A general increase in prices and fall in the purchasing value of money over time.",
  opportunity_cost: "The loss of potential gain from other alternatives when one alternative is chosen.",
  catalyst: "A substance that increases the rate of a chemical reaction without itself undergoing any permanent chemical change.",
  molecule: "A group of atoms bonded together, representing the smallest fundamental unit of a chemical compound.",
  atom: "The basic unit of a chemical element, consisting of a dense central nucleus surrounded by a cloud of negatively charged electrons.",
  isotope: "Two or more forms of the same element that contain equal numbers of protons but different numbers of neutrons in their nuclei.",
  wavelength: "The distance between successive crests of a wave, especially points in a sound wave or electromagnetic wave.",
  frequency: "The number of occurrences of a repeating event per unit of time, measured in Hertz (Hz).",
  refraction: "The bending of a wave when it passes from one medium into another in which its speed is different.",
  resonance: "The reinforcement or prolongation of sound by reflection or by the synchronous vibration of a neighboring object."
};
var FLASHCARDS = [
  { question: "What is the speed of light in a vacuum?", answer: "Approximately 3.00 x 10^8 meters per second (299,792,458 m/s)." },
  { question: "What are the three subatomic particles in an atom?", answer: "Protons, neutrons, and electrons." },
  { question: "What is Newton's First Law of Motion?", answer: "An object will remain at rest or in uniform motion unless acted upon by a net external force." },
  { question: "What is the formula for the Pythagorean Theorem?", answer: "a^2 + b^2 = c^2 (where c is the hypotenuse of a right triangle)." },
  { question: "What gas do plants absorb during photosynthesis?", answer: "Carbon dioxide (CO2)." },
  { question: "What is the pH value of pure water at 25 degrees Celsius?", answer: "7 (neutral)." },
  { question: "Who formulated the general theory of relativity?", answer: "Albert Einstein (1915)." },
  { question: "What is the most abundant gas in Earth's atmosphere?", answer: "Nitrogen (approx. 78%)." }
];
var systemBuiltins = {
  os_platform: () => {
    return os.platform();
  },
  os_arch: () => {
    return os.arch();
  },
  cpu_count: () => {
    return os.cpus().length;
  },
  memory_usage: () => {
    return Math.round(process.memoryUsage().heapUsed / (1024 * 1024));
  },
  get_env: (keyVal) => {
    const key = plainToString(keyVal);
    return process.env[key] || "";
  },
  random_id: (lengthVal) => {
    const len = lengthVal !== void 0 ? mathBuiltins.to_number(lengthVal) : 8;
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let res = "";
    for (let i = 0; i < len; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  },
  generate_password: (lengthVal) => {
    const len = lengthVal !== void 0 ? mathBuiltins.to_number(lengthVal) : 12;
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let res = "";
    for (let i = 0; i < len; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  },
  roll_dice: (sidesVal, countVal) => {
    const sides = sidesVal !== void 0 ? mathBuiltins.to_number(sidesVal) : 6;
    const count = countVal !== void 0 ? mathBuiltins.to_number(countVal) : 1;
    if (sides < 1 || count < 1) {
      throw new PlainError("Dice sides and count must be at least 1.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    if (count === 1) {
      return Math.floor(Math.random() * sides) + 1;
    }
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(Math.floor(Math.random() * sides) + 1);
    }
    return results;
  },
  flip_coin: () => {
    return Math.random() < 0.5 ? "heads" : "tails";
  },
  pick_card: () => {
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
    return `${rank} of ${suit}`;
  },
  deck_of_cards: () => {
    const deck = [];
    for (const s of SUITS) {
      for (const r of RANKS) {
        deck.push(`${r} of ${s}`);
      }
    }
    return deck;
  },
  beep: () => {
    if (process.stdout && process.stdout.write) {
      process.stdout.write("\x07");
    }
  },
  to_json: (value) => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return JSON.stringify(String(value));
    }
  },
  from_json: (jsonVal) => {
    const str = plainToString(jsonVal);
    try {
      const parsed = JSON.parse(str);
      const convert = (item) => {
        if (item === null || item === void 0) return null;
        if (typeof item === "number" || typeof item === "string" || typeof item === "boolean") return item;
        if (Array.isArray(item)) return item.map(convert);
        if (typeof item === "object") {
          return Object.entries(item).map(([k, v]) => `${k}: ${plainToString(convert(v))}`);
        }
        return String(item);
      };
      return convert(parsed);
    } catch (err) {
      throw new PlainError(`Invalid JSON text: ${err.message}`, { line: 1, column: 1 }, { kind: "TypeError" });
    }
  },
  hash_text: (textVal, algoVal) => {
    const text = plainToString(textVal);
    const algo = algoVal !== void 0 ? plainToString(algoVal).toLowerCase() : "sha256";
    try {
      return crypto.createHash(algo).update(text).digest("hex");
    } catch {
      return crypto.createHash("sha256").update(text).digest("hex");
    }
  },
  uuid: () => {
    return crypto.randomUUID();
  },
  define_word: (wordVal) => {
    const word = plainToString(wordVal).toLowerCase().trim().replace(/\s+/g, "_");
    if (STUDENT_DICTIONARY[word]) {
      return STUDENT_DICTIONARY[word];
    }
    return `Definition for '${word}' not found in local student dictionary.`;
  },
  flashcard: () => {
    const card = FLASHCARDS[Math.floor(Math.random() * FLASHCARDS.length)];
    return `Q: ${card.question}
A: ${card.answer}`;
  },
  banner: (styleVal) => {
    const style = styleVal !== void 0 ? plainToString(styleVal).toLowerCase() : "star";
    if (style === "trophy") {
      return `  ___________ 
 '._==_==_=_.'
 .-\\:      /-.
| (|:.     |) |
 '-|:.     |-' 
   \\::.    /  
    '::. .'   
      ) (     
    _.' '._   
   \`"""""""\`  `;
    }
    if (style === "heart") {
      return "  **     **  \n ****   **** \n****** *******\n *********** \n   *******   \n     ***     \n      *      ";
    }
    return "     *     \n   * * *   \n * * * * * \n   * * *   \n     *     ";
  }
};

// src/builtins/network.ts
var networkBuiltins = {
  fetch_text: async (urlVal) => {
    const url2 = plainToString(urlVal);
    try {
      const response = await fetch(url2);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      return await response.text();
    } catch (err) {
      throw new PlainError(
        `Failed to fetch URL "${url2}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError", suggestion: "Make sure the URL is valid and you have an active internet connection." }
      );
    }
  },
  fetch_json: async (urlVal) => {
    const url2 = plainToString(urlVal);
    try {
      const response = await fetch(url2);
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const convert = (item) => {
        if (item === null || item === void 0) return null;
        if (typeof item === "number" || typeof item === "string" || typeof item === "boolean") return item;
        if (Array.isArray(item)) return item.map(convert);
        if (typeof item === "object") {
          return Object.entries(item).map(([k, v]) => `${k}: ${plainToString(convert(v))}`);
        }
        return String(item);
      };
      return convert(data);
    } catch (err) {
      throw new PlainError(
        `Failed to fetch JSON from "${url2}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  },
  url_encode: (textVal) => {
    const text = plainToString(textVal);
    return encodeURIComponent(text);
  },
  url_decode: (textVal) => {
    const text = plainToString(textVal);
    return decodeURIComponent(text);
  },
  is_valid_url: (urlVal) => {
    const text = plainToString(urlVal);
    try {
      const u = new URL(text);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }
};

// src/builtins/web.ts
var http = __toESM(require("http"));
var url = __toESM(require("url"));
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var activeServer = null;
var MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".ico": "image/x-icon"
};
function createWebBuiltins(context) {
  return {
    start_server: async (portVal, handlerVal) => {
      const port = typeof portVal === "number" ? portVal : parseInt(plainToString(portVal), 10) || 3e3;
      if (activeServer) {
        try {
          activeServer.close();
        } catch {
        }
        activeServer = null;
      }
      return new Promise((resolve6, reject) => {
        const server = http.createServer(async (req, res) => {
          const parsedUrl = url.parse(req.url || "/", true);
          const reqPath = parsedUrl.pathname || "/";
          const method = req.method || "GET";
          const query = JSON.stringify(parsedUrl.query || {});
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              let responseBody = "OK";
              let statusCode = 200;
              let contentType = "text/html; charset=utf-8";
              if (isPlainFunction(handlerVal) && context?.invokeFunction) {
                const handlerResult = await context.invokeFunction(handlerVal, [
                  method,
                  reqPath,
                  query,
                  body
                ]);
                if (typeof handlerResult === "string") {
                  responseBody = handlerResult;
                  if (responseBody.trim().startsWith("<")) {
                    contentType = "text/html; charset=utf-8";
                  } else if (responseBody.trim().startsWith("{") || responseBody.trim().startsWith("[")) {
                    contentType = "application/json; charset=utf-8";
                  } else {
                    contentType = "text/plain; charset=utf-8";
                  }
                } else if (handlerResult !== null && handlerResult !== void 0) {
                  responseBody = JSON.stringify(handlerResult, null, 2);
                  contentType = "application/json; charset=utf-8";
                }
              } else if (typeof handlerVal === "string") {
                responseBody = handlerVal;
              }
              res.writeHead(statusCode, { "Content-Type": contentType });
              res.end(responseBody);
            } catch (err) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Internal Server Error: " + err.message);
            }
          });
        });
        server.on("error", (err) => {
          reject(new PlainError(`Failed to start server on port ${port}: ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" }));
        });
        server.listen(port, () => {
          activeServer = server;
          resolve6(`Server running at http://localhost:${port}/`);
        });
      });
    },
    stop_server: () => {
      if (activeServer) {
        activeServer.close();
        activeServer = null;
        return "Server stopped.";
      }
      return "No active server to stop.";
    },
    serve_static_files: async (portVal, folderVal) => {
      const port = typeof portVal === "number" ? portVal : parseInt(plainToString(portVal), 10) || 3e3;
      const baseDir = path.resolve(plainToString(folderVal));
      if (activeServer) {
        activeServer.close();
        activeServer = null;
      }
      return new Promise((resolve6, reject) => {
        const server = http.createServer((req, res) => {
          const parsed = url.parse(req.url || "/", true);
          let safePath = path.normalize(parsed.pathname || "/").replace(/^(\.\.[\/\\])+/, "");
          if (safePath === "/" || safePath === "") safePath = "/index.html";
          const filePath = path.join(baseDir, safePath);
          if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            res.writeHead(404, { "Content-Type": "text/plain" });
            res.end("404 Not Found: " + safePath);
            return;
          }
          const ext = path.extname(filePath).toLowerCase();
          const contentType = MIME_TYPES[ext] || "application/octet-stream";
          res.writeHead(200, { "Content-Type": contentType });
          fs.createReadStream(filePath).pipe(res);
        });
        server.on("error", (err) => reject(new PlainError(err.message, { line: 1, column: 1 }, { kind: "RuntimeError" })));
        server.listen(port, () => {
          activeServer = server;
          resolve6(`Static server hosting "${baseDir}" at http://localhost:${port}/`);
        });
      });
    },
    http_get: async (urlVal, headersVal) => {
      const targetUrl = plainToString(urlVal);
      const headers = {};
      if (Array.isArray(headersVal)) {
        for (const item of headersVal) {
          const s = plainToString(item);
          const idx = s.indexOf(":");
          if (idx !== -1) {
            headers[s.slice(0, idx).trim()] = s.slice(idx + 1).trim();
          }
        }
      }
      const res = await fetch(targetUrl, { method: "GET", headers });
      if (!res.ok) {
        throw new PlainError(`HTTP GET ${targetUrl} failed with status ${res.status}: ${res.statusText}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
      }
      return await res.text();
    },
    http_post: async (urlVal, bodyVal, headersVal) => {
      const targetUrl = plainToString(urlVal);
      const body = typeof bodyVal === "string" ? bodyVal : JSON.stringify(bodyVal);
      const headers = { "Content-Type": "application/json" };
      if (Array.isArray(headersVal)) {
        for (const item of headersVal) {
          const s = plainToString(item);
          const idx = s.indexOf(":");
          if (idx !== -1) {
            headers[s.slice(0, idx).trim()] = s.slice(idx + 1).trim();
          }
        }
      }
      const res = await fetch(targetUrl, { method: "POST", headers, body });
      if (!res.ok) {
        throw new PlainError(`HTTP POST ${targetUrl} failed with status ${res.status}: ${res.statusText}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
      }
      return await res.text();
    },
    html_page: (titleVal, bodyVal) => {
      const title = plainToString(titleVal);
      const bodyContent = plainToString(bodyVal);
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 2rem; background: #f8fafc; color: #1e293b; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 2.5rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
    h1 { color: #0f172a; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    a { color: #2563eb; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    ${bodyContent}
  </div>
</body>
</html>`;
    },
    html_tag: (tagVal, contentVal, attrsVal) => {
      const tag = plainToString(tagVal).trim();
      const content = contentVal !== void 0 ? plainToString(contentVal) : "";
      const attrs = attrsVal !== void 0 ? " " + plainToString(attrsVal).trim() : "";
      return `<${tag}${attrs}>${content}</${tag}>`;
    },
    html_table: (headersVal, rowsVal) => {
      if (!Array.isArray(headersVal) || !Array.isArray(rowsVal)) {
        throw new PlainError("html_table expects a list of headers and a list of row lists.", { line: 1, column: 1 }, { kind: "TypeError" });
      }
      const ths = headersVal.map((h) => `<th>${plainToString(h)}</th>`).join("");
      const trs = rowsVal.map((row) => {
        if (!Array.isArray(row)) return `<tr><td>${plainToString(row)}</td></tr>`;
        const tds = row.map((cell) => `<td>${plainToString(cell)}</td>`).join("");
        return `<tr>${tds}</tr>`;
      }).join("\n");
      return `<table>
<thead><tr>${ths}</tr></thead>
<tbody>
${trs}
</tbody>
</table>`;
    },
    render_template: (templateVal, dataVal) => {
      let tpl = plainToString(templateVal);
      if (Array.isArray(dataVal)) {
        for (const item of dataVal) {
          const s = plainToString(item);
          const idx = s.indexOf(":");
          if (idx !== -1) {
            const key = s.slice(0, idx).trim();
            const val = s.slice(idx + 1).trim();
            tpl = tpl.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val);
          }
        }
      }
      return tpl;
    },
    parse_query_string: (queryVal) => {
      const q = plainToString(queryVal).replace(/^\?/, "");
      const pairs = q.split("&");
      const result = [];
      for (const p of pairs) {
        if (!p) continue;
        const [k, v] = p.split("=");
        result.push(`${decodeURIComponent(k || "")}: ${decodeURIComponent(v || "")}`);
      }
      return result;
    },
    send_webhook: async (urlVal, payloadVal) => {
      const targetUrl = plainToString(urlVal);
      const body = typeof payloadVal === "string" ? payloadVal : JSON.stringify(payloadVal);
      const res = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body
      });
      return `Webhook sent. Status: ${res.status}`;
    }
  };
}

// src/builtins/datascience.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
function getColumnIndex(table, colVal) {
  if (table.length === 0) return -1;
  const headers = table[0];
  if (typeof colVal === "number") {
    const idx = Math.floor(colVal) - 1;
    if (idx < 0 || idx >= headers.length) {
      throw new PlainError(`Column index ${colVal} is out of bounds (table has ${headers.length} columns).`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return idx;
  }
  const colName = plainToString(colVal).toLowerCase();
  for (let i = 0; i < headers.length; i++) {
    if (plainToString(headers[i]).toLowerCase() === colName) {
      return i;
    }
  }
  throw new PlainError(`Column named '${plainToString(colVal)}' not found in table.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
}
var datascienceBuiltins = {
  parse_csv: (textVal) => {
    const text = plainToString(textVal);
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const table = [];
    for (const line of lines) {
      const rawCols = parseCsvLine(line);
      const row = rawCols.map((c) => {
        const num = Number(c);
        return !isNaN(num) && c !== "" ? num : c;
      });
      table.push(row);
    }
    return table;
  },
  to_csv: (tableVal) => {
    if (!Array.isArray(tableVal)) {
      throw new PlainError("to_csv expects a 2D list (table).", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    return tableVal.map((row) => {
      if (!Array.isArray(row)) return `"${plainToString(row)}"`;
      return row.map((cell) => {
        const s = plainToString(cell);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      }).join(",");
    }).join("\n");
  },
  read_csv: (filePathVal) => {
    const fp = path2.resolve(plainToString(filePathVal));
    if (!fs2.existsSync(fp)) {
      throw new PlainError(`CSV file not found: "${fp}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const content = fs2.readFileSync(fp, "utf-8");
    return datascienceBuiltins.parse_csv(content);
  },
  write_csv: (filePathVal, tableVal) => {
    const fp = path2.resolve(plainToString(filePathVal));
    const content = datascienceBuiltins.to_csv(tableVal);
    fs2.mkdirSync(path2.dirname(fp), { recursive: true });
    fs2.writeFileSync(fp, content, "utf-8");
  },
  table_headers: (tableVal) => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    return Array.isArray(tableVal[0]) ? tableVal[0] : [];
  },
  table_rows: (tableVal) => {
    if (!Array.isArray(tableVal) || tableVal.length <= 1) return [];
    return tableVal.slice(1);
  },
  table_column: (tableVal, colVal) => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const idx = getColumnIndex(tableVal, colVal);
    const result = [];
    for (let i = 1; i < tableVal.length; i++) {
      const row = tableVal[i];
      if (Array.isArray(row) && idx < row.length) {
        result.push(row[idx]);
      }
    }
    return result;
  },
  filter_table: (tableVal, colVal, opVal, targetVal) => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const idx = getColumnIndex(tableVal, colVal);
    const op = plainToString(opVal).trim();
    const headers = tableVal[0];
    const result = [headers];
    for (let i = 1; i < tableVal.length; i++) {
      const row = tableVal[i];
      if (!Array.isArray(row) || idx >= row.length) continue;
      const cell = row[idx];
      let match = false;
      if (op === "==" || op === "is equal to" || op === "equals") {
        match = cell === targetVal || String(cell) === String(targetVal);
      } else if (op === "!=" || op === "is not equal to") {
        match = cell !== targetVal && String(cell) !== String(targetVal);
      } else if (op === ">" || op === "is greater than") {
        match = Number(cell) > Number(targetVal);
      } else if (op === "<" || op === "is less than") {
        match = Number(cell) < Number(targetVal);
      } else if (op === ">=" || op === "is at least") {
        match = Number(cell) >= Number(targetVal);
      } else if (op === "<=" || op === "is at most") {
        match = Number(cell) <= Number(targetVal);
      } else if (op === "contains") {
        match = plainToString(cell).toLowerCase().includes(plainToString(targetVal).toLowerCase());
      }
      if (match) {
        result.push(row);
      }
    }
    return result;
  },
  sort_table: (tableVal, colVal, ascendingVal) => {
    if (!Array.isArray(tableVal) || tableVal.length <= 1) return tableVal;
    const idx = getColumnIndex(tableVal, colVal);
    const asc = ascendingVal !== void 0 ? Boolean(ascendingVal) : true;
    const headers = tableVal[0];
    const dataRows = tableVal.slice(1).slice();
    dataRows.sort((a, b) => {
      const valA = a[idx];
      const valB = b[idx];
      if (typeof valA === "number" && typeof valB === "number") {
        return asc ? valA - valB : valB - valA;
      }
      const strA = plainToString(valA);
      const strB = plainToString(valB);
      return asc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
    return [headers, ...dataRows];
  },
  group_by_count: (tableVal, colVal) => {
    if (!Array.isArray(tableVal) || tableVal.length === 0 || !Array.isArray(tableVal[0])) return [];
    const idx = getColumnIndex(tableVal, colVal);
    const colName = plainToString(tableVal[0][idx]);
    const counts = {};
    for (let i = 1; i < tableVal.length; i++) {
      const row = tableVal[i];
      if (Array.isArray(row) && idx < row.length) {
        const key = plainToString(row[idx]);
        counts[key] = (counts[key] || 0) + 1;
      }
    }
    const result = [[colName, "Count"]];
    for (const [k, v] of Object.entries(counts)) {
      result.push([k, v]);
    }
    return result;
  },
  group_by_sum: (tableVal, groupColVal, sumColVal) => {
    if (!Array.isArray(tableVal) || tableVal.length === 0 || !Array.isArray(tableVal[0])) return [];
    const gIdx = getColumnIndex(tableVal, groupColVal);
    const sIdx = getColumnIndex(tableVal, sumColVal);
    const gName = plainToString(tableVal[0][gIdx]);
    const sName = plainToString(tableVal[0][sIdx]);
    const sums = {};
    for (let i = 1; i < tableVal.length; i++) {
      const row = tableVal[i];
      if (Array.isArray(row) && gIdx < row.length && sIdx < row.length) {
        const key = plainToString(row[gIdx]);
        const val = Number(row[sIdx]) || 0;
        sums[key] = (sums[key] || 0) + val;
      }
    }
    const result = [[gName, `Total ${sName}`]];
    for (const [k, v] of Object.entries(sums)) {
      result.push([k, Math.round(v * 100) / 100]);
    }
    return result;
  },
  describe_column: (colVal) => {
    if (!Array.isArray(colVal) || colVal.length === 0) {
      return ["count: 0"];
    }
    const nums = colVal.map((v) => Number(v)).filter((v) => !isNaN(v));
    if (nums.length === 0) {
      return [`count: ${colVal.length}`, "type: non-numeric"];
    }
    const count = nums.length;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const mean = statsBuiltins.mean(nums);
    const median = statsBuiltins.median(nums);
    const stdev = statsBuiltins.standard_deviation(nums);
    return [
      `count: ${count}`,
      `min: ${min}`,
      `max: ${max}`,
      `mean: ${Math.round(mean * 100) / 100}`,
      `median: ${median}`,
      `stdev: ${Math.round(stdev * 100) / 100}`
    ];
  },
  normalize_data: (listVal) => {
    if (!Array.isArray(listVal) || listVal.length === 0) return [];
    const nums = listVal.map((x) => mathBuiltins.to_number(x));
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    if (max === min) return nums.map(() => 0);
    return nums.map((x) => Math.round((x - min) / (max - min) * 1e4) / 1e4);
  },
  standardize_data: (listVal) => {
    if (!Array.isArray(listVal) || listVal.length === 0) return [];
    const nums = listVal.map((x) => mathBuiltins.to_number(x));
    const mean = statsBuiltins.mean(nums);
    const stdev = statsBuiltins.standard_deviation(nums);
    if (stdev === 0) return nums.map(() => 0);
    return nums.map((x) => Math.round((x - mean) / stdev * 1e4) / 1e4);
  },
  train_test_split: (dataVal, testRatioVal) => {
    if (!Array.isArray(dataVal)) return [[], []];
    const ratio = testRatioVal !== void 0 ? mathBuiltins.to_number(testRatioVal) : 0.2;
    const testCount = Math.max(1, Math.floor(dataVal.length * ratio));
    const shuffled = dataVal.slice().sort(() => Math.random() - 0.5);
    const test = shuffled.slice(0, testCount);
    const train = shuffled.slice(testCount);
    return [train, test];
  },
  ascii_bar_chart: (labelsVal, valuesVal, maxWidthVal) => {
    if (!Array.isArray(labelsVal) || !Array.isArray(valuesVal)) {
      throw new PlainError("ascii_bar_chart expects labels list and values list.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const width = maxWidthVal !== void 0 ? mathBuiltins.to_number(maxWidthVal) : 30;
    const nums = valuesVal.map((v) => Number(v) || 0);
    const maxVal = Math.max(...nums, 1);
    const maxLabelLen = Math.max(...labelsVal.map((l) => plainToString(l).length), 1);
    const lines = [];
    for (let i = 0; i < labelsVal.length; i++) {
      const label = plainToString(labelsVal[i]).padEnd(maxLabelLen);
      const val = nums[i] || 0;
      const barLen = Math.round(val / maxVal * width);
      const bar = "\u2588".repeat(Math.max(0, barLen));
      lines.push(`${label} | ${bar} ${val}`);
    }
    return lines.join("\n");
  },
  ascii_histogram: (listVal, binsVal) => {
    if (!Array.isArray(listVal) || listVal.length === 0) return "";
    const numBins = binsVal !== void 0 ? Math.max(2, Math.floor(mathBuiltins.to_number(binsVal))) : 5;
    const nums = listVal.map((v) => Number(v) || 0);
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const binWidth = (max - min) / numBins || 1;
    const counts = new Array(numBins).fill(0);
    for (const n of nums) {
      let b = Math.floor((n - min) / binWidth);
      if (b >= numBins) b = numBins - 1;
      counts[b]++;
    }
    const maxCount = Math.max(...counts, 1);
    const lines = [];
    for (let i = 0; i < numBins; i++) {
      const lower = Math.round((min + i * binWidth) * 10) / 10;
      const upper = Math.round((min + (i + 1) * binWidth) * 10) / 10;
      const bar = "\u2588".repeat(Math.round(counts[i] / maxCount * 25));
      lines.push(`[${lower} - ${upper}] | ${bar} (${counts[i]})`);
    }
    return lines.join("\n");
  },
  export_html_chart: (titleVal, typeVal, labelsVal, dataVal, filePathVal) => {
    const title = plainToString(titleVal);
    const chartType = plainToString(typeVal).toLowerCase();
    const labels = Array.isArray(labelsVal) ? labelsVal.map((l) => plainToString(l)) : [];
    const data = Array.isArray(dataVal) ? dataVal.map((d) => Number(d) || 0) : [];
    const fp = path2.resolve(plainToString(filePathVal));
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; padding: 2rem; background: #f8fafc; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); width: 800px; max-width: 95%; }
    h2 { text-align: center; color: #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <h2>${title}</h2>
    <canvas id="myChart"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: '${chartType === "line" ? "line" : "bar"}',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          label: '${title}',
          data: ${JSON.stringify(data)},
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  </script>
</body>
</html>`;
    fs2.mkdirSync(path2.dirname(fp), { recursive: true });
    fs2.writeFileSync(fp, html, "utf-8");
    return `Interactive HTML chart saved to: ${fp}`;
  }
};

// src/builtins/ai.ts
var POSITIVE_WORDS = /* @__PURE__ */ new Set([
  "good",
  "great",
  "excellent",
  "amazing",
  "love",
  "wonderful",
  "fantastic",
  "superb",
  "brilliant",
  "awesome",
  "happy",
  "best",
  "beautiful",
  "positive",
  "clean",
  "fast",
  "easy",
  "perfect",
  "success",
  "helpful",
  "delight",
  "impressive"
]);
var NEGATIVE_WORDS = /* @__PURE__ */ new Set([
  "bad",
  "terrible",
  "awful",
  "horrible",
  "hate",
  "worst",
  "poor",
  "fail",
  "failure",
  "broken",
  "slow",
  "hard",
  "difficult",
  "ugly",
  "sad",
  "angry",
  "negative",
  "annoying",
  "boring",
  "useless",
  "flaw",
  "error",
  "painful"
]);
var NEGATION_WORDS = /* @__PURE__ */ new Set(["not", "never", "no", "without", "hardly", "barely"]);
var INTENSIFIERS = /* @__PURE__ */ new Set(["very", "extremely", "super", "really", "incredibly", "totally"]);
var aiBuiltins = {
  vector_dot: (v1Val, v2Val) => {
    if (!Array.isArray(v1Val) || !Array.isArray(v2Val)) {
      throw new PlainError("vector_dot expects two numeric lists.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    if (v1Val.length !== v2Val.length) {
      throw new PlainError(`Vectors must have equal length (got ${v1Val.length} and ${v2Val.length}).`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    let sum = 0;
    for (let i = 0; i < v1Val.length; i++) {
      sum += Number(v1Val[i]) * Number(v2Val[i]);
    }
    return Math.round(sum * 1e8) / 1e8;
  },
  vector_magnitude: (vVal) => {
    if (!Array.isArray(vVal)) return 0;
    let sumSq = 0;
    for (const x of vVal) {
      const n = Number(x);
      sumSq += n * n;
    }
    return Math.sqrt(sumSq);
  },
  cosine_similarity: (v1Val, v2Val) => {
    const dot = aiBuiltins.vector_dot(v1Val, v2Val);
    const mag1 = aiBuiltins.vector_magnitude(v1Val);
    const mag2 = aiBuiltins.vector_magnitude(v2Val);
    if (mag1 === 0 || mag2 === 0) return 0;
    return Math.round(dot / (mag1 * mag2) * 1e6) / 1e6;
  },
  vector_distance: (v1Val, v2Val) => {
    if (!Array.isArray(v1Val) || !Array.isArray(v2Val)) return 0;
    const len = Math.min(v1Val.length, v2Val.length);
    let sumSq = 0;
    for (let i = 0; i < len; i++) {
      const diff = Number(v1Val[i]) - Number(v2Val[i]);
      sumSq += diff * diff;
    }
    return Math.round(Math.sqrt(sumSq) * 1e6) / 1e6;
  },
  knn_classify: (trainXVal, trainYVal, testPointVal, kVal) => {
    if (!Array.isArray(trainXVal) || !Array.isArray(trainYVal) || !Array.isArray(testPointVal)) {
      throw new PlainError("knn_classify expects train_x (list of vectors), train_y (labels), and test_point (vector).", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const k = kVal !== void 0 ? Math.max(1, Math.floor(mathBuiltins.to_number(kVal))) : 3;
    const distances = [];
    for (let i = 0; i < trainXVal.length; i++) {
      const point = trainXVal[i];
      if (!Array.isArray(point)) continue;
      const dist = aiBuiltins.vector_distance(point, testPointVal);
      distances.push({ dist, label: trainYVal[i] });
    }
    distances.sort((a, b) => a.dist - b.dist);
    const neighbors = distances.slice(0, k);
    const votes = {};
    let maxCount = 0;
    let winner = neighbors[0]?.label ?? null;
    for (const n of neighbors) {
      const key = plainToString(n.label);
      if (!votes[key]) votes[key] = { label: n.label, count: 0 };
      votes[key].count++;
      if (votes[key].count > maxCount) {
        maxCount = votes[key].count;
        winner = n.label;
      }
    }
    return winner;
  },
  knn_predict: (trainXVal, trainYVal, testPointVal, kVal) => {
    if (!Array.isArray(trainXVal) || !Array.isArray(trainYVal) || !Array.isArray(testPointVal)) {
      throw new PlainError("knn_predict expects train_x (list of vectors), train_y (numeric targets), and test_point (vector).", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const k = kVal !== void 0 ? Math.max(1, Math.floor(mathBuiltins.to_number(kVal))) : 3;
    const distances = [];
    for (let i = 0; i < trainXVal.length; i++) {
      const point = trainXVal[i];
      if (!Array.isArray(point)) continue;
      const dist = aiBuiltins.vector_distance(point, testPointVal);
      distances.push({ dist, target: Number(trainYVal[i]) || 0 });
    }
    distances.sort((a, b) => a.dist - b.dist);
    const neighbors = distances.slice(0, k);
    const sum = neighbors.reduce((acc, curr) => acc + curr.target, 0);
    return Math.round(sum / neighbors.length * 1e4) / 1e4;
  },
  kmeans_cluster: (dataVal, kVal, maxItersVal) => {
    if (!Array.isArray(dataVal) || dataVal.length === 0) return [];
    const k = kVal !== void 0 ? Math.max(1, Math.floor(mathBuiltins.to_number(kVal))) : 2;
    const maxIters = maxItersVal !== void 0 ? Math.floor(mathBuiltins.to_number(maxItersVal)) : 20;
    const points = dataVal.filter((p) => Array.isArray(p));
    if (points.length < k) return dataVal;
    const dims = points[0].length;
    const centroids = points.slice(0, k).map((p) => p.slice());
    let assignments = new Array(points.length).fill(0);
    for (let iter = 0; iter < maxIters; iter++) {
      let changed = false;
      for (let i = 0; i < points.length; i++) {
        let minDist = Infinity;
        let bestC = 0;
        for (let c = 0; c < k; c++) {
          const d = aiBuiltins.vector_distance(points[i], centroids[c]);
          if (d < minDist) {
            minDist = d;
            bestC = c;
          }
        }
        if (assignments[i] !== bestC) {
          assignments[i] = bestC;
          changed = true;
        }
      }
      if (!changed && iter > 0) break;
      const sums = Array.from({ length: k }, () => new Array(dims).fill(0));
      const counts = new Array(k).fill(0);
      for (let i = 0; i < points.length; i++) {
        const c = assignments[i];
        counts[c]++;
        for (let d = 0; d < dims; d++) {
          sums[c][d] += points[i][d];
        }
      }
      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let d = 0; d < dims; d++) {
            centroids[c][d] = Math.round(sums[c][d] / counts[c] * 1e4) / 1e4;
          }
        }
      }
    }
    return assignments.map((c) => c + 1);
  },
  sentiment_analyze: (textVal) => {
    const text = plainToString(textVal).toLowerCase();
    const words = text.match(/[a-z']+/g) || [];
    let score = 0;
    let isNegated = false;
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (NEGATION_WORDS.has(w)) {
        isNegated = true;
        continue;
      }
      let multiplier = 1;
      if (i > 0 && INTENSIFIERS.has(words[i - 1])) {
        multiplier = 1.75;
      }
      let delta = 0;
      if (POSITIVE_WORDS.has(w)) {
        delta = 1 * multiplier;
      } else if (NEGATIVE_WORDS.has(w)) {
        delta = -1 * multiplier;
      }
      if (delta !== 0) {
        if (isNegated) delta = -delta * 0.75;
        score += delta;
        isNegated = false;
      }
    }
    let sentiment = "neutral";
    if (score > 0.5) sentiment = "positive";
    else if (score < -0.5) sentiment = "negative";
    return [sentiment, String(Math.round(score * 100) / 100)];
  },
  train_text_classifier: (docsVal, labelsVal) => {
    if (!Array.isArray(docsVal)) return "";
    let docs = [];
    let labels = [];
    if (Array.isArray(labelsVal)) {
      docs = docsVal.map((d) => plainToString(d));
      labels = labelsVal.map((l) => plainToString(l));
    } else {
      for (const row of docsVal) {
        if (Array.isArray(row) && row.length >= 2) {
          docs.push(plainToString(row[0]));
          labels.push(plainToString(row[1]));
        }
      }
    }
    const classCounts = {};
    const wordCounts = {};
    const classTotalWords = {};
    const vocab = /* @__PURE__ */ new Set();
    for (let i = 0; i < docs.length; i++) {
      const cls = labels[i] || "unknown";
      classCounts[cls] = (classCounts[cls] || 0) + 1;
      if (!wordCounts[cls]) wordCounts[cls] = {};
      const words = docs[i].toLowerCase().match(/[a-z0-9]+/g) || [];
      for (const w of words) {
        vocab.add(w);
        wordCounts[cls][w] = (wordCounts[cls][w] || 0) + 1;
        classTotalWords[cls] = (classTotalWords[cls] || 0) + 1;
      }
    }
    return JSON.stringify({
      totalDocs: docs.length,
      vocabSize: vocab.size,
      classCounts,
      wordCounts,
      classTotalWords
    });
  },
  classify_text: (modelVal, textVal) => {
    const modelStr = plainToString(modelVal);
    let model;
    try {
      model = JSON.parse(modelStr);
    } catch {
      return "unknown";
    }
    const text = plainToString(textVal).toLowerCase();
    const words = text.match(/[a-z0-9]+/g) || [];
    const classes = Object.keys(model.classCounts || {});
    if (classes.length === 0) return "unknown";
    let bestScore = -Infinity;
    let bestClass = classes[0];
    for (const cls of classes) {
      let logProb = Math.log(model.classCounts[cls] / model.totalDocs);
      const totalWords = model.classTotalWords[cls] || 0;
      const vocabSize = model.vocabSize || 1;
      for (const w of words) {
        const count = model.wordCounts[cls] && model.wordCounts[cls][w] || 0;
        logProb += Math.log((count + 1) / (totalWords + vocabSize));
      }
      if (logProb > bestScore) {
        bestScore = logProb;
        bestClass = cls;
      }
    }
    return bestClass;
  },
  sigmoid: (xVal) => {
    const x = mathBuiltins.to_number(xVal);
    return Math.round(1 / (1 + Math.exp(-x)) * 1e6) / 1e6;
  },
  relu: (xVal) => {
    const x = mathBuiltins.to_number(xVal);
    return Math.max(0, x);
  },
  softmax: (listVal) => {
    if (!Array.isArray(listVal) || listVal.length === 0) return [];
    const nums = listVal.map((x) => mathBuiltins.to_number(x));
    const maxVal = Math.max(...nums);
    const exps = nums.map((x) => Math.exp(x - maxVal));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => Math.round(e / sumExps * 1e4) / 1e4);
  },
  neural_forward: (weightsVal, biasesVal, inputsVal, activationVal) => {
    if (!Array.isArray(weightsVal) || !Array.isArray(biasesVal) || !Array.isArray(inputsVal)) {
      throw new PlainError("neural_forward expects weights (2D list), biases (1D list), and inputs (1D list).", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const activation = activationVal !== void 0 ? plainToString(activationVal).toLowerCase() : "relu";
    const inputs = inputsVal.map((x) => Number(x) || 0);
    const biases = biasesVal.map((x) => Number(x) || 0);
    const outputs = [];
    for (let i = 0; i < weightsVal.length; i++) {
      const neuronWeights = weightsVal[i];
      if (!Array.isArray(neuronWeights)) continue;
      let sum = biases[i] || 0;
      for (let j = 0; j < inputs.length; j++) {
        sum += (Number(neuronWeights[j]) || 0) * inputs[j];
      }
      let activated = sum;
      if (activation === "relu") {
        activated = Math.max(0, sum);
      } else if (activation === "sigmoid") {
        activated = 1 / (1 + Math.exp(-sum));
      }
      outputs.push(Math.round(activated * 1e4) / 1e4);
    }
    if (activation === "softmax") {
      return aiBuiltins.softmax(outputs);
    }
    return outputs;
  },
  predict_linear: (xListVal, yListVal, targetXVal) => {
    if (!Array.isArray(xListVal) || !Array.isArray(yListVal)) {
      throw new PlainError("predict_linear expects x values list and y values list.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const targetX = mathBuiltins.to_number(targetXVal);
    const reg = statsBuiltins.linear_regression(xListVal, yListVal);
    return Math.round((reg.slope * targetX + reg.intercept) * 1e4) / 1e4;
  },
  ai_prompt: (templateVal, varsVal) => {
    let tpl = plainToString(templateVal);
    if (Array.isArray(varsVal)) {
      for (const item of varsVal) {
        const s = plainToString(item);
        const idx = s.indexOf(":");
        if (idx !== -1) {
          const key = s.slice(0, idx).trim();
          const val = s.slice(idx + 1).trim();
          tpl = tpl.replace(new RegExp(`{${key}}`, "g"), val);
        }
      }
    }
    return tpl;
  },
  ai_chat: async (promptVal, systemPromptVal, apiKeyVal, modelVal) => {
    const prompt = plainToString(promptVal);
    const systemPrompt = systemPromptVal !== void 0 ? plainToString(systemPromptVal) : "You are a helpful assistant.";
    const apiKey = apiKeyVal !== void 0 && plainToString(apiKeyVal).trim() !== "" ? plainToString(apiKeyVal).trim() : process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "";
    const model = modelVal !== void 0 ? plainToString(modelVal) : "gpt-3.5-turbo";
    if (!apiKey) {
      return `[AI Simulation Mode]: To connect to live LLMs, provide an API key or set OPENAI_API_KEY.
Response to "${prompt}":
Artificial Intelligence is transforming how we learn, analyze data, and build software!`;
    }
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      throw new PlainError(`AI Chat request failed: ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
  }
};

// src/builtins/automation.ts
var child_process = __toESM(require("child_process"));
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var crypto2 = __toESM(require("crypto"));
var os2 = __toESM(require("os"));
var automationBuiltins = {
  run_command: (cmdVal) => {
    const cmd = plainToString(cmdVal);
    try {
      const output = child_process.execSync(cmd, {
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 10 * 1024 * 1024
      });
      return output.trim();
    } catch (err) {
      const out = err.stdout ? String(err.stdout) : "";
      const errout = err.stderr ? String(err.stderr) : "";
      return (out + "\n" + errout).trim() || err.message;
    }
  },
  walk_directory: (dirVal) => {
    const baseDir = path3.resolve(dirVal !== void 0 ? plainToString(dirVal) : ".");
    if (!fs3.existsSync(baseDir)) return [];
    const results = [];
    const traverse = (current) => {
      const entries = fs3.readdirSync(current, { withFileTypes: true });
      for (const ent of entries) {
        if (ent.name === "node_modules" || ent.name === ".git") continue;
        const full = path3.join(current, ent.name);
        if (ent.isDirectory()) {
          traverse(full);
        } else if (ent.isFile()) {
          results.push(path3.relative(baseDir, full).replace(/\\/g, "/"));
        }
      }
    };
    traverse(baseDir);
    return results;
  },
  find_files: (dirVal, patternVal) => {
    const allFiles = automationBuiltins.walk_directory(dirVal);
    const pattern = plainToString(patternVal).toLowerCase();
    return allFiles.filter((f) => f.toLowerCase().includes(pattern));
  },
  copy_file: (srcVal, destVal) => {
    const src = path3.resolve(plainToString(srcVal));
    const dest = path3.resolve(plainToString(destVal));
    if (!fs3.existsSync(src)) {
      throw new PlainError(`Source file not found: "${src}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    fs3.mkdirSync(path3.dirname(dest), { recursive: true });
    fs3.copyFileSync(src, dest);
    return true;
  },
  move_file: (srcVal, destVal) => {
    const src = path3.resolve(plainToString(srcVal));
    const dest = path3.resolve(plainToString(destVal));
    if (!fs3.existsSync(src)) {
      throw new PlainError(`Source file not found: "${src}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    fs3.mkdirSync(path3.dirname(dest), { recursive: true });
    fs3.renameSync(src, dest);
    return true;
  },
  batch_rename: (dirVal, findVal, replaceVal) => {
    const dir = path3.resolve(plainToString(dirVal));
    if (!fs3.existsSync(dir)) return 0;
    const findStr = plainToString(findVal);
    const replaceStr = plainToString(replaceVal);
    let count = 0;
    const files = fs3.readdirSync(dir);
    for (const f of files) {
      if (f.includes(findStr)) {
        const oldPath = path3.join(dir, f);
        const newPath = path3.join(dir, f.replace(findStr, replaceStr));
        fs3.renameSync(oldPath, newPath);
        count++;
      }
    }
    return count;
  },
  batch_delete: (dirVal, patternVal) => {
    const dir = path3.resolve(plainToString(dirVal));
    if (!fs3.existsSync(dir)) return 0;
    const pattern = plainToString(patternVal).toLowerCase();
    let count = 0;
    const files = fs3.readdirSync(dir);
    for (const f of files) {
      if (f.toLowerCase().includes(pattern)) {
        const p = path3.join(dir, f);
        if (fs3.statSync(p).isFile()) {
          fs3.unlinkSync(p);
          count++;
        }
      }
    }
    return count;
  },
  log_info: (msgVal) => {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    console.log(`[${timestamp}] [INFO]  ${plainToString(msgVal)}`);
  },
  log_warn: (msgVal) => {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    console.warn(`[${timestamp}] [WARN]  ${plainToString(msgVal)}`);
  },
  log_error: (msgVal) => {
    const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19);
    console.error(`[${timestamp}] [ERROR] ${plainToString(msgVal)}`);
  },
  parse_env_file: (filePathVal) => {
    const fp = path3.resolve(plainToString(filePathVal));
    if (!fs3.existsSync(fp)) return [];
    const content = fs3.readFileSync(fp, "utf-8");
    const lines = content.split(/\r?\n/);
    const result = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
        result.push(`${key}: ${val}`);
      }
    }
    return result;
  },
  checksum_file: (filePathVal, algoVal) => {
    const fp = path3.resolve(plainToString(filePathVal));
    if (!fs3.existsSync(fp)) {
      throw new PlainError(`File not found: "${fp}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const algo = algoVal !== void 0 ? plainToString(algoVal).toLowerCase() : "sha256";
    const buffer = fs3.readFileSync(fp);
    return crypto2.createHash(algo).update(buffer).digest("hex");
  },
  get_clipboard: () => {
    try {
      if (os2.platform() === "win32") {
        return child_process.execSync("powershell -NoProfile -Command Get-Clipboard", { encoding: "utf-8" }).trim();
      } else if (os2.platform() === "darwin") {
        return child_process.execSync("pbpaste", { encoding: "utf-8" }).trim();
      } else {
        return child_process.execSync("xclip -selection clipboard -o", { encoding: "utf-8" }).trim();
      }
    } catch {
      return "";
    }
  },
  set_clipboard: (textVal) => {
    const text = plainToString(textVal);
    try {
      if (os2.platform() === "win32") {
        const escaped = text.replace(/"/g, '""');
        child_process.execSync(`powershell -NoProfile -Command "Set-Clipboard -Value \\"${escaped}\\""`);
        return true;
      } else if (os2.platform() === "darwin") {
        const proc = child_process.spawn("pbcopy");
        proc.stdin.write(text);
        proc.stdin.end();
        return true;
      } else {
        const proc = child_process.spawn("xclip", ["-selection", "clipboard"]);
        proc.stdin.write(text);
        proc.stdin.end();
        return true;
      }
    } catch {
      return false;
    }
  },
  delay: async (secondsVal) => {
    const sec = mathBuiltins.to_number(secondsVal);
    const ms = Math.max(0, sec * 1e3);
    return new Promise((resolve6) => setTimeout(resolve6, ms));
  }
};

// src/builtins/file.ts
var fs4 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
var FileSystemSandbox = class {
  baseDir;
  constructor(baseDir) {
    this.baseDir = path4.resolve(baseDir || process.cwd());
  }
  resolveSafePath(filePath) {
    const resolved = path4.resolve(this.baseDir, filePath);
    const relative3 = path4.relative(this.baseDir, resolved);
    if (relative3.startsWith("..") && !path4.isAbsolute(relative3)) {
      throw new PlainError(
        `Access to file outside the project folder is not allowed: "${filePath}".`,
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Save and read files inside your project directory."
        }
      );
    }
    return resolved;
  }
  readFile(filePathVal) {
    const rawPath = plainToString(filePathVal);
    const safePath = this.resolveSafePath(rawPath);
    if (!fs4.existsSync(safePath)) {
      throw new PlainError(
        `File not found: "${rawPath}".`,
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Check if the file name is spelled correctly and exists in the project folder."
        }
      );
    }
    try {
      return fs4.readFileSync(safePath, "utf-8");
    } catch (err) {
      throw new PlainError(
        `Could not read file "${rawPath}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  }
  writeFile(filePathVal, contentVal) {
    const rawPath = plainToString(filePathVal);
    const safePath = this.resolveSafePath(rawPath);
    const content = plainToString(contentVal);
    try {
      const dir = path4.dirname(safePath);
      if (!fs4.existsSync(dir)) {
        fs4.mkdirSync(dir, { recursive: true });
      }
      fs4.writeFileSync(safePath, content, "utf-8");
    } catch (err) {
      throw new PlainError(
        `Could not write to file "${rawPath}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  }
  fileExists(filePathVal) {
    const rawPath = plainToString(filePathVal);
    try {
      const safePath = this.resolveSafePath(rawPath);
      return fs4.existsSync(safePath) && fs4.statSync(safePath).isFile();
    } catch {
      return false;
    }
  }
  appendFile(filePathVal, contentVal) {
    const rawPath = plainToString(filePathVal);
    const safePath = this.resolveSafePath(rawPath);
    const content = plainToString(contentVal);
    try {
      const dir = path4.dirname(safePath);
      if (!fs4.existsSync(dir)) {
        fs4.mkdirSync(dir, { recursive: true });
      }
      fs4.appendFileSync(safePath, content, "utf-8");
    } catch (err) {
      throw new PlainError(
        `Could not append to file "${rawPath}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  }
  deleteFile(filePathVal) {
    const rawPath = plainToString(filePathVal);
    const safePath = this.resolveSafePath(rawPath);
    if (!fs4.existsSync(safePath)) {
      return false;
    }
    try {
      fs4.unlinkSync(safePath);
      return true;
    } catch (err) {
      throw new PlainError(
        `Could not delete file "${rawPath}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  }
  listFiles(dirPathVal) {
    const rawDir = dirPathVal !== void 0 ? plainToString(dirPathVal) : ".";
    const safeDir = this.resolveSafePath(rawDir);
    if (!fs4.existsSync(safeDir)) {
      throw new PlainError(
        `Folder not found: "${rawDir}".`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
    try {
      return fs4.readdirSync(safeDir);
    } catch (err) {
      throw new PlainError(
        `Could not list folder "${rawDir}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  }
  fileSize(filePathVal) {
    const rawPath = plainToString(filePathVal);
    const safePath = this.resolveSafePath(rawPath);
    if (!fs4.existsSync(safePath)) {
      throw new PlainError(
        `File not found: "${rawPath}".`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
    return fs4.statSync(safePath).size;
  }
  createFolder(dirPathVal) {
    const rawDir = plainToString(dirPathVal);
    const safeDir = this.resolveSafePath(rawDir);
    try {
      if (!fs4.existsSync(safeDir)) {
        fs4.mkdirSync(safeDir, { recursive: true });
      }
    } catch (err) {
      throw new PlainError(
        `Could not create folder "${rawDir}": ${err.message}`,
        { line: 1, column: 1 },
        { kind: "RuntimeError" }
      );
    }
  }
  folderExists(dirPathVal) {
    const rawDir = plainToString(dirPathVal);
    try {
      const safeDir = this.resolveSafePath(rawDir);
      return fs4.existsSync(safeDir) && fs4.statSync(safeDir).isDirectory();
    } catch {
      return false;
    }
  }
};

// src/builtins/index.ts
function createStandardEnvironment(options) {
  const env = new Environment();
  const fileSandbox = new FileSystemSandbox(options?.baseDir);
  const register = (name, fn) => {
    const plainFn = {
      type: "function",
      name,
      parameters: [],
      nativeFn: fn
    };
    env.define(name, plainFn);
  };
  for (const [name, fn] of Object.entries(mathBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(geometryBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(statsBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(scienceBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(studentBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(textBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(listBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(timeBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(systemBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(networkBuiltins)) {
    register(name, fn);
  }
  const webBuiltins = createWebBuiltins({ invokeFunction: options?.invokeFunction });
  for (const [name, fn] of Object.entries(webBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(datascienceBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(aiBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(automationBuiltins)) {
    register(name, fn);
  }
  register("read_file", (path6) => fileSandbox.readFile(path6));
  register("write_file", (path6, content) => fileSandbox.writeFile(path6, content));
  register("append_file", (path6, content) => fileSandbox.appendFile(path6, content));
  register("file_exists", (path6) => fileSandbox.fileExists(path6));
  register("delete_file", (path6) => fileSandbox.deleteFile(path6));
  register("list_files", (dir) => fileSandbox.listFiles(dir));
  register("file_size", (path6) => fileSandbox.fileSize(path6));
  register("create_folder", (dir) => fileSandbox.createFolder(dir));
  register("folder_exists", (dir) => fileSandbox.folderExists(dir));
  register("print", (val) => options?.onSay ? options.onSay(plainToString(val)) : console.log(plainToString(val)));
  register("wait", (sec) => timeBuiltins.sleep(sec));
  register("sqrt", mathBuiltins.square_root);
  register("cbrt", mathBuiltins.cube_root);
  register("pow", mathBuiltins.power);
  register("fact", mathBuiltins.factorial);
  register("abs", mathBuiltins.absolute);
  register("min", mathBuiltins.minimum);
  register("max", mathBuiltins.maximum);
  register("avg", listBuiltins.average);
  register("len", textBuiltins.length);
  register("size", listBuiltins.count);
  register("upper", textBuiltins.uppercase);
  register("lower", textBuiltins.lowercase);
  register("capitalize", textBuiltins.title_case);
  register("stdev", statsBuiltins.standard_deviation);
  register("now", timeBuiltins.current_time);
  register("bar_chart", datascienceBuiltins.ascii_bar_chart);
  register("histogram", datascienceBuiltins.ascii_histogram);
  register("exec_shell", automationBuiltins.run_command);
  register("shell", automationBuiltins.run_command);
  register("knn", aiBuiltins.knn_classify);
  register("kmeans", aiBuiltins.kmeans_cluster);
  register("square root", mathBuiltins.square_root);
  register("cube root", mathBuiltins.cube_root);
  register("starts with", textBuiltins.starts_with);
  register("ends with", textBuiltins.ends_with);
  register("random between", mathBuiltins.random_between);
  register("days between", (d1, d2) => timeBuiltins.days_between(d1, d2));
  register("current time", () => timeBuiltins.current_time());
  register("read file", (path6) => fileSandbox.readFile(path6));
  register("write file", (path6, content) => fileSandbox.writeFile(path6, content));
  register("append file", (path6, content) => fileSandbox.appendFile(path6, content));
  register("file exists", (path6) => fileSandbox.fileExists(path6));
  register("delete file", (path6) => fileSandbox.deleteFile(path6));
  register("list files", (dir) => fileSandbox.listFiles(dir));
  register("file size", (path6) => fileSandbox.fileSize(path6));
  register("create folder", (dir) => fileSandbox.createFolder(dir));
  register("roll dice", (sides, count) => systemBuiltins.roll_dice(sides, count));
  register("flip coin", () => systemBuiltins.flip_coin());
  register("pick card", () => systemBuiltins.pick_card());
  register("letter grade", (pct) => studentBuiltins.letter_grade(pct));
  register("atomic mass", (elem) => scienceBuiltins.atomic_mass(elem));
  register("element name", (elem) => scienceBuiltins.element_name(elem));
  register("read csv", (p) => datascienceBuiltins.read_csv(p));
  register("write csv", (p, t) => datascienceBuiltins.write_csv(p, t));
  register("filter table", (t, c, op, v) => datascienceBuiltins.filter_table(t, c, op, v));
  register("sort table", (t, c, a) => datascienceBuiltins.sort_table(t, c, a));
  register("start server", (p, h) => webBuiltins.start_server(p, h));
  register("stop server", () => webBuiltins.stop_server());
  register("serve static", (p, f) => webBuiltins.serve_static_files(p, f));
  register("run command", (cmd) => automationBuiltins.run_command(cmd));
  register("find files", (d, p) => automationBuiltins.find_files(d, p));
  register("copy file", (s, d) => automationBuiltins.copy_file(s, d));
  register("move file", (s, d) => automationBuiltins.move_file(s, d));
  register("batch rename", (d, f, r) => automationBuiltins.batch_rename(d, f, r));
  register("log info", (m) => automationBuiltins.log_info(m));
  register("log error", (m) => automationBuiltins.log_error(m));
  register("log warn", (m) => automationBuiltins.log_warn(m));
  return env;
}

// src/runtime/interpreter.ts
var ReturnSignal = class {
  value;
  constructor(value) {
    this.value = value;
  }
};
var Interpreter = class {
  globalEnv;
  currentEnv;
  sourceCode;
  sourceFile;
  onSay;
  onShow;
  onAsk;
  onClear;
  constructor(options) {
    this.sourceCode = options?.sourceCode;
    this.sourceFile = options?.sourceFile;
    this.onSay = options?.onSay || ((s) => console.log(s));
    this.onShow = options?.onShow || ((s) => console.log(s));
    this.onAsk = options?.onAsk || ((p) => {
      return new Promise((resolve6) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question(p ? `${p} ` : "", (ans) => {
          rl.close();
          resolve6(ans);
        });
      });
    });
    this.onClear = options?.onClear || (() => console.clear());
    this.globalEnv = createStandardEnvironment({
      baseDir: options?.baseDir,
      onSay: this.onSay,
      onShow: this.onShow,
      onAsk: this.onAsk,
      onClear: this.onClear,
      invokeFunction: (fn, args) => this.callFunction(fn, args)
    });
    this.currentEnv = this.globalEnv;
  }
  getGlobalEnvironment() {
    return this.globalEnv;
  }
  async run(program) {
    for (const statement of program.body) {
      await this.executeStatement(statement);
    }
  }
  async executeStatement(statement) {
    switch (statement.type) {
      case "SetStatement":
        await this.executeSet(statement);
        break;
      case "SayStatement":
        await this.executeSay(statement);
        break;
      case "ShowStatement":
        await this.executeShow(statement);
        break;
      case "AskStatement":
        await this.executeAsk(statement);
        break;
      case "ClearScreenStatement":
        this.onClear();
        break;
      case "IfStatement":
        await this.executeIf(statement);
        break;
      case "RepeatTimesStatement":
        await this.executeRepeatTimes(statement);
        break;
      case "RepeatWhileStatement":
        await this.executeRepeatWhile(statement);
        break;
      case "ForEachStatement":
        await this.executeForEach(statement);
        break;
      case "FunctionDefStatement":
        this.executeFunctionDef(statement);
        break;
      case "ReturnStatement":
        await this.executeReturn(statement);
        break;
      case "ListAddStatement":
        await this.executeListAdd(statement);
        break;
      case "ListRemoveStatement":
        await this.executeListRemove(statement);
        break;
      case "WaitStatement":
        await this.executeWait(statement);
        break;
      case "ExpressionStatement":
        await this.evaluate(statement.expression);
        break;
    }
  }
  async executeSet(stmt) {
    const value = await this.evaluate(stmt.value);
    this.currentEnv.assign(stmt.name, value);
  }
  async executeSay(stmt) {
    const value = await this.evaluate(stmt.value);
    this.onSay(plainToString(value));
  }
  async executeShow(stmt) {
    const value = await this.evaluate(stmt.value);
    this.onShow(plainToString(value));
  }
  async executeAsk(stmt) {
    const promptVal = await this.evaluate(stmt.prompt);
    const promptStr = plainToString(promptVal);
    const answer = await this.onAsk(promptStr);
    if (stmt.targetVariable) {
      this.currentEnv.assign(stmt.targetVariable, answer);
    }
  }
  async executeIf(stmt) {
    const condition = await this.evaluate(stmt.condition);
    if (plainToBoolean(condition)) {
      for (const s of stmt.consequent) {
        await this.executeStatement(s);
      }
      return;
    }
    for (const branch of stmt.otherwiseIfBranches) {
      const branchCond = await this.evaluate(branch.condition);
      if (plainToBoolean(branchCond)) {
        for (const s of branch.body) {
          await this.executeStatement(s);
        }
        return;
      }
    }
    if (stmt.alternate) {
      for (const s of stmt.alternate) {
        await this.executeStatement(s);
      }
    }
  }
  async executeRepeatTimes(stmt) {
    const countVal = await this.evaluate(stmt.count);
    const count = Math.round(mathBuiltins.to_number(countVal));
    if (count < 0) {
      throw new PlainError(
        `Cannot repeat a negative number of times (${count}).`,
        stmt.location,
        { kind: "RuntimeError", sourceCode: this.sourceCode }
      );
    }
    for (let i = 0; i < count; i++) {
      for (const s of stmt.body) {
        await this.executeStatement(s);
      }
    }
  }
  async executeRepeatWhile(stmt) {
    while (plainToBoolean(await this.evaluate(stmt.condition))) {
      for (const s of stmt.body) {
        await this.executeStatement(s);
      }
    }
  }
  async executeForEach(stmt) {
    const listVal = await this.evaluate(stmt.list);
    if (!Array.isArray(listVal)) {
      throw new PlainError(
        `'for each' expects a list, but received ${typeof listVal}.`,
        stmt.location,
        {
          kind: "TypeError",
          sourceCode: this.sourceCode,
          suggestion: "Make sure the variable is a list, like: [1, 2, 3]"
        }
      );
    }
    for (const item of listVal) {
      this.currentEnv.assign(stmt.itemVariable, item);
      for (const s of stmt.body) {
        await this.executeStatement(s);
      }
    }
  }
  executeFunctionDef(stmt) {
    const fn = {
      type: "function",
      name: stmt.name,
      parameters: stmt.parameters,
      body: stmt.body,
      closure: this.currentEnv
    };
    this.currentEnv.define(stmt.name, fn);
  }
  async executeReturn(stmt) {
    let value = null;
    if (stmt.value) {
      value = await this.evaluate(stmt.value);
    }
    throw new ReturnSignal(value);
  }
  async executeListAdd(stmt) {
    const list = this.currentEnv.lookup(stmt.targetVariable, stmt.location, this.sourceCode);
    if (!Array.isArray(list)) {
      throw new PlainError(
        `Variable '${stmt.targetVariable}' is not a list.`,
        stmt.location,
        {
          kind: "TypeError",
          sourceCode: this.sourceCode,
          suggestion: `Initialize '${stmt.targetVariable}' as a list with: set ${stmt.targetVariable} to []`
        }
      );
    }
    const val = await this.evaluate(stmt.value);
    list.push(val);
  }
  async executeListRemove(stmt) {
    const list = this.currentEnv.lookup(stmt.targetVariable, stmt.location, this.sourceCode);
    if (!Array.isArray(list)) {
      throw new PlainError(
        `Variable '${stmt.targetVariable}' is not a list.`,
        stmt.location,
        {
          kind: "TypeError",
          sourceCode: this.sourceCode,
          suggestion: `Initialize '${stmt.targetVariable}' as a list with: set ${stmt.targetVariable} to []`
        }
      );
    }
    const target = await this.evaluate(stmt.value);
    const index = list.findIndex((item) => this.valuesEqual(item, target));
    if (index !== -1) {
      list.splice(index, 1);
    }
  }
  async executeWait(stmt) {
    const duration = await this.evaluate(stmt.duration);
    await timeBuiltins.sleep(duration);
  }
  // ==========================================
  // Expressions Evaluation
  // ==========================================
  async evaluate(expr) {
    switch (expr.type) {
      case "NumberLiteral":
        return expr.value;
      case "StringLiteral":
        return expr.value;
      case "BooleanLiteral":
        return expr.value;
      case "NothingLiteral":
        return null;
      case "Identifier":
        return this.currentEnv.lookup(expr.name, expr.location, this.sourceCode);
      case "ListLiteral": {
        const elements = [];
        for (const el of expr.elements) {
          elements.push(await this.evaluate(el));
        }
        return elements;
      }
      case "ItemOfExpression":
        return this.evaluateItemOf(expr);
      case "UnaryExpression":
        return this.evaluateUnary(expr);
      case "BinaryExpression":
        return this.evaluateBinary(expr);
      case "CallExpression":
        return this.evaluateCall(expr);
    }
  }
  async evaluateItemOf(expr) {
    const index = await this.evaluate(expr.index);
    const list = await this.evaluate(expr.list);
    return listBuiltins.item_of(index, list);
  }
  async evaluateUnary(expr) {
    const arg = await this.evaluate(expr.argument);
    if (expr.operator === "not") {
      return !plainToBoolean(arg);
    }
    if (expr.operator === "-") {
      const num = mathBuiltins.to_number(arg);
      return -num;
    }
    return arg;
  }
  async evaluateBinary(expr) {
    if (expr.operator === "and") {
      const left2 = await this.evaluate(expr.left);
      if (!plainToBoolean(left2)) return false;
      const right2 = await this.evaluate(expr.right);
      return plainToBoolean(right2);
    }
    if (expr.operator === "or") {
      const left2 = await this.evaluate(expr.left);
      if (plainToBoolean(left2)) return true;
      const right2 = await this.evaluate(expr.right);
      return plainToBoolean(right2);
    }
    const left = await this.evaluate(expr.left);
    const right = await this.evaluate(expr.right);
    switch (expr.operator) {
      case "+": {
        if (typeof left === "string" || typeof right === "string") {
          return plainToString(left) + plainToString(right);
        }
        if (Array.isArray(left) && Array.isArray(right)) {
          return [...left, ...right];
        }
        return mathBuiltins.to_number(left) + mathBuiltins.to_number(right);
      }
      case "-": {
        return mathBuiltins.to_number(left) - mathBuiltins.to_number(right);
      }
      case "*": {
        return mathBuiltins.to_number(left) * mathBuiltins.to_number(right);
      }
      case "/": {
        const divisor = mathBuiltins.to_number(right);
        if (divisor === 0) {
          throw new PlainError(
            "Cannot divide by zero.",
            expr.location,
            {
              kind: "RuntimeError",
              sourceCode: this.sourceCode,
              suggestion: "Make sure the divisor is not zero."
            }
          );
        }
        return mathBuiltins.to_number(left) / divisor;
      }
      case "%": {
        const divisor = mathBuiltins.to_number(right);
        if (divisor === 0) {
          throw new PlainError(
            "Cannot calculate remainder of division by zero.",
            expr.location,
            {
              kind: "RuntimeError",
              sourceCode: this.sourceCode,
              suggestion: "Make sure the number after 'remainder of' is not zero."
            }
          );
        }
        return mathBuiltins.to_number(left) % divisor;
      }
      case "==":
        return this.valuesEqual(left, right);
      case "!=":
        return !this.valuesEqual(left, right);
      case ">":
        return mathBuiltins.to_number(left) > mathBuiltins.to_number(right);
      case "<":
        return mathBuiltins.to_number(left) < mathBuiltins.to_number(right);
      case ">=":
        return mathBuiltins.to_number(left) >= mathBuiltins.to_number(right);
      case "<=":
        return mathBuiltins.to_number(left) <= mathBuiltins.to_number(right);
      default:
        throw new PlainError(
          `Unknown operator '${expr.operator}'.`,
          expr.location,
          { kind: "RuntimeError", sourceCode: this.sourceCode }
        );
    }
  }
  async evaluateCall(expr) {
    const calleeVal = this.currentEnv.lookup(expr.callee, expr.location, this.sourceCode);
    if (!isPlainFunction(calleeVal)) {
      throw new PlainError(
        `'${expr.callee}' is a ${typeof calleeVal}, not a function.`,
        expr.location,
        {
          kind: "TypeError",
          sourceCode: this.sourceCode,
          suggestion: `Check the name or define it with: to ${expr.callee} ... end`
        }
      );
    }
    const evaluatedArgs = [];
    for (const arg of expr.arguments) {
      evaluatedArgs.push(await this.evaluate(arg));
    }
    return this.callFunction(calleeVal, evaluatedArgs, expr.location);
  }
  async callFunction(calleeVal, evaluatedArgs, location) {
    if (calleeVal.nativeFn) {
      try {
        const result = calleeVal.nativeFn(...evaluatedArgs);
        return result instanceof Promise ? await result : result;
      } catch (err) {
        if (err instanceof PlainError) throw err;
        throw new PlainError(
          `Error running function '${calleeVal.name}': ${err.message}`,
          location || { line: 1, column: 1 },
          { kind: "RuntimeError", sourceCode: this.sourceCode }
        );
      }
    }
    if (calleeVal.body) {
      const callEnv = new Environment(calleeVal.closure || this.globalEnv);
      for (let i = 0; i < calleeVal.parameters.length; i++) {
        const paramName = calleeVal.parameters[i];
        const argVal = i < evaluatedArgs.length ? evaluatedArgs[i] : null;
        callEnv.define(paramName, argVal);
      }
      const previousEnv = this.currentEnv;
      this.currentEnv = callEnv;
      try {
        for (const s of calleeVal.body) {
          await this.executeStatement(s);
        }
        return null;
      } catch (signal) {
        if (signal instanceof ReturnSignal) {
          return signal.value;
        }
        throw signal;
      } finally {
        this.currentEnv = previousEnv;
      }
    }
    return null;
  }
  valuesEqual(a, b) {
    if (a === b) return true;
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    if (typeof a === "number" && typeof b === "number") return a === b;
    if (typeof a === "string" && typeof b === "string") return a === b;
    if (typeof a === "boolean" && typeof b === "boolean") return a === b;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.valuesEqual(a[i], b[i])) return false;
      }
      return true;
    }
    return false;
  }
};

// src/errors/formatter.ts
function formatError(error, fallbackSource) {
  if (!(error instanceof PlainError)) {
    if (error instanceof Error) {
      return `[Internal Error] ${error.message}`;
    }
    return `[Unknown Error] ${String(error)}`;
  }
  const { message, location, sourceCode, suggestion } = error;
  const source = sourceCode || fallbackSource || "";
  const lines = source ? source.split(/\r?\n/) : [];
  const fileLabel = location.sourceFile ? `${location.sourceFile}:` : "";
  const header = `Error at ${fileLabel}line ${location.line}, column ${location.column}:`;
  let snippet = "";
  if (lines.length > 0 && location.line >= 1 && location.line <= lines.length) {
    const rawLine = lines[location.line - 1];
    const lineNumStr = String(location.line).padStart(3, " ");
    const gutter = ` ${lineNumStr} | `;
    const pointerSpaces = " ".repeat(gutter.length + Math.max(0, location.column - 1));
    snippet = `
${gutter}${rawLine}
${pointerSpaces}^`;
  }
  let result = `${header}
${snippet}

${message}`;
  if (suggestion) {
    result += `

Suggestion: ${suggestion}`;
  }
  return result;
}

// src/index.ts
async function runPlain(source, options) {
  const lexer = new Lexer(source, options?.filename);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens, source, options?.filename);
  const ast = parser.parse();
  const interpreter = new Interpreter({
    sourceCode: source,
    sourceFile: options?.filename,
    baseDir: options?.baseDir,
    onSay: options?.onSay,
    onShow: options?.onShow,
    onAsk: options?.onAsk,
    onClear: options?.onClear
  });
  await interpreter.run(ast);
  return interpreter;
}

// src/cli/repl.ts
var readline2 = __toESM(require("readline"));

// src/cli/help.ts
function getHelp(topic) {
  const t = (topic || "").trim().toLowerCase();
  if (t === "variables" || t === "set") {
    return `
=== PLAIN: Variables ===
To create or update a variable, use:
    set <name> to <value>

Examples:
    set name to "Alex"
    set age to 15
    set is_ready to true
    set scores to [85, 92, 78]

Rules:
- Names can use letters, numbers, and underscores (e.g. total_score).
- Names cannot start with a number.
`;
  }
  if (t === "conditions" || t === "if") {
    return `
=== PLAIN: Conditions (If Statements) ===
Make decisions in your code:

    if <condition> then
        ...
    otherwise if <another_condition> then
        ...
    otherwise
        ...
    end

Comparisons:
    is equal to      (or ==)
    is not equal to  (or !=)
    is greater than  (or >)
    is less than     (or <)
    is at least      (or >=)
    is at most       (or <=)

Logical words:
    and, or, not
`;
  }
  if (t === "loops" || t === "repeat" || t === "for") {
    return `
=== PLAIN: Loops (Repeating Actions) ===

1. Repeat a set number of times:
    repeat 3 times
        say "Hello!"
    end

2. Repeat while a condition is true:
    set count to 3
    repeat while count is greater than 0
        say count
        set count to count minus 1
    end

3. For each item in a list:
    for each fruit in ["apple", "banana", "cherry"]
        say fruit
    end
`;
  }
  if (t === "functions" || t === "to") {
    return `
=== PLAIN: Functions ===
Define custom actions:

    to greet person
        say "Hello " plus person
    end

    greet "Alex"

Functions that return a value:
    to add first and second
        give back first plus second
    end

    set result to add 4 and 6
    say result
`;
  }
  if (t === "lists" || t === "list") {
    return `
=== PLAIN: Lists ===
Lists hold multiple items:

    set colors to ["red", "green", "blue"]

Accessing items (PLAIN uses 1-based indexing):
    say first(colors)          # "red"
    say last(colors)           # "blue"
    say item 2 of colors       # "green"

Modifying lists:
    add "yellow" to colors
    remove "green" from colors

Math with lists:
    set scores to [80, 95, 70, 100]
    say count(scores)          # 4
    say average(scores)        # 86.25
    say highest(scores)        # 100
    say lowest(scores)         # 70
    say sum(scores)            # 345
`;
  }
  return `
========================================================================
                      PLAIN Programming Language
========================================================================
PLAIN is designed to be the simplest, most readable programming language.
Code reads like everyday English instructions.

COMMANDS:
  plain <file.plain>         Run a .plain script
  plain run <file.plain>     Run a .plain script
  plain check <file.plain>   Check syntax without executing
  plain repl                 Start the interactive shell
  plain playground           Launch the visual web playground
  plain help <topic>         Detailed help (topics: variables, conditions,
                             loops, functions, lists)

BASIC SYNTAX:
  say "Hello, world!"                  Output text
  set score to 100                     Save a variable
  ask "Name?" and save as user         Get input from user
  10 plus 5 times 2                    Math (+, -, *, /, remainder of)
  item 1 of scores                     1-based list access
  repeat 3 times ... end               Repeat loop
  if age is at least 18 then ... end   Conditionals
  to greet person ... end              Custom functions

FILE EXTENSION:
  Save your code in files ending with .plain
========================================================================
`;
}

// src/cli/repl.ts
function startRepl() {
  console.log("==========================================================");
  console.log("             PLAIN Programming Language REPL              ");
  console.log("      Type instructions in simple English, or 'exit'.     ");
  console.log("==========================================================\n");
  const interpreter = new Interpreter();
  const rl = readline2.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "plain> "
  });
  let buffer = "";
  let blockDepth = 0;
  rl.prompt();
  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (blockDepth === 0) {
      if (trimmed === "exit" || trimmed === "quit") {
        console.log("Goodbye! Keep coding in PLAIN.");
        rl.close();
        return;
      }
      if (trimmed === "help") {
        console.log(getHelp());
        rl.prompt();
        return;
      }
      if (trimmed === "clear") {
        console.clear();
        rl.prompt();
        return;
      }
      if (trimmed === "") {
        rl.prompt();
        return;
      }
    }
    const lower = trimmed.toLowerCase();
    if (lower.startsWith("if ") || lower.startsWith("repeat ") || lower.startsWith("for each ") || lower.startsWith("to ")) {
      blockDepth++;
    }
    if (lower === "end") {
      blockDepth = Math.max(0, blockDepth - 1);
    }
    buffer += line + "\n";
    if (blockDepth > 0) {
      rl.setPrompt("...   ");
      rl.prompt();
      return;
    }
    const source = buffer;
    buffer = "";
    rl.setPrompt("plain> ");
    try {
      const lexer = new Lexer(source, "<repl>");
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens, source, "<repl>");
      const program = parser.parse();
      for (const stmt of program.body) {
        if (stmt.type === "ExpressionStatement") {
          const val = await interpreter.evaluate(stmt.expression);
          if (val !== null && val !== void 0) {
            console.log("=> " + plainToString(val));
          }
        } else {
          await interpreter.executeStatement(stmt);
        }
      }
    } catch (err) {
      console.error("\n" + formatError(err, source) + "\n");
    }
    rl.prompt();
  });
  rl.on("close", () => {
    process.exit(0);
  });
}

// src/playground/server.ts
var http2 = __toESM(require("http"));
var HTML_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PLAIN Language Playground</title>
  <style>
    :root {
      --bg: #0f172a;
      --panel: #1e293b;
      --accent: #38bdf8;
      --accent-hover: #0284c7;
      --text: #f8fafc;
      --muted: #94a3b8;
      --border: #334155;
      --editor-bg: #090d16;
      --term-bg: #020617;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
    header { background: var(--panel); border-bottom: 1px solid var(--border); padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.15rem; color: var(--accent); }
    .controls { display: flex; align-items: center; gap: 12px; }
    select, button { padding: 8px 14px; border-radius: 6px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border); }
    select { background: var(--bg); color: var(--text); outline: none; }
    button.run { background: var(--accent); color: #000; border: none; }
    button.run:hover { background: var(--accent-hover); color: #fff; }
    button.clear { background: var(--bg); color: var(--muted); }
    button.clear:hover { color: var(--text); border-color: var(--text); }
    main { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); overflow: hidden; }
    .pane { display: flex; flex-direction: column; background: var(--panel); height: 100%; overflow: hidden; }
    .pane-header { padding: 8px 16px; background: var(--panel); border-bottom: 1px solid var(--border); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted); }
    textarea#editor { flex: 1; width: 100%; background: var(--editor-bg); color: #e2e8f0; font-family: 'Courier New', monospace; font-size: 1rem; line-height: 1.5; padding: 16px; border: none; outline: none; resize: none; tab-size: 4; }
    pre#terminal { flex: 1; width: 100%; background: var(--term-bg); color: #38bdf8; font-family: 'Courier New', monospace; font-size: 0.95rem; line-height: 1.5; padding: 16px; margin: 0; overflow-y: auto; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <span>&#9998; PLAIN</span>
      <span style="font-size: 0.8rem; font-weight: 400; color: var(--muted);">| The English-like Programming Language</span>
    </div>
    <div class="controls">
      <select id="exampleSelector">
        <option value="hello">01: Hello World</option>
        <option value="calculator">02: Simple Calculator</option>
        <option value="conditions">03: Age Checker</option>
        <option value="functions">04: Functions & Math</option>
        <option value="lists">05: Lists & Statistics</option>
        <option value="loops">06: Repetition & Loops</option>
      </select>
      <button class="clear" onclick="clearOutput()">Clear Output</button>
      <button class="run" onclick="runCode()">Run Program (Ctrl+Enter)</button>
    </div>
  </header>
  <main>
    <div class="pane">
      <div class="pane-header">Source Code (.plain)</div>
      <textarea id="editor" spellcheck="false" placeholder="Write your PLAIN program here..."></textarea>
    </div>
    <div class="pane">
      <div class="pane-header">Output Console</div>
      <pre id="terminal">Ready. Click 'Run Program' or press Ctrl+Enter to execute.</pre>
    </div>
  </main>
  <script>
    const examples = {
      hello: 'say "Hello, world!"\\n\\nset name to "Alex"\\nsay "Welcome to PLAIN, " plus name',
      calculator: 'set first to 12\\nset second to 8\\n\\nset sum to first plus second\\nset difference to first minus second\\nset product to first times second\\n\\nsay "Sum: " plus sum\\nsay "Difference: " plus difference\\nsay "Product: " plus product',
      conditions: 'set age to 16\\n\\nif age is at least 18 then\\n    say "You are an adult."\\notherwise if age is at least 13 then\\n    say "You are a teenager."\\notherwise\\n    say "You are a child."\\nend',
      functions: 'to double number\\n    give back number times 2\\nend\\n\\nto add first and second\\n    give back first plus second\\nend\\n\\nsay "Double 12 is: " plus double 12\\nsay "Add 4 and 6 is: " plus add 4 and 6',
      lists: 'set scores to [80, 95, 72, 88, 100]\\n\\nsay "All scores: " plus scores\\nsay "Number of scores: " plus count(scores)\\nsay "Highest score: " plus highest(scores)\\nsay "Lowest score: " plus lowest(scores)\\nsay "Average score: " plus average(scores)\\n\\nsay "Second item: " plus item 2 of scores',
      loops: 'say "Countdown:"\\nset lives to 3\\nrepeat while lives is greater than 0\\n    say lives\\n    set lives to lives minus 1\\nend\\n\\nrepeat 3 times\\n    say "Learning PLAIN is fun!"\\nend'
    };

    const editor = document.getElementById('editor');
    const terminal = document.getElementById('terminal');
    const selector = document.getElementById('exampleSelector');

    function loadExample(key) {
      if (examples[key]) {
        editor.value = examples[key];
      }
    }

    selector.addEventListener('change', (e) => loadExample(e.target.value));
    loadExample('hello');

    function clearOutput() {
      terminal.textContent = '';
    }

    async function runCode() {
      const code = editor.value;
      terminal.textContent = 'Running...\\n';
      try {
        const resp = await fetch('/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code })
        });
        const data = await resp.json();
        if (data.error) {
          terminal.style.color = '#f87171';
          terminal.textContent = data.error;
        } else {
          terminal.style.color = '#38bdf8';
          terminal.textContent = data.output.length > 0 ? data.output.join('\\n') : '(Program finished with no output)';
        }
      } catch (err) {
        terminal.style.color = '#f87171';
        terminal.textContent = 'Connection error: ' + err.message;
      }
    }

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
    });
  </script>
</body>
</html>`;
function startPlayground(port = 3e3) {
  const server = http2.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(HTML_PAGE);
      return;
    }
    if (req.method === "POST" && req.url === "/run") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          const { code } = JSON.parse(body || "{}");
          const output = [];
          await runPlain(code || "", {
            onSay: (s) => output.push(s),
            onShow: (s) => output.push(s),
            onAsk: async (prompt) => `(playground answer to: ${prompt})`
          });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ output }));
        } catch (err) {
          const formatted = formatError(err, body);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: formatted }));
        }
      });
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  });
  server.listen(port, () => {
    console.log(`==========================================================`);
    console.log(`      PLAIN Playground running at: http://localhost:${port} `);
    console.log(`      Open in your web browser to start coding visually.  `);
    console.log(`==========================================================`);
  });
}

// src/cli/cli.ts
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    startRepl();
    return;
  }
  const command = args[0];
  if (command === "--version" || command === "-v" || command === "version") {
    console.log("PLAIN Language version 1.0.0");
    return;
  }
  if (command === "help" || command === "--help" || command === "-h") {
    console.log(getHelp(args[1]));
    return;
  }
  if (command === "repl") {
    startRepl();
    return;
  }
  if (command === "examples" || command === "example") {
    const candidates = [
      path5.resolve(__dirname, "..", "examples"),
      path5.resolve(__dirname, "..", "..", "examples"),
      path5.resolve(process.cwd(), "examples")
    ];
    const examplesDir = candidates.find((d) => fs5.existsSync(d)) || candidates[0];
    const target = args[1] === "run" ? args[2] : args[1];
    if (!target) {
      console.log("\n=== PLAIN Example Programs ===");
      console.log("Run any example with: plain examples <number_or_name>\n");
      if (fs5.existsSync(examplesDir)) {
        const files = fs5.readdirSync(examplesDir).filter((f) => f.endsWith(".plain"));
        for (const file of files) {
          console.log(`  - ${file.replace(".plain", "")}  (plain examples ${file.split("_")[0]})`);
        }
      }
      console.log("\nExample: plain examples 01_hello\n");
      return;
    }
    if (fs5.existsSync(examplesDir)) {
      const files = fs5.readdirSync(examplesDir).filter((f) => f.endsWith(".plain"));
      const match = files.find(
        (f) => f.toLowerCase() === target.toLowerCase() || f.toLowerCase().startsWith(target.toLowerCase()) || f.toLowerCase().includes(target.toLowerCase())
      );
      if (match) {
        const fullPath = path5.join(examplesDir, match);
        const source2 = fs5.readFileSync(fullPath, "utf-8");
        console.log(`--- Running: ${match} ---
`);
        try {
          await runPlain(source2, { filename: match, baseDir: examplesDir });
        } catch (err) {
          console.error(formatError(err, source2));
        }
        return;
      }
    }
    console.error(`Error: Could not find example matching "${target}". Run 'plain examples' to see the list.`);
    return;
  }
  if (command === "playground") {
    const port = args[1] ? parseInt(args[1], 10) : 3e3;
    startPlayground(port);
    return;
  }
  if (command === "check") {
    const filename2 = args[1];
    if (!filename2) {
      console.error("Error: Please provide a .plain file to check.");
      process.exit(1);
    }
    const filePath2 = path5.resolve(process.cwd(), filename2);
    if (!fs5.existsSync(filePath2)) {
      console.error(`Error: File not found: "${filename2}"`);
      process.exit(1);
    }
    const source2 = fs5.readFileSync(filePath2, "utf-8");
    try {
      const lexer = new Lexer(source2, filename2);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens, source2, filename2);
      parser.parse();
      console.log(`\u2713 Syntax OK: "${filename2}" is valid PLAIN code.`);
    } catch (err) {
      console.error(formatError(err, source2));
      process.exit(1);
    }
    return;
  }
  let filename = command;
  if (command === "run") {
    if (!args[1]) {
      console.error("Error: Please provide a .plain file to run.");
      process.exit(1);
    }
    filename = args[1];
  }
  const filePath = path5.resolve(process.cwd(), filename);
  if (!fs5.existsSync(filePath)) {
    console.error(`Error: File not found: "${filename}"`);
    process.exit(1);
  }
  if (!filename.endsWith(".plain")) {
    console.warn(`[Note] PLAIN programs usually end with '.plain', but running "${filename}" anyway.
`);
  }
  const source = fs5.readFileSync(filePath, "utf-8");
  try {
    await runPlain(source, {
      filename,
      baseDir: path5.dirname(filePath)
    });
  } catch (err) {
    console.error(formatError(err, source));
    process.exit(1);
  }
}
if (require.main === module) {
  main().catch((err) => {
    console.error(formatError(err));
    process.exit(1);
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  main
});
