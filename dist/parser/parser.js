"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const token_1 = require("../lexer/token");
const plain_error_1 = require("../errors/plain-error");
class Parser {
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
            case token_1.TokenType.Set:
                return this.parseSetStatement();
            case token_1.TokenType.Import:
                return this.parseImportStatement();
            case token_1.TokenType.From:
                return this.parseFromImportStatement();
            case token_1.TokenType.Def:
                return this.parseFunctionDefStatement();
            case token_1.TokenType.Return:
                return this.parseReturnStatement();
            case token_1.TokenType.While:
                return this.parseWhileStatement();
            case token_1.TokenType.Say:
                return this.parseSayStatement();
            case token_1.TokenType.Show:
                return this.parseShowStatement();
            case token_1.TokenType.Ask:
                return this.parseAskStatement();
            case token_1.TokenType.Clear:
                return this.parseClearStatement();
            case token_1.TokenType.If:
                return this.parseIfStatement();
            case token_1.TokenType.Repeat:
                return this.parseRepeatStatement();
            case token_1.TokenType.For:
                return this.parseForEachStatement();
            case token_1.TokenType.To:
                return this.parseFunctionDefStatement();
            case token_1.TokenType.Give:
                return this.parseReturnStatement();
            case token_1.TokenType.Add:
                return this.parseListAddStatement();
            case token_1.TokenType.Remove:
                return this.parseListRemoveStatement();
            case token_1.TokenType.Wait:
                return this.parseWaitStatement();
            case token_1.TokenType.Identifier: {
                const next = this.peekNext();
                if (next &&
                    (next.type === token_1.TokenType.Equal ||
                        next.type === token_1.TokenType.PlusEqual ||
                        next.type === token_1.TokenType.MinusEqual ||
                        next.type === token_1.TokenType.StarEqual ||
                        next.type === token_1.TokenType.SlashEqual)) {
                    return this.parseAssignmentStatement();
                }
                return this.parseExpressionStatement();
            }
            default:
                // Could be an expression statement or unparenthesized function call like `greet "Alex"`
                return this.parseExpressionStatement();
        }
    }
    parseSetStatement() {
        const setToken = this.advance(); // consume 'set'
        if (this.isAtEnd() || this.peek().type !== token_1.TokenType.Identifier) {
            throw new plain_error_1.PlainError(`I expected a variable name after 'set'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: set score to 100"
            });
        }
        const nameToken = this.advance();
        const varName = nameToken.value;
        if (!this.match(token_1.TokenType.To)) {
            throw new plain_error_1.PlainError(`I expected 'to' after the variable name in 'set ${varName} to ...'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: `Write 'set ${varName} to <value>'`
            });
        }
        if (this.isAtStatementEnd()) {
            throw new plain_error_1.PlainError(`I expected a value after 'set ${varName} to'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: `Provide a value, such as: set ${varName} to 10`
            });
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
    parseAssignmentStatement() {
        const nameToken = this.advance(); // consume identifier
        const opToken = this.advance(); // consume =, +=, -=, *=, /=
        let operator = "=";
        switch (opToken.type) {
            case token_1.TokenType.Equal:
                operator = "=";
                break;
            case token_1.TokenType.PlusEqual:
                operator = "+=";
                break;
            case token_1.TokenType.MinusEqual:
                operator = "-=";
                break;
            case token_1.TokenType.StarEqual:
                operator = "*=";
                break;
            case token_1.TokenType.SlashEqual:
                operator = "/=";
                break;
            default:
                operator = "=";
                break;
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
    parseImportStatement() {
        const importToken = this.advance(); // consume 'import'
        let source = "";
        if (this.check(token_1.TokenType.String)) {
            source = this.advance().value;
        }
        else if (this.isWord(this.peek())) {
            source = this.advance().raw || this.previous().value;
        }
        else {
            throw new plain_error_1.PlainError("Expected module name or file path after 'import'.", this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: import math or import \"./utils.plain\""
            });
        }
        let alias;
        if (this.match(token_1.TokenType.As)) {
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
    parseFromImportStatement() {
        const fromToken = this.advance(); // consume 'from'
        let source = "";
        if (this.check(token_1.TokenType.String)) {
            source = this.advance().value;
        }
        else if (this.isWord(this.peek())) {
            source = this.advance().raw;
        }
        this.consume(token_1.TokenType.Import, "Expected 'import' after 'from <module>'.");
        const symbols = [];
        do {
            if (this.isWord(this.peek())) {
                symbols.push(this.advance().raw);
            }
        } while (this.match(token_1.TokenType.Comma));
        this.expectStatementEnd();
        return {
            type: "ImportStatement",
            source,
            symbols,
            location: fromToken.location
        };
    }
    parseWhileStatement() {
        const token = this.advance(); // consume 'while'
        const condition = this.parseExpression();
        if (this.check(token_1.TokenType.Colon) || this.check(token_1.TokenType.Then)) {
            this.advance();
        }
        this.expectStatementEnd();
        const body = [];
        while (!this.isAtEnd() && !this.check(token_1.TokenType.End)) {
            this.skipNewlines();
            if (this.check(token_1.TokenType.End))
                break;
            body.push(this.parseStatement());
            this.skipNewlines();
        }
        if (!this.match(token_1.TokenType.End)) {
            throw new plain_error_1.PlainError(`You started a 'while' loop on line ${token.location.line}, but didn't close it with 'end'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Add 'end' to close the while loop."
            });
        }
        this.expectStatementEnd();
        return {
            type: "RepeatWhileStatement",
            condition,
            body,
            location: token.location
        };
    }
    parseSayStatement() {
        const token = this.advance(); // consume 'say'
        if (this.isAtStatementEnd()) {
            throw new plain_error_1.PlainError(`I expected something to say after 'say'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: 'Example: say "Hello, world!"'
            });
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
        const token = this.advance(); // consume 'show'
        if (this.isAtStatementEnd()) {
            throw new plain_error_1.PlainError(`I expected something to show after 'show'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: show total"
            });
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
        const token = this.advance(); // consume 'ask'
        if (this.isAtStatementEnd()) {
            throw new plain_error_1.PlainError(`I expected a prompt message after 'ask'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: 'Example: ask "What is your name?" and save as name'
            });
        }
        const prompt = this.parseExpression();
        let targetVariable;
        // Check for "and save as <name>"
        if (this.check(token_1.TokenType.And)) {
            this.advance(); // consume 'and'
            if (!this.match(token_1.TokenType.Save)) {
                throw new plain_error_1.PlainError(`I expected 'save as' after 'and' in ask statement.`, this.peek().location, {
                    kind: "ParserError",
                    sourceCode: this.source,
                    suggestion: 'Pattern: ask "Prompt" and save as variable_name'
                });
            }
            if (!this.match(token_1.TokenType.As)) {
                throw new plain_error_1.PlainError(`I expected 'as' after 'save' in ask statement.`, this.peek().location, {
                    kind: "ParserError",
                    sourceCode: this.source,
                    suggestion: 'Pattern: ask "Prompt" and save as variable_name'
                });
            }
            if (!this.check(token_1.TokenType.Identifier)) {
                throw new plain_error_1.PlainError(`I expected a variable name to store the answer.`, this.peek().location, {
                    kind: "ParserError",
                    sourceCode: this.source,
                    suggestion: 'Example: ask "Your name?" and save as username'
                });
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
        const token = this.advance(); // consume 'clear'
        if (!this.match(token_1.TokenType.Screen)) {
            throw new plain_error_1.PlainError(`I expected 'screen' after 'clear'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Write 'clear screen' to wipe the terminal display."
            });
        }
        this.expectStatementEnd();
        return {
            type: "ClearScreenStatement",
            location: token.location
        };
    }
    parseIfStatement() {
        const token = this.advance(); // consume 'if'
        const condition = this.parseExpression();
        // 'then' or ':' is optional for friendliness, but match if present
        this.match(token_1.TokenType.Then);
        if (this.check(token_1.TokenType.Colon))
            this.advance();
        this.expectStatementEnd();
        const consequent = [];
        const otherwiseIfBranches = [];
        let alternate;
        while (!this.isAtEnd() && !this.check(token_1.TokenType.Otherwise) && !this.check(token_1.TokenType.End)) {
            this.skipNewlines();
            if (this.check(token_1.TokenType.Otherwise) || this.check(token_1.TokenType.End))
                break;
            consequent.push(this.parseStatement());
            this.skipNewlines();
        }
        while (this.match(token_1.TokenType.Otherwise)) {
            if (this.match(token_1.TokenType.If)) {
                const branchLoc = this.previous().location;
                const branchCond = this.parseExpression();
                this.match(token_1.TokenType.Then);
                if (this.check(token_1.TokenType.Colon))
                    this.advance();
                this.expectStatementEnd();
                const branchBody = [];
                while (!this.isAtEnd() && !this.check(token_1.TokenType.Otherwise) && !this.check(token_1.TokenType.End)) {
                    this.skipNewlines();
                    if (this.check(token_1.TokenType.Otherwise) || this.check(token_1.TokenType.End))
                        break;
                    branchBody.push(this.parseStatement());
                    this.skipNewlines();
                }
                otherwiseIfBranches.push({
                    condition: branchCond,
                    body: branchBody,
                    location: branchLoc
                });
            }
            else {
                // Simple otherwise / else block
                if (this.check(token_1.TokenType.Colon))
                    this.advance();
                this.expectStatementEnd();
                alternate = [];
                while (!this.isAtEnd() && !this.check(token_1.TokenType.End)) {
                    this.skipNewlines();
                    if (this.check(token_1.TokenType.End))
                        break;
                    alternate.push(this.parseStatement());
                    this.skipNewlines();
                }
                break;
            }
        }
        if (!this.match(token_1.TokenType.End)) {
            throw new plain_error_1.PlainError(`You started an 'if' block on line ${token.location.line}, but forgot to close it with 'end'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Add 'end' after your if/otherwise block."
            });
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
        const token = this.advance(); // consume 'repeat'
        if (this.match(token_1.TokenType.While)) {
            const condition = this.parseExpression();
            this.expectStatementEnd();
            const body = [];
            while (!this.isAtEnd() && !this.check(token_1.TokenType.End)) {
                this.skipNewlines();
                if (this.check(token_1.TokenType.End))
                    break;
                body.push(this.parseStatement());
                this.skipNewlines();
            }
            if (!this.match(token_1.TokenType.End)) {
                throw new plain_error_1.PlainError(`You started a 'repeat while' loop on line ${token.location.line}, but didn't close it with 'end'.`, this.peek().location, {
                    kind: "ParserError",
                    sourceCode: this.source,
                    suggestion: "Add 'end' to close the repeat while loop."
                });
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
        let count;
        try {
            count = this.parseExpression();
        }
        finally {
            this.inRepeatCount = false;
        }
        if (!this.match(token_1.TokenType.Times)) {
            throw new plain_error_1.PlainError(`I expected 'times' after the number in 'repeat ... times'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: repeat 5 times\n    say \"Hello\"\nend"
            });
        }
        this.expectStatementEnd();
        const body = [];
        while (!this.isAtEnd() && !this.check(token_1.TokenType.End)) {
            this.skipNewlines();
            if (this.check(token_1.TokenType.End))
                break;
            body.push(this.parseStatement());
            this.skipNewlines();
        }
        if (!this.match(token_1.TokenType.End)) {
            throw new plain_error_1.PlainError(`You started a 'repeat' loop on line ${token.location.line}, but didn't close it with 'end'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Add 'end' to close the repeat loop."
            });
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
        const token = this.advance(); // consume 'for'
        // 'each' is optional so both 'for each x in list' and 'for x in list' work!
        this.match(token_1.TokenType.Each);
        if (!this.check(token_1.TokenType.Identifier)) {
            throw new plain_error_1.PlainError(`I expected an item variable name after 'for'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: for item in items or for each score in scores"
            });
        }
        const itemVariable = this.advance().value;
        if (!this.match(token_1.TokenType.In)) {
            throw new plain_error_1.PlainError(`I expected 'in' after the item variable '${itemVariable}'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: `Example: for each ${itemVariable} in my_list`
            });
        }
        const list = this.parseExpression();
        if (this.check(token_1.TokenType.Colon))
            this.advance();
        this.expectStatementEnd();
        const body = [];
        while (!this.isAtEnd() && !this.check(token_1.TokenType.End)) {
            this.skipNewlines();
            if (this.check(token_1.TokenType.End))
                break;
            body.push(this.parseStatement());
            this.skipNewlines();
        }
        if (!this.match(token_1.TokenType.End)) {
            throw new plain_error_1.PlainError(`You started a 'for each' loop on line ${token.location.line}, but didn't close it with 'end'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Add 'end' to close the loop."
            });
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
        return (token.type === token_1.TokenType.Identifier ||
            token.type === token_1.TokenType.Add ||
            token.type === token_1.TokenType.Remove ||
            token.type === token_1.TokenType.Item ||
            token.type === token_1.TokenType.Ask ||
            token.type === token_1.TokenType.Show ||
            token.type === token_1.TokenType.Wait ||
            token.type === token_1.TokenType.Clear);
    }
    parseFunctionDefStatement() {
        const token = this.advance(); // consume 'to' or 'def'
        if (!this.isWord(this.peek())) {
            throw new plain_error_1.PlainError(`I expected a function name after '${token.raw}'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: 'Example: def greet(person): say "Hello " + person end or to greet person give back "Hello" end'
            });
        }
        const name = this.advance().raw;
        const parameters = [];
        // Check if parameters are in parentheses: def foo(a, b) or to foo(a, b)
        if (this.match(token_1.TokenType.LeftParen)) {
            if (!this.check(token_1.TokenType.RightParen)) {
                do {
                    if (!this.isWord(this.peek())) {
                        throw new plain_error_1.PlainError(`I expected a parameter name in the parameter list.`, this.peek().location, { kind: "ParserError", sourceCode: this.source });
                    }
                    parameters.push(this.advance().raw);
                } while (this.match(token_1.TokenType.Comma));
            }
            this.consume(token_1.TokenType.RightParen, "I expected ')' after function parameters.");
        }
        else {
            // Natural English parameters:
            // to greet person
            // to add first and second
            // to calculate a and b and c
            while (!this.isAtStatementEnd()) {
                if (this.isWord(this.peek())) {
                    parameters.push(this.advance().raw);
                    // If followed by 'and', consume 'and'
                    if (this.check(token_1.TokenType.And)) {
                        this.advance();
                    }
                    else if (this.check(token_1.TokenType.Comma)) {
                        this.advance();
                    }
                }
                else {
                    break;
                }
            }
        }
        if (this.check(token_1.TokenType.Colon)) {
            this.advance();
        }
        this.expectStatementEnd();
        const body = [];
        while (!this.isAtEnd() && !this.check(token_1.TokenType.End)) {
            this.skipNewlines();
            if (this.check(token_1.TokenType.End))
                break;
            body.push(this.parseStatement());
            this.skipNewlines();
        }
        if (!this.match(token_1.TokenType.End)) {
            throw new plain_error_1.PlainError(`You defined the function '${name}' on line ${token.location.line}, but didn't close it with 'end'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Add 'end' at the end of the function definition."
            });
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
        const token = this.advance(); // consume 'give' or 'return'
        if (token.type === token_1.TokenType.Give) {
            if (!this.match(token_1.TokenType.Back)) {
                throw new plain_error_1.PlainError(`I expected 'back' after 'give'.`, this.peek().location, {
                    kind: "ParserError",
                    sourceCode: this.source,
                    suggestion: "Write 'give back <value>' or 'return <value>' to return a result."
                });
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
    parseListAddStatement() {
        const token = this.advance(); // consume 'add'
        const value = this.parseExpression();
        if (!this.match(token_1.TokenType.To)) {
            throw new plain_error_1.PlainError(`I expected 'to' after the value in 'add ... to <list>'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: add 90 to scores"
            });
        }
        if (!this.check(token_1.TokenType.Identifier)) {
            throw new plain_error_1.PlainError(`I expected the name of the list variable after 'to'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: add 90 to scores"
            });
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
        const token = this.advance(); // consume 'remove'
        const value = this.parseExpression();
        if (!this.match(token_1.TokenType.From)) {
            throw new plain_error_1.PlainError(`I expected 'from' after the value in 'remove ... from <list>'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: remove \"green\" from colors"
            });
        }
        if (!this.check(token_1.TokenType.Identifier)) {
            throw new plain_error_1.PlainError(`I expected the name of the list variable after 'from'.`, this.peek().location, {
                kind: "ParserError",
                sourceCode: this.source,
                suggestion: "Example: remove \"green\" from colors"
            });
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
        const token = this.advance(); // consume 'wait'
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
        while (this.match(token_1.TokenType.Or)) {
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
        while (this.check(token_1.TokenType.And)) {
            const next = this.peekNext();
            if (next && next.type === token_1.TokenType.Save) {
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
    parseComparison() {
        let left = this.parseAdditive();
        // Check English comparison phrases or symbols
        while (true) {
            if (this.match(token_1.TokenType.EqualEqual)) {
                const right = this.parseAdditive();
                left = { type: "BinaryExpression", operator: "==", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.BangEqual)) {
                const right = this.parseAdditive();
                left = { type: "BinaryExpression", operator: "!=", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.LessSign)) {
                const right = this.parseAdditive();
                left = { type: "BinaryExpression", operator: "<", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.GreaterSign)) {
                const right = this.parseAdditive();
                left = { type: "BinaryExpression", operator: ">", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.LessEqual)) {
                const right = this.parseAdditive();
                left = { type: "BinaryExpression", operator: "<=", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.GreaterEqual)) {
                const right = this.parseAdditive();
                left = { type: "BinaryExpression", operator: ">=", left, right, location: left.location };
                continue;
            }
            // Check "is ..." phrases
            if (this.check(token_1.TokenType.Is)) {
                const isToken = this.advance(); // consume 'is'
                if (this.match(token_1.TokenType.Equal)) {
                    this.match(token_1.TokenType.To); // optional 'to'
                    const right = this.parseAdditive();
                    left = { type: "BinaryExpression", operator: "==", left, right, location: isToken.location };
                    continue;
                }
                if (this.match(token_1.TokenType.Not)) {
                    if (this.match(token_1.TokenType.Equal)) {
                        this.match(token_1.TokenType.To);
                    }
                    const right = this.parseAdditive();
                    left = { type: "BinaryExpression", operator: "!=", left, right, location: isToken.location };
                    continue;
                }
                if (this.match(token_1.TokenType.Greater)) {
                    this.consume(token_1.TokenType.Than, "I expected 'than' after 'greater'.");
                    const right = this.parseAdditive();
                    left = { type: "BinaryExpression", operator: ">", left, right, location: isToken.location };
                    continue;
                }
                if (this.match(token_1.TokenType.Less)) {
                    this.consume(token_1.TokenType.Than, "I expected 'than' after 'less'.");
                    const right = this.parseAdditive();
                    left = { type: "BinaryExpression", operator: "<", left, right, location: isToken.location };
                    continue;
                }
                if (this.match(token_1.TokenType.At)) {
                    if (this.match(token_1.TokenType.Least)) {
                        const right = this.parseAdditive();
                        left = { type: "BinaryExpression", operator: ">=", left, right, location: isToken.location };
                        continue;
                    }
                    if (this.match(token_1.TokenType.Most)) {
                        const right = this.parseAdditive();
                        left = { type: "BinaryExpression", operator: "<=", left, right, location: isToken.location };
                        continue;
                    }
                    throw new plain_error_1.PlainError(`I expected 'least' or 'most' after 'is at'.`, this.peek().location, { kind: "ParserError", sourceCode: this.source, suggestion: "Use 'is at least' or 'is at most'." });
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
    parseAdditive() {
        let left = this.parseMultiplicative();
        while (this.match(token_1.TokenType.Plus, token_1.TokenType.PlusSign, token_1.TokenType.Minus, token_1.TokenType.MinusSign)) {
            const opToken = this.previous();
            const operator = opToken.type === token_1.TokenType.Plus || opToken.type === token_1.TokenType.PlusSign ? "+" : "-";
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
            if (this.match(token_1.TokenType.StarStar)) {
                const right = this.parseUnary();
                left = { type: "BinaryExpression", operator: "**", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.SlashSlash)) {
                const right = this.parseUnary();
                left = { type: "BinaryExpression", operator: "//", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.StarSign)) {
                const right = this.parseUnary();
                left = { type: "BinaryExpression", operator: "*", left, right, location: left.location };
                continue;
            }
            if (!this.inRepeatCount && this.match(token_1.TokenType.Times)) {
                const right = this.parseUnary();
                left = { type: "BinaryExpression", operator: "*", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.SlashSign)) {
                const right = this.parseUnary();
                left = { type: "BinaryExpression", operator: "/", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.Divided)) {
                this.consume(token_1.TokenType.By, "I expected 'by' after 'divided'.");
                const right = this.parseUnary();
                left = { type: "BinaryExpression", operator: "/", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.PercentSign)) {
                const right = this.parseUnary();
                left = { type: "BinaryExpression", operator: "%", left, right, location: left.location };
                continue;
            }
            if (this.match(token_1.TokenType.Remainder)) {
                this.consume(token_1.TokenType.Of, "I expected 'of' after 'remainder'.");
                const right = this.parseUnary();
                left = { type: "BinaryExpression", operator: "%", left, right, location: left.location };
                continue;
            }
            break;
        }
        return left;
    }
    parseUnary() {
        if (this.match(token_1.TokenType.Not)) {
            const token = this.previous();
            const argument = this.parseUnary();
            return {
                type: "UnaryExpression",
                operator: "not",
                argument,
                location: token.location
            };
        }
        if (this.match(token_1.TokenType.MinusSign)) {
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
    parsePostfix() {
        let expr = this.parsePrimary();
        while (true) {
            if (this.match(token_1.TokenType.LeftBracket)) {
                const index = this.parseExpression();
                this.consume(token_1.TokenType.RightBracket, "Expected ']' after index.");
                expr = {
                    type: "IndexExpression",
                    object: expr,
                    index,
                    location: expr.location
                };
                continue;
            }
            if (this.match(token_1.TokenType.Dot)) {
                if (!this.isWord(this.peek())) {
                    throw new plain_error_1.PlainError("Expected property name after '.'.", this.peek().location, { kind: "ParserError", sourceCode: this.source });
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
            if (this.match(token_1.TokenType.LeftParen)) {
                const args = [];
                if (!this.check(token_1.TokenType.RightParen)) {
                    do {
                        this.skipNewlines();
                        if (this.check(token_1.TokenType.RightParen))
                            break;
                        args.push(this.parseExpression());
                        this.skipNewlines();
                    } while (this.match(token_1.TokenType.Comma));
                }
                this.consume(token_1.TokenType.RightParen, "Expected ')' after arguments.");
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
    parsePrimary() {
        const token = this.peek();
        // 1. Numbers
        if (this.match(token_1.TokenType.Number)) {
            return {
                type: "NumberLiteral",
                value: this.previous().value,
                location: token.location
            };
        }
        // 2. Strings
        if (this.match(token_1.TokenType.String)) {
            return {
                type: "StringLiteral",
                value: this.previous().value,
                location: token.location
            };
        }
        // 3. Booleans
        if (this.match(token_1.TokenType.Boolean)) {
            return {
                type: "BooleanLiteral",
                value: this.previous().value,
                location: token.location
            };
        }
        // 4. Nothing
        if (this.match(token_1.TokenType.Nothing)) {
            return {
                type: "NothingLiteral",
                location: token.location
            };
        }
        // 5. Parenthesized expression: (expr)
        if (this.match(token_1.TokenType.LeftParen)) {
            const expr = this.parseExpression();
            this.consume(token_1.TokenType.RightParen, "I expected a closing ')' here.");
            return expr;
        }
        // 6. List literal: [a, b, c]
        if (this.match(token_1.TokenType.LeftBracket)) {
            const elements = [];
            if (!this.check(token_1.TokenType.RightBracket)) {
                do {
                    this.skipNewlines();
                    if (this.check(token_1.TokenType.RightBracket))
                        break;
                    elements.push(this.parseExpression());
                    this.skipNewlines();
                } while (this.match(token_1.TokenType.Comma));
            }
            this.consume(token_1.TokenType.RightBracket, "I expected a closing ']' for the list.");
            return {
                type: "ListLiteral",
                elements,
                location: token.location
            };
        }
        // 6b. Dictionary literal: { "a": 1, b: 2 }
        if (this.match(token_1.TokenType.LeftBrace)) {
            const entries = [];
            this.skipNewlines();
            if (!this.check(token_1.TokenType.RightBrace)) {
                do {
                    this.skipNewlines();
                    if (this.check(token_1.TokenType.RightBrace))
                        break;
                    let key = "";
                    if (this.check(token_1.TokenType.String) || this.isWord(this.peek())) {
                        key = String(this.advance().value);
                    }
                    else {
                        throw new plain_error_1.PlainError("Expected key name in dictionary.", this.peek().location, { kind: "ParserError", sourceCode: this.source });
                    }
                    this.consume(token_1.TokenType.Colon, "Expected ':' after dictionary key.");
                    const value = this.parseExpression();
                    entries.push({ key, value });
                    this.skipNewlines();
                } while (this.match(token_1.TokenType.Comma));
            }
            this.skipNewlines();
            this.consume(token_1.TokenType.RightBrace, "Expected closing '}' for dictionary.");
            return {
                type: "DictionaryLiteral",
                entries,
                location: token.location
            };
        }
        // 7. 'item N of list'
        if (this.match(token_1.TokenType.Item)) {
            const index = this.parseUnary(); // e.g. 2 or (x + 1)
            this.consume(token_1.TokenType.Of, "I expected 'of' after the item number in 'item N of list'.");
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
        if (this.check(token_1.TokenType.To)) {
            const next = this.peekNext();
            if (next && next.type === token_1.TokenType.Identifier && (next.value === "number" || next.value === "text")) {
                this.advance(); // consume 'to'
                const fnName = this.advance().value === "number" ? "to_number" : "to_text";
                return this.parseFunctionCallArgs(fnName, token.location);
            }
        }
        // "starts with"
        if (this.checkWord("starts")) {
            const next = this.peekNext();
            if (next && (next.value === "with" || next.type === token_1.TokenType.Identifier)) {
                this.advance(); // consume 'starts'
                this.advance(); // consume 'with'
                return this.parseFunctionCallArgs("starts_with", token.location);
            }
        }
        // "ends with"
        if (this.checkWord("ends")) {
            const next = this.peekNext();
            if (next && (next.value === "with" || next.type === token_1.TokenType.Identifier)) {
                this.advance(); // consume 'ends'
                this.advance(); // consume 'with'
                return this.parseFunctionCallArgs("ends_with", token.location);
            }
        }
        // "random between"
        if (this.checkWord("random")) {
            const next = this.peekNext();
            if (next && (next.value === "between" || next.type === token_1.TokenType.Identifier)) {
                this.advance(); // consume 'random'
                this.advance(); // consume 'between'
                return this.parseFunctionCallArgs("random_between", token.location);
            }
        }
        // "days between"
        if (this.checkWord("days")) {
            const next = this.peekNext();
            if (next && (next.value === "between" || next.type === token_1.TokenType.Identifier)) {
                this.advance(); // consume 'days'
                this.advance(); // consume 'between'
                return this.parseFunctionCallArgs("days_between", token.location);
            }
        }
        // "current time"
        if (this.checkWord("current")) {
            const next = this.peekNext();
            if (next && (next.value === "time" || next.type === token_1.TokenType.Identifier)) {
                this.advance(); // consume 'current'
                this.advance(); // consume 'time'
                if (this.match(token_1.TokenType.LeftParen)) {
                    this.consume(token_1.TokenType.RightParen, "I expected ')' after 'current time()'.");
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
            if (next && (next.value === "file" || next.type === token_1.TokenType.Identifier)) {
                this.advance(); // consume 'read'
                this.advance(); // consume 'file'
                return this.parseFunctionCallArgs("read_file", token.location);
            }
        }
        // "write file"
        if (this.checkWord("write")) {
            const next = this.peekNext();
            if (next && (next.value === "file" || next.type === token_1.TokenType.Identifier)) {
                this.advance(); // consume 'write'
                this.advance(); // consume 'file'
                return this.parseFunctionCallArgs("write_file", token.location);
            }
        }
        // "file exists"
        if (this.checkWord("file")) {
            const next = this.peekNext();
            if (next && (next.value === "exists" || next.type === token_1.TokenType.Identifier)) {
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
            if (this.match(token_1.TokenType.LeftParen)) {
                const args = [];
                if (!this.check(token_1.TokenType.RightParen)) {
                    do {
                        this.skipNewlines();
                        if (this.check(token_1.TokenType.RightParen))
                            break;
                        args.push(this.parseExpression());
                        this.skipNewlines();
                    } while (this.match(token_1.TokenType.Comma));
                }
                this.consume(token_1.TokenType.RightParen, `I expected a closing ')' for function '${name}'.`);
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
                const args = [];
                const firstArg = this.parseUnary();
                args.push(firstArg);
                // Check if there are more arguments separated by 'and' or commas:
                // e.g. `add 4 and 6`
                while (this.match(token_1.TokenType.And) || this.match(token_1.TokenType.Comma)) {
                    if (this.canStartArgument()) {
                        args.push(this.parseUnary());
                    }
                    else {
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
        throw new plain_error_1.PlainError(`I didn't understand '${token.raw || token.type}' here.`, token.location, {
            kind: "ParserError",
            sourceCode: this.source,
            suggestion: "Check for missing values, quotes, or keywords."
        });
    }
    parseFunctionCallArgs(callee, loc) {
        const args = [];
        if (this.match(token_1.TokenType.LeftParen)) {
            if (!this.check(token_1.TokenType.RightParen)) {
                do {
                    this.skipNewlines();
                    if (this.check(token_1.TokenType.RightParen))
                        break;
                    args.push(this.parseExpression());
                    this.skipNewlines();
                } while (this.match(token_1.TokenType.Comma));
            }
            this.consume(token_1.TokenType.RightParen, `I expected a closing ')' for '${callee}'.`);
        }
        else if (this.canStartArgument()) {
            args.push(this.parseUnary());
            while (this.match(token_1.TokenType.And) || this.match(token_1.TokenType.Comma)) {
                if (this.canStartArgument()) {
                    args.push(this.parseUnary());
                }
                else {
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
        if (this.isAtStatementEnd())
            return false;
        const type = this.peek().type;
        return (type === token_1.TokenType.Number ||
            type === token_1.TokenType.String ||
            type === token_1.TokenType.Boolean ||
            type === token_1.TokenType.Nothing ||
            type === token_1.TokenType.LeftParen ||
            type === token_1.TokenType.Identifier ||
            type === token_1.TokenType.Item);
    }
    checkWord(word) {
        const tok = this.peek();
        return (tok.type === token_1.TokenType.Identifier &&
            typeof tok.value === "string" &&
            tok.value.toLowerCase() === word.toLowerCase());
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
        if (this.isAtEnd())
            return false;
        return this.peek().type === type;
    }
    advance() {
        if (!this.isAtEnd())
            this.current++;
        return this.previous();
    }
    isAtEnd() {
        return this.peek().type === token_1.TokenType.EOF;
    }
    peek() {
        return this.tokens[this.current];
    }
    peekNext() {
        if (this.current + 1 < this.tokens.length) {
            return this.tokens[this.current + 1];
        }
        return undefined;
    }
    previous() {
        return this.tokens[this.current - 1];
    }
    consume(type, errorMessage) {
        if (this.check(type))
            return this.advance();
        throw new plain_error_1.PlainError(errorMessage, this.peek().location, {
            kind: "ParserError",
            sourceCode: this.source
        });
    }
    skipNewlines() {
        while (!this.isAtEnd() && this.peek().type === token_1.TokenType.Newline) {
            this.advance();
        }
    }
    isAtStatementEnd() {
        if (this.isAtEnd())
            return true;
        const type = this.peek().type;
        return (type === token_1.TokenType.Newline ||
            type === token_1.TokenType.EOF ||
            type === token_1.TokenType.End ||
            type === token_1.TokenType.Otherwise ||
            type === token_1.TokenType.Then);
    }
    expectStatementEnd() {
        if (this.isAtEnd())
            return;
        if (this.peek().type === token_1.TokenType.Newline) {
            this.advance();
            this.skipNewlines();
            return;
        }
        if (this.peek().type === token_1.TokenType.End ||
            this.peek().type === token_1.TokenType.Otherwise) {
            return;
        }
        throw new plain_error_1.PlainError(`I expected the instruction to finish here on line ${this.peek().location.line}.`, this.peek().location, {
            kind: "ParserError",
            sourceCode: this.source,
            suggestion: "Each instruction in PLAIN should usually be on its own line."
        });
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map