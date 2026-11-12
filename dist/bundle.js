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
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));

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
    const n = mathBuiltins.to_number(num);
    return Math.round(n);
  },
  floor: (num) => {
    const n = mathBuiltins.to_number(num);
    return Math.floor(n);
  },
  ceiling: (num) => {
    const n = mathBuiltins.to_number(num);
    return Math.ceil(n);
  },
  absolute: (num) => {
    const n = mathBuiltins.to_number(num);
    return Math.abs(n);
  },
  minimum: (...args) => {
    if (args.length === 0) {
      throw new PlainError(
        "minimum(...) requires at least one number.",
        { line: 1, column: 1 },
        { kind: "TypeError" }
      );
    }
    const numbers = args.map((a) => mathBuiltins.to_number(a));
    return Math.min(...numbers);
  },
  maximum: (...args) => {
    if (args.length === 0) {
      throw new PlainError(
        "maximum(...) requires at least one number.",
        { line: 1, column: 1 },
        { kind: "TypeError" }
      );
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
      throw new PlainError(
        "I cannot get the first item because the list is empty.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Add items to the list before calling first(list)."
        }
      );
    }
    return list[0];
  },
  last: (val) => {
    const list = ensureList(val, "last");
    if (list.length === 0) {
      throw new PlainError(
        "I cannot get the last item because the list is empty.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Add items to the list before calling last(list)."
        }
      );
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
        {
          kind: "RuntimeError",
          suggestion: "Remember that PLAIN uses 1-based indexing: item 1 is the first item."
        }
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
      throw new PlainError(
        "I cannot calculate the average of an empty list.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Make sure the list has at least one number before finding the average."
        }
      );
    }
    return listBuiltins.sum(list) / list.length;
  },
  highest: (val) => {
    const list = ensureList(val, "highest");
    if (list.length === 0) {
      throw new PlainError(
        "I cannot find the highest item because the list is empty.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Make sure the list has at least one number."
        }
      );
    }
    const numbers = list.map((item) => mathBuiltins.to_number(item));
    return Math.max(...numbers);
  },
  lowest: (val) => {
    const list = ensureList(val, "lowest");
    if (list.length === 0) {
      throw new PlainError(
        "I cannot find the lowest item because the list is empty.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Make sure the list has at least one number."
        }
      );
    }
    const numbers = list.map((item) => mathBuiltins.to_number(item));
    return Math.min(...numbers);
  }
};

// src/builtins/time.ts
var timeBuiltins = {
  today: () => {
    const now = /* @__PURE__ */ new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  },
  current_time: () => {
    const now = /* @__PURE__ */ new Date();
    const h = String(now.getHours()).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  },
  days_between: (d1Val, d2Val) => {
    const s1 = plainToString(d1Val);
    const s2 = plainToString(d2Val);
    const date1 = new Date(s1);
    const date2 = new Date(s2);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      throw new PlainError(
        `Invalid date format. Expected dates like '2026-01-01'.`,
        { line: 1, column: 1 },
        { kind: "TypeError" }
      );
    }
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    return Math.round(diffMs / (1e3 * 60 * 60 * 24));
  },
  sleep: async (secondsVal) => {
    const sec = mathBuiltins.to_number(secondsVal);
    const ms = Math.max(0, sec * 1e3);
    return new Promise((resolve3) => setTimeout(resolve3, ms));
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
  }
};

// src/builtins/file.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var FileSystemSandbox = class {
  baseDir;
  constructor(baseDir) {
    this.baseDir = path.resolve(baseDir || process.cwd());
  }
  resolveSafePath(filePath) {
    const resolved = path.resolve(this.baseDir, filePath);
    const relative2 = path.relative(this.baseDir, resolved);
    if (relative2.startsWith("..") && !path.isAbsolute(relative2)) {
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
    if (!fs.existsSync(safePath)) {
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
      return fs.readFileSync(safePath, "utf-8");
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
      const dir = path.dirname(safePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(safePath, content, "utf-8");
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
      return fs.existsSync(safePath);
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
  for (const [name, fn] of Object.entries(textBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(mathBuiltins)) {
    register(name, fn);
  }
  for (const [name, fn] of Object.entries(listBuiltins)) {
    register(name, fn);
  }
  register("today", () => timeBuiltins.today());
  register("current_time", () => timeBuiltins.current_time());
  register("days_between", (d1, d2) => timeBuiltins.days_between(d1, d2));
  register("wait", (sec) => timeBuiltins.sleep(sec));
  register("read_file", (path3) => fileSandbox.readFile(path3));
  register("write_file", (path3, content) => fileSandbox.writeFile(path3, content));
  register("file_exists", (path3) => fileSandbox.fileExists(path3));
  register("to_number", mathBuiltins.to_number);
  register("number", mathBuiltins.to_number);
  register("to_text", mathBuiltins.to_text);
  register("text", mathBuiltins.to_text);
  register("len", textBuiltins.length);
  register("size", textBuiltins.length);
  register("print", (val) => options?.onSay ? options.onSay(String(val)) : console.log(val));
  register("starts with", textBuiltins.starts_with);
  register("ends with", textBuiltins.ends_with);
  register("random between", mathBuiltins.random_between);
  register("days between", (d1, d2) => timeBuiltins.days_between(d1, d2));
  register("current time", () => timeBuiltins.current_time());
  register("read file", (path3) => fileSandbox.readFile(path3));
  register("write file", (path3, content) => fileSandbox.writeFile(path3, content));
  register("file exists", (path3) => fileSandbox.fileExists(path3));
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
      return new Promise((resolve3) => {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        rl.question(p ? `${p} ` : "", (ans) => {
          rl.close();
          resolve3(ans);
        });
      });
    });
    this.onClear = options?.onClear || (() => console.clear());
    this.globalEnv = createStandardEnvironment({
      baseDir: options?.baseDir,
      onSay: this.onSay,
      onShow: this.onShow,
      onAsk: this.onAsk,
      onClear: this.onClear
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
    if (calleeVal.nativeFn) {
      try {
        const result = calleeVal.nativeFn(...evaluatedArgs);
        return result instanceof Promise ? await result : result;
      } catch (err) {
        if (err instanceof PlainError) throw err;
        throw new PlainError(
          `Error running function '${calleeVal.name}': ${err.message}`,
          expr.location,
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
var http = __toESM(require("http"));
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
  const server = http.createServer(async (req, res) => {
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
      path2.resolve(__dirname, "..", "examples"),
      path2.resolve(__dirname, "..", "..", "examples"),
      path2.resolve(process.cwd(), "examples")
    ];
    const examplesDir = candidates.find((d) => fs2.existsSync(d)) || candidates[0];
    const target = args[1] === "run" ? args[2] : args[1];
    if (!target) {
      console.log("\n=== PLAIN Example Programs ===");
      console.log("Run any example with: plain examples <number_or_name>\n");
      if (fs2.existsSync(examplesDir)) {
        const files = fs2.readdirSync(examplesDir).filter((f) => f.endsWith(".plain"));
        for (const file of files) {
          console.log(`  - ${file.replace(".plain", "")}  (plain examples ${file.split("_")[0]})`);
        }
      }
      console.log("\nExample: plain examples 01_hello\n");
      return;
    }
    if (fs2.existsSync(examplesDir)) {
      const files = fs2.readdirSync(examplesDir).filter((f) => f.endsWith(".plain"));
      const match = files.find(
        (f) => f.toLowerCase() === target.toLowerCase() || f.toLowerCase().startsWith(target.toLowerCase()) || f.toLowerCase().includes(target.toLowerCase())
      );
      if (match) {
        const fullPath = path2.join(examplesDir, match);
        const source2 = fs2.readFileSync(fullPath, "utf-8");
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
    const filePath2 = path2.resolve(process.cwd(), filename2);
    if (!fs2.existsSync(filePath2)) {
      console.error(`Error: File not found: "${filename2}"`);
      process.exit(1);
    }
    const source2 = fs2.readFileSync(filePath2, "utf-8");
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
  const filePath = path2.resolve(process.cwd(), filename);
  if (!fs2.existsSync(filePath)) {
    console.error(`Error: File not found: "${filename}"`);
    process.exit(1);
  }
  if (!filename.endsWith(".plain")) {
    console.warn(`[Note] PLAIN programs usually end with '.plain', but running "${filename}" anyway.
`);
  }
  const source = fs2.readFileSync(filePath, "utf-8");
  try {
    await runPlain(source, {
      filename,
      baseDir: path2.dirname(filePath)
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
