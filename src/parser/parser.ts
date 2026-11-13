import {
  ASTNode,
  AssignmentStatement,
  BinaryExpression,
  BinaryOperator,
  CallExpression,
  ClearScreenStatement,
  DictionaryEntry,
  DictionaryLiteral,
  Expression,
  ExpressionStatement,
  ForEachStatement,
  FunctionDefStatement,
  Identifier,
  IfBranch,
  IfStatement,
  ImportStatement,
  IndexExpression,
  ItemOfExpression,
  ListAddStatement,
  ListLiteral,
  ListRemoveStatement,
  MemberAccessExpression,
  Program,
  RepeatTimesStatement,
  RepeatWhileStatement,
  ReturnStatement,
  SayStatement,
  SetStatement,
  ShowStatement,
  Statement,
  UnaryExpression,
  WaitStatement
} from "../ast/types";
import { Token, TokenType } from "../lexer/token";
import { PlainError, SourceLocation } from "../errors/plain-error";

export class Parser {
  private tokens: Token[];
  private current = 0;
  private source: string;
  private sourceFile?: string;

  constructor(tokens: Token[], source: string, sourceFile?: string) {
    this.tokens = tokens;
    this.source = source;
    this.sourceFile = sourceFile;
  }

  public parse(): Program {
    const startLoc = this.peek().location;
    const body: Statement[] = [];

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

  private parseStatement(): Statement {
    this.skipNewlines();

    const token = this.peek();

    switch (token.type) {
      case TokenType.Set:
        return this.parseSetStatement();
      case TokenType.Import:
        return this.parseImportStatement();
      case TokenType.From:
        return this.parseFromImportStatement();
      case TokenType.Def:
        return this.parseFunctionDefStatement();
      case TokenType.Return:
        return this.parseReturnStatement();
      case TokenType.While:
        return this.parseWhileStatement();
      case TokenType.Say:
        return this.parseSayStatement();
      case TokenType.Show:
        return this.parseShowStatement();
      case TokenType.Ask:
        return this.parseAskStatement();
      case TokenType.Clear:
        return this.parseClearStatement();
      case TokenType.If:
        return this.parseIfStatement();
      case TokenType.Repeat:
        return this.parseRepeatStatement();
      case TokenType.For:
        return this.parseForEachStatement();
      case TokenType.To:
        return this.parseFunctionDefStatement();
      case TokenType.Give:
        return this.parseReturnStatement();
      case TokenType.Add:
        return this.parseListAddStatement();
      case TokenType.Remove:
        return this.parseListRemoveStatement();
      case TokenType.Wait:
        return this.parseWaitStatement();
      case TokenType.Identifier: {
        const next = this.peekNext();
        if (
          next &&
          (next.type === TokenType.Equal ||
            next.type === TokenType.PlusEqual ||
            next.type === TokenType.MinusEqual ||
            next.type === TokenType.StarEqual ||
            next.type === TokenType.SlashEqual)
        ) {
          return this.parseAssignmentStatement();
        }
        return this.parseExpressionStatement();
      }
      default:
        // Could be an expression statement or unparenthesized function call like `greet "Alex"`
        return this.parseExpressionStatement();
    }
  }

  private parseSetStatement(): SetStatement {
    const setToken = this.advance(); // consume 'set'

    if (this.isAtEnd() || this.peek().type !== TokenType.Identifier) {
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

    if (!this.match(TokenType.To)) {
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

  private parseAssignmentStatement(): AssignmentStatement {
    const nameToken = this.advance(); // consume identifier
    const opToken = this.advance(); // consume =, +=, -=, *=, /=
    let operator: "=" | "+=" | "-=" | "*=" | "/=" = "=";
    switch (opToken.type) {
      case TokenType.Equal: operator = "="; break;
      case TokenType.PlusEqual: operator = "+="; break;
      case TokenType.MinusEqual: operator = "-="; break;
      case TokenType.StarEqual: operator = "*="; break;
      case TokenType.SlashEqual: operator = "/="; break;
      default: operator = "="; break;
    }
    const value = this.parseExpression();
    this.expectStatementEnd();
    return {
      type: "AssignmentStatement",
      name: nameToken.raw || nameToken.value,
      operator,
      value,
      location: nameToken.location
    };
  }

  private parseImportStatement(): ImportStatement {
    const importToken = this.advance(); // consume 'import'
    let source = "";
    if (this.check(TokenType.String)) {
      source = this.advance().value;
    } else if (this.isWord(this.peek())) {
      source = this.advance().raw || this.previous().value;
    } else {
      throw new PlainError(
        "Expected module name or file path after 'import'.",
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: import math or import \"./utils.plain\""
        }
      );
    }

    let alias: string | undefined;
    if (this.match(TokenType.As)) {
      if (this.isWord(this.peek())) {
        alias = this.advance().raw;
      }
    }

    this.expectStatementEnd();
    return {
      type: "ImportStatement",
      source,
      alias,
      location: importToken.location
    };
  }

  private parseFromImportStatement(): ImportStatement {
    const fromToken = this.advance(); // consume 'from'
    let source = "";
    if (this.check(TokenType.String)) {
      source = this.advance().value;
    } else if (this.isWord(this.peek())) {
      source = this.advance().raw;
    }

    this.consume(TokenType.Import, "Expected 'import' after 'from <module>'.");
    const symbols: string[] = [];
    do {
      if (this.isWord(this.peek())) {
        symbols.push(this.advance().raw);
      }
    } while (this.match(TokenType.Comma));

    this.expectStatementEnd();
    return {
      type: "ImportStatement",
      source,
      symbols,
      location: fromToken.location
    };
  }

  private parseWhileStatement(): RepeatWhileStatement {
    const token = this.advance(); // consume 'while'
    const condition = this.parseExpression();
    if (this.check(TokenType.Colon) || this.check(TokenType.Then)) {
      this.advance();
    }
    this.expectStatementEnd();

    const body: Statement[] = [];
    while (!this.isAtEnd() && !this.check(TokenType.End)) {
      this.skipNewlines();
      if (this.check(TokenType.End)) break;
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    if (!this.match(TokenType.End)) {
      throw new PlainError(
        `You started a 'while' loop on line ${token.location.line}, but didn't close it with 'end'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Add 'end' to close the while loop."
        }
      );
    }
    this.expectStatementEnd();

    return {
      type: "RepeatWhileStatement",
      condition,
      body,
      location: token.location
    };
  }

  private parseSayStatement(): SayStatement {
    const token = this.advance(); // consume 'say'

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

  private parseShowStatement(): ShowStatement {
    const token = this.advance(); // consume 'show'

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

  private parseAskStatement(): Statement {
    const token = this.advance(); // consume 'ask'

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
    let targetVariable: string | undefined;

    // Check for "and save as <name>"
    if (this.check(TokenType.And)) {
      this.advance(); // consume 'and'
      if (!this.match(TokenType.Save)) {
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
      if (!this.match(TokenType.As)) {
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
      if (!this.check(TokenType.Identifier)) {
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

  private parseClearStatement(): ClearScreenStatement {
    const token = this.advance(); // consume 'clear'

    if (!this.match(TokenType.Screen)) {
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

  private parseIfStatement(): IfStatement {
    const token = this.advance(); // consume 'if'
    const condition = this.parseExpression();

    // 'then' or ':' is optional for friendliness, but match if present
    this.match(TokenType.Then);
    if (this.check(TokenType.Colon)) this.advance();
    this.expectStatementEnd();

    const consequent: Statement[] = [];
    const otherwiseIfBranches: IfBranch[] = [];
    let alternate: Statement[] | undefined;

    while (!this.isAtEnd() && !this.check(TokenType.Otherwise) && !this.check(TokenType.End)) {
      this.skipNewlines();
      if (this.check(TokenType.Otherwise) || this.check(TokenType.End)) break;
      consequent.push(this.parseStatement());
      this.skipNewlines();
    }

    while (this.match(TokenType.Otherwise)) {
      if (this.match(TokenType.If)) {
        const branchLoc = this.previous().location;
        const branchCond = this.parseExpression();
        this.match(TokenType.Then);
        if (this.check(TokenType.Colon)) this.advance();
        this.expectStatementEnd();

        const branchBody: Statement[] = [];
        while (!this.isAtEnd() && !this.check(TokenType.Otherwise) && !this.check(TokenType.End)) {
          this.skipNewlines();
          if (this.check(TokenType.Otherwise) || this.check(TokenType.End)) break;
          branchBody.push(this.parseStatement());
          this.skipNewlines();
        }

        otherwiseIfBranches.push({
          condition: branchCond,
          body: branchBody,
          location: branchLoc
        });
      } else {
        // Simple otherwise / else block
        if (this.check(TokenType.Colon)) this.advance();
        this.expectStatementEnd();
        alternate = [];
        while (!this.isAtEnd() && !this.check(TokenType.End)) {
          this.skipNewlines();
          if (this.check(TokenType.End)) break;
          alternate.push(this.parseStatement());
          this.skipNewlines();
        }
        break;
      }
    }

    if (!this.match(TokenType.End)) {
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

  private inRepeatCount = false;

  private parseRepeatStatement(): RepeatTimesStatement | RepeatWhileStatement {
    const token = this.advance(); // consume 'repeat'

    if (this.match(TokenType.While)) {
      const condition = this.parseExpression();
      this.expectStatementEnd();

      const body: Statement[] = [];
      while (!this.isAtEnd() && !this.check(TokenType.End)) {
        this.skipNewlines();
        if (this.check(TokenType.End)) break;
        body.push(this.parseStatement());
        this.skipNewlines();
      }

      if (!this.match(TokenType.End)) {
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
        body,
        location: token.location
      };
    }

    // repeat N times
    this.inRepeatCount = true;
    let count: Expression;
    try {
      count = this.parseExpression();
    } finally {
      this.inRepeatCount = false;
    }

    if (!this.match(TokenType.Times)) {
      throw new PlainError(
        `I expected 'times' after the number in 'repeat ... times'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: repeat 5 times\n    say \"Hello\"\nend"
        }
      );
    }

    this.expectStatementEnd();

    const body: Statement[] = [];
    while (!this.isAtEnd() && !this.check(TokenType.End)) {
      this.skipNewlines();
      if (this.check(TokenType.End)) break;
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    if (!this.match(TokenType.End)) {
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

  private parseForEachStatement(): ForEachStatement {
    const token = this.advance(); // consume 'for'

    // 'each' is optional so both 'for each x in list' and 'for x in list' work!
    this.match(TokenType.Each);

    if (!this.check(TokenType.Identifier)) {
      throw new PlainError(
        `I expected an item variable name after 'for'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: for item in items or for each score in scores"
        }
      );
    }

    const itemVariable = this.advance().value;

    if (!this.match(TokenType.In)) {
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
    if (this.check(TokenType.Colon)) this.advance();
    this.expectStatementEnd();

    const body: Statement[] = [];
    while (!this.isAtEnd() && !this.check(TokenType.End)) {
      this.skipNewlines();
      if (this.check(TokenType.End)) break;
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    if (!this.match(TokenType.End)) {
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

  private isWord(token: Token): boolean {
    return (
      token.type === TokenType.Identifier ||
      token.type === TokenType.Add ||
      token.type === TokenType.Remove ||
      token.type === TokenType.Item ||
      token.type === TokenType.Ask ||
      token.type === TokenType.Show ||
      token.type === TokenType.Wait ||
      token.type === TokenType.Clear
    );
  }

  private parseFunctionDefStatement(): FunctionDefStatement {
    const token = this.advance(); // consume 'to' or 'def'

    if (!this.isWord(this.peek())) {
      throw new PlainError(
        `I expected a function name after '${token.raw}'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: 'Example: def greet(person): say "Hello " + person end or to greet person give back "Hello" end'
        }
      );
    }

    const name = this.advance().raw;
    const parameters: string[] = [];

    // Check if parameters are in parentheses: def foo(a, b) or to foo(a, b)
    if (this.match(TokenType.LeftParen)) {
      if (!this.check(TokenType.RightParen)) {
        do {
          if (!this.isWord(this.peek())) {
            throw new PlainError(
              `I expected a parameter name in the parameter list.`,
              this.peek().location,
              { kind: "ParserError", sourceCode: this.source }
            );
          }
          parameters.push(this.advance().raw);
        } while (this.match(TokenType.Comma));
      }
      this.consume(TokenType.RightParen, "I expected ')' after function parameters.");
    } else {
      // Natural English parameters:
      // to greet person
      // to add first and second
      // to calculate a and b and c
      while (!this.isAtStatementEnd()) {
        if (this.isWord(this.peek())) {
          parameters.push(this.advance().raw);
          // If followed by 'and', consume 'and'
          if (this.check(TokenType.And)) {
            this.advance();
          } else if (this.check(TokenType.Comma)) {
            this.advance();
          }
        } else {
          break;
        }
      }
    }

    if (this.check(TokenType.Colon)) {
      this.advance();
    }
    this.expectStatementEnd();

    const body: Statement[] = [];
    while (!this.isAtEnd() && !this.check(TokenType.End)) {
      this.skipNewlines();
      if (this.check(TokenType.End)) break;
      body.push(this.parseStatement());
      this.skipNewlines();
    }

    if (!this.match(TokenType.End)) {
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

  private parseReturnStatement(): ReturnStatement {
    const token = this.advance(); // consume 'give' or 'return'

    if (token.type === TokenType.Give) {
      if (!this.match(TokenType.Back)) {
        throw new PlainError(
          `I expected 'back' after 'give'.`,
          this.peek().location,
          {
            kind: "ParserError",
            sourceCode: this.source,
            suggestion: "Write 'give back <value>' or 'return <value>' to return a result."
          }
        );
      }
    }

    if (this.isAtStatementEnd()) {
      this.expectStatementEnd();
      return {
        type: "ReturnStatement",
        location: token.location
      };
    }

    const value = this.parseExpression();
    this.expectStatementEnd();

    return {
      type: "ReturnStatement",
      value,
      location: token.location
    };
  }

  private parseListAddStatement(): ListAddStatement {
    const token = this.advance(); // consume 'add'
    const value = this.parseExpression();

    if (!this.match(TokenType.To)) {
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

    if (!this.check(TokenType.Identifier)) {
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

  private parseListRemoveStatement(): ListRemoveStatement {
    const token = this.advance(); // consume 'remove'
    const value = this.parseExpression();

    if (!this.match(TokenType.From)) {
      throw new PlainError(
        `I expected 'from' after the value in 'remove ... from <list>'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: remove \"green\" from colors"
        }
      );
    }

    if (!this.check(TokenType.Identifier)) {
      throw new PlainError(
        `I expected the name of the list variable after 'from'.`,
        this.peek().location,
        {
          kind: "ParserError",
          sourceCode: this.source,
          suggestion: "Example: remove \"green\" from colors"
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

  private parseWaitStatement(): WaitStatement {
    const token = this.advance(); // consume 'wait'
    const duration = this.parseExpression();
    this.expectStatementEnd();

    return {
      type: "WaitStatement",
      duration,
      location: token.location
    };
  }

  private parseExpressionStatement(): ExpressionStatement {
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

  public parseExpression(): Expression {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): Expression {
    let left = this.parseLogicalAnd();

    while (this.match(TokenType.Or)) {
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

  private parseLogicalAnd(): Expression {
    let left = this.parseComparison();

    while (this.check(TokenType.And)) {
      const next = this.peekNext();
      if (next && next.type === TokenType.Save) {
        // This is part of 'and save as', do not treat as boolean AND
        break;
      }

      this.advance(); // consume 'and'
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

  private parseComparison(): Expression {
    let left = this.parseAdditive();

    // Check English comparison phrases or symbols
    while (true) {
      if (this.match(TokenType.EqualEqual)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "==", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.BangEqual)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "!=", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.LessSign)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "<", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.GreaterSign)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: ">", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.LessEqual)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "<=", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.GreaterEqual)) {
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: ">=", left, right, location: left.location };
        continue;
      }

      // Check "is ..." phrases
      if (this.check(TokenType.Is)) {
        const isToken = this.advance(); // consume 'is'

        if (this.match(TokenType.Equal)) {
          this.match(TokenType.To); // optional 'to'
          const right = this.parseAdditive();
          left = { type: "BinaryExpression", operator: "==", left, right, location: isToken.location };
          continue;
        }

        if (this.match(TokenType.Not)) {
          if (this.match(TokenType.Equal)) {
            this.match(TokenType.To);
          }
          const right = this.parseAdditive();
          left = { type: "BinaryExpression", operator: "!=", left, right, location: isToken.location };
          continue;
        }

        if (this.match(TokenType.Greater)) {
          this.consume(TokenType.Than, "I expected 'than' after 'greater'.");
          const right = this.parseAdditive();
          left = { type: "BinaryExpression", operator: ">", left, right, location: isToken.location };
          continue;
        }

        if (this.match(TokenType.Less)) {
          this.consume(TokenType.Than, "I expected 'than' after 'less'.");
          const right = this.parseAdditive();
          left = { type: "BinaryExpression", operator: "<", left, right, location: isToken.location };
          continue;
        }

        if (this.match(TokenType.At)) {
          if (this.match(TokenType.Least)) {
            const right = this.parseAdditive();
            left = { type: "BinaryExpression", operator: ">=", left, right, location: isToken.location };
            continue;
          }
          if (this.match(TokenType.Most)) {
            const right = this.parseAdditive();
            left = { type: "BinaryExpression", operator: "<=", left, right, location: isToken.location };
            continue;
          }
          throw new PlainError(
            `I expected 'least' or 'most' after 'is at'.`,
            this.peek().location,
            { kind: "ParserError", sourceCode: this.source, suggestion: "Use 'is at least' or 'is at most'." }
          );
        }

        // Just "is" -> equality check (e.g. `flag is true`, `x is 5`)
        const right = this.parseAdditive();
        left = { type: "BinaryExpression", operator: "==", left, right, location: isToken.location };
        continue;
      }

      break;
    }

    return left;
  }

  private parseAdditive(): Expression {
    let left = this.parseMultiplicative();

    while (this.match(TokenType.Plus, TokenType.PlusSign, TokenType.Minus, TokenType.MinusSign)) {
      const opToken = this.previous();
      const operator: BinaryOperator =
        opToken.type === TokenType.Plus || opToken.type === TokenType.PlusSign ? "+" : "-";
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

  private parseMultiplicative(): Expression {
    let left = this.parseUnary();

    while (true) {
      if (this.match(TokenType.StarStar)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "**", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.SlashSlash)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "//", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.StarSign)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "*", left, right, location: left.location };
        continue;
      }
      if (!this.inRepeatCount && this.match(TokenType.Times)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "*", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.SlashSign)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "/", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.Divided)) {
        this.consume(TokenType.By, "I expected 'by' after 'divided'.");
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "/", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.PercentSign)) {
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "%", left, right, location: left.location };
        continue;
      }
      if (this.match(TokenType.Remainder)) {
        this.consume(TokenType.Of, "I expected 'of' after 'remainder'.");
        const right = this.parseUnary();
        left = { type: "BinaryExpression", operator: "%", left, right, location: left.location };
        continue;
      }

      break;
    }

    return left;
  }

  private parseUnary(): Expression {
    if (this.match(TokenType.Not)) {
      const token = this.previous();
      const argument = this.parseUnary();
      return {
        type: "UnaryExpression",
        operator: "not",
        argument,
        location: token.location
      };
    }

    if (this.match(TokenType.MinusSign)) {
      const token = this.previous();
      const argument = this.parseUnary();
      return {
        type: "UnaryExpression",
        operator: "-",
        argument,
        location: token.location
      };
    }

    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.LeftBracket)) {
        const index = this.parseExpression();
        this.consume(TokenType.RightBracket, "Expected ']' after index.");
        expr = {
          type: "IndexExpression",
          object: expr,
          index,
          location: expr.location
        };
        continue;
      }
      if (this.match(TokenType.Dot)) {
        if (!this.isWord(this.peek())) {
          throw new PlainError("Expected property name after '.'.", this.peek().location, { kind: "ParserError", sourceCode: this.source });
        }
        const prop = this.advance().raw;
        expr = {
          type: "MemberAccessExpression",
          object: expr,
          property: prop,
          location: expr.location
        };
        continue;
      }
      if (this.match(TokenType.LeftParen)) {
        const args: Expression[] = [];
        if (!this.check(TokenType.RightParen)) {
          do {
            this.skipNewlines();
            if (this.check(TokenType.RightParen)) break;
            args.push(this.parseExpression());
            this.skipNewlines();
          } while (this.match(TokenType.Comma));
        }
        this.consume(TokenType.RightParen, "Expected ')' after arguments.");
        expr = {
          type: "CallExpression",
          callee: expr,
          arguments: args,
          location: expr.location
        };
        continue;
      }
      break;
    }
    return expr;
  }

  private parsePrimary(): Expression {
    const token = this.peek();

    // 1. Numbers
    if (this.match(TokenType.Number)) {
      return {
        type: "NumberLiteral",
        value: this.previous().value,
        location: token.location
      };
    }

    // 2. Strings
    if (this.match(TokenType.String)) {
      return {
        type: "StringLiteral",
        value: this.previous().value,
        location: token.location
      };
    }

    // 3. Booleans
    if (this.match(TokenType.Boolean)) {
      return {
        type: "BooleanLiteral",
        value: this.previous().value,
        location: token.location
      };
    }

    // 4. Nothing
    if (this.match(TokenType.Nothing)) {
      return {
        type: "NothingLiteral",
        location: token.location
      };
    }

    // 5. Parenthesized expression: (expr)
    if (this.match(TokenType.LeftParen)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RightParen, "I expected a closing ')' here.");
      return expr;
    }

    // 6. List literal: [a, b, c]
    if (this.match(TokenType.LeftBracket)) {
      const elements: Expression[] = [];
      if (!this.check(TokenType.RightBracket)) {
        do {
          this.skipNewlines();
          if (this.check(TokenType.RightBracket)) break;
          elements.push(this.parseExpression());
          this.skipNewlines();
        } while (this.match(TokenType.Comma));
      }
      this.consume(TokenType.RightBracket, "I expected a closing ']' for the list.");
      return {
        type: "ListLiteral",
        elements,
        location: token.location
      };
    }

    // 6b. Dictionary literal: { "a": 1, b: 2 }
    if (this.match(TokenType.LeftBrace)) {
      const entries: DictionaryEntry[] = [];
      this.skipNewlines();
      if (!this.check(TokenType.RightBrace)) {
        do {
          this.skipNewlines();
          if (this.check(TokenType.RightBrace)) break;
          let key = "";
          if (this.check(TokenType.String) || this.isWord(this.peek())) {
            key = String(this.advance().value);
          } else {
            throw new PlainError("Expected key name in dictionary.", this.peek().location, { kind: "ParserError", sourceCode: this.source });
          }
          this.consume(TokenType.Colon, "Expected ':' after dictionary key.");
          const value = this.parseExpression();
          entries.push({ key, value });
          this.skipNewlines();
        } while (this.match(TokenType.Comma));
      }
      this.skipNewlines();
      this.consume(TokenType.RightBrace, "Expected closing '}' for dictionary.");
      return {
        type: "DictionaryLiteral",
        entries,
        location: token.location
      };
    }

    // 7. 'item N of list'
    if (this.match(TokenType.Item)) {
      const index = this.parseUnary(); // e.g. 2 or (x + 1)
      this.consume(TokenType.Of, "I expected 'of' after the item number in 'item N of list'.");
      const list = this.parseUnary();
      return {
        type: "ItemOfExpression",
        index,
        list,
        location: token.location
      };
    }

    // 8. Special English multi-word function calls:
    // "to number", "to text"
    if (this.check(TokenType.To)) {
      const next = this.peekNext();
      if (next && next.type === TokenType.Identifier && (next.value === "number" || next.value === "text")) {
        this.advance(); // consume 'to'
        const fnName = this.advance().value === "number" ? "to_number" : "to_text";
        return this.parseFunctionCallArgs(fnName, token.location);
      }
    }

    // "starts with"
    if (this.checkWord("starts")) {
      const next = this.peekNext();
      if (next && (next.value === "with" || next.type === TokenType.Identifier)) {
        this.advance(); // consume 'starts'
        this.advance(); // consume 'with'
        return this.parseFunctionCallArgs("starts_with", token.location);
      }
    }

    // "ends with"
    if (this.checkWord("ends")) {
      const next = this.peekNext();
      if (next && (next.value === "with" || next.type === TokenType.Identifier)) {
        this.advance(); // consume 'ends'
        this.advance(); // consume 'with'
        return this.parseFunctionCallArgs("ends_with", token.location);
      }
    }

    // "random between"
    if (this.checkWord("random")) {
      const next = this.peekNext();
      if (next && (next.value === "between" || next.type === TokenType.Identifier)) {
        this.advance(); // consume 'random'
        this.advance(); // consume 'between'
        return this.parseFunctionCallArgs("random_between", token.location);
      }
    }

    // "days between"
    if (this.checkWord("days")) {
      const next = this.peekNext();
      if (next && (next.value === "between" || next.type === TokenType.Identifier)) {
        this.advance(); // consume 'days'
        this.advance(); // consume 'between'
        return this.parseFunctionCallArgs("days_between", token.location);
      }
    }

    // "current time"
    if (this.checkWord("current")) {
      const next = this.peekNext();
      if (next && (next.value === "time" || next.type === TokenType.Identifier)) {
        this.advance(); // consume 'current'
        this.advance(); // consume 'time'
        if (this.match(TokenType.LeftParen)) {
          this.consume(TokenType.RightParen, "I expected ')' after 'current time()'.");
        }
        return {
          type: "CallExpression",
          callee: "current_time",
          arguments: [],
          location: token.location
        };
      }
    }

    // "read file"
    if (this.checkWord("read")) {
      const next = this.peekNext();
      if (next && (next.value === "file" || next.type === TokenType.Identifier)) {
        this.advance(); // consume 'read'
        this.advance(); // consume 'file'
        return this.parseFunctionCallArgs("read_file", token.location);
      }
    }

    // "write file"
    if (this.checkWord("write")) {
      const next = this.peekNext();
      if (next && (next.value === "file" || next.type === TokenType.Identifier)) {
        this.advance(); // consume 'write'
        this.advance(); // consume 'file'
        return this.parseFunctionCallArgs("write_file", token.location);
      }
    }

    // "file exists"
    if (this.checkWord("file")) {
      const next = this.peekNext();
      if (next && (next.value === "exists" || next.type === TokenType.Identifier)) {
        this.advance(); // consume 'file'
        this.advance(); // consume 'exists'
        return this.parseFunctionCallArgs("file_exists", token.location);
      }
    }

    // 9. Identifiers, functions, or words
    if (this.isWord(token)) {
      const nameToken = this.advance();
      const name = nameToken.raw;

      // 9a. Parenthesized function call: foo(a, b)
      if (this.match(TokenType.LeftParen)) {
        const args: Expression[] = [];
        if (!this.check(TokenType.RightParen)) {
          do {
            this.skipNewlines();
            if (this.check(TokenType.RightParen)) break;
            args.push(this.parseExpression());
            this.skipNewlines();
          } while (this.match(TokenType.Comma));
        }
        this.consume(TokenType.RightParen, `I expected a closing ')' for function '${name}'.`);
        return {
          type: "CallExpression",
          callee: name,
          arguments: args,
          location: token.location
        };
      }

      // 9b. Natural unparenthesized function call:
      // e.g. `double 12`, `add 4 and 6`, `greet "Alex"`
      // Check if the next token on the same line can start an argument
      if (this.canStartArgument()) {
        const args: Expression[] = [];
        const firstArg = this.parseUnary();
        args.push(firstArg);

        // Check if there are more arguments separated by 'and' or commas:
        // e.g. `add 4 and 6`
        while (this.match(TokenType.And) || this.match(TokenType.Comma)) {
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

      // Just a variable identifier
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

  private parseFunctionCallArgs(callee: string, loc: SourceLocation): CallExpression {
    const args: Expression[] = [];

    if (this.match(TokenType.LeftParen)) {
      if (!this.check(TokenType.RightParen)) {
        do {
          this.skipNewlines();
          if (this.check(TokenType.RightParen)) break;
          args.push(this.parseExpression());
          this.skipNewlines();
        } while (this.match(TokenType.Comma));
      }
      this.consume(TokenType.RightParen, `I expected a closing ')' for '${callee}'.`);
    } else if (this.canStartArgument()) {
      args.push(this.parseUnary());
      while (this.match(TokenType.And) || this.match(TokenType.Comma)) {
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

  private canStartArgument(): boolean {
    if (this.isAtStatementEnd()) return false;
    const type = this.peek().type;
    return (
      type === TokenType.Number ||
      type === TokenType.String ||
      type === TokenType.Boolean ||
      type === TokenType.Nothing ||
      type === TokenType.LeftParen ||
      type === TokenType.Identifier ||
      type === TokenType.Item
    );
  }

  private checkWord(word: string): boolean {
    const tok = this.peek();
    return (
      tok.type === TokenType.Identifier &&
      typeof tok.value === "string" &&
      tok.value.toLowerCase() === word.toLowerCase()
    );
  }

  // ==========================================
  // Helper methods
  // ==========================================

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNext(): Token | undefined {
    if (this.current + 1 < this.tokens.length) {
      return this.tokens[this.current + 1];
    }
    return undefined;
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, errorMessage: string): Token {
    if (this.check(type)) return this.advance();
    throw new PlainError(errorMessage, this.peek().location, {
      kind: "ParserError",
      sourceCode: this.source
    });
  }

  private skipNewlines(): void {
    while (!this.isAtEnd() && this.peek().type === TokenType.Newline) {
      this.advance();
    }
  }

  private isAtStatementEnd(): boolean {
    if (this.isAtEnd()) return true;
    const type = this.peek().type;
    return (
      type === TokenType.Newline ||
      type === TokenType.EOF ||
      type === TokenType.End ||
      type === TokenType.Otherwise ||
      type === TokenType.Then
    );
  }

  private expectStatementEnd(): void {
    if (this.isAtEnd()) return;
    if (this.peek().type === TokenType.Newline) {
      this.advance();
      this.skipNewlines();
      return;
    }
    if (
      this.peek().type === TokenType.End ||
      this.peek().type === TokenType.Otherwise
    ) {
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
}
