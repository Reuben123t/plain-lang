"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRepl = startRepl;
const readline = __importStar(require("readline"));
const interpreter_1 = require("../runtime/interpreter");
const lexer_1 = require("../lexer/lexer");
const parser_1 = require("../parser/parser");
const token_1 = require("../lexer/token");
const formatter_1 = require("../errors/formatter");
const values_1 = require("../runtime/values");
const help_1 = require("./help");
function incompleteDepth(source) {
    const tokens = new lexer_1.Lexer(source, "<repl>").tokenize().filter((token) => token.type !== token_1.TokenType.Newline && token.type !== token_1.TokenType.EOF);
    let blocks = 0;
    let delimiters = 0;
    let first = true;
    for (const token of tokens) {
        if (first && [token_1.TokenType.If, token_1.TokenType.Repeat, token_1.TokenType.For, token_1.TokenType.While, token_1.TokenType.Def, token_1.TokenType.To].includes(token.type))
            blocks++;
        if (token.type === token_1.TokenType.End)
            blocks = Math.max(0, blocks - 1);
        if ([token_1.TokenType.LeftParen, token_1.TokenType.LeftBracket, token_1.TokenType.LeftBrace].includes(token.type))
            delimiters++;
        if ([token_1.TokenType.RightParen, token_1.TokenType.RightBracket, token_1.TokenType.RightBrace].includes(token.type))
            delimiters = Math.max(0, delimiters - 1);
        if (token.location.line !== tokens[tokens.indexOf(token) + 1]?.location.line)
            first = true;
        else
            first = false;
    }
    return blocks + delimiters;
}
function startRepl() {
    console.log("==========================================================");
    console.log("             PLAIN Programming Language REPL              ");
    console.log("          Readable syntax • Standard library              ");
    console.log("               Created by Author: Reuben                  ");
    console.log("      Type instructions in simple English, or 'exit'.     ");
    console.log("==========================================================\n");
    const interpreter = new interpreter_1.Interpreter();
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "plain> " });
    let buffer = "";
    let queue = Promise.resolve();
    let hadError = false;
    let closed = false;
    rl.prompt();
    const processLine = async (line) => {
        const trimmed = line.trim();
        if (!buffer && (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit")) {
            rl.close();
            return;
        }
        if (!buffer && trimmed.toLowerCase() === "help") {
            console.log((0, help_1.getHelp)());
            if (!closed)
                rl.prompt();
            return;
        }
        if (!buffer && trimmed.toLowerCase() === "clear") {
            console.clear();
            if (!closed)
                rl.prompt();
            return;
        }
        buffer += line + "\n";
        try {
            const depth = incompleteDepth(buffer);
            if (depth > 0) {
                rl.setPrompt("...   ");
                if (!closed)
                    rl.prompt();
                return;
            }
            const source = buffer;
            buffer = "";
            rl.setPrompt("plain> ");
            console.log();
            const program = new parser_1.Parser(new lexer_1.Lexer(source, "<repl>").tokenize(), source, "<repl>").parse();
            for (const statement of program.body) {
                if (statement.type === "ExpressionStatement") {
                    const value = await interpreter.evaluate(statement.expression);
                    if (value !== null && value !== undefined)
                        console.log("=> " + (0, values_1.plainToString)(value));
                }
                else
                    await interpreter.executeStatement(statement);
            }
        }
        catch (error) {
            hadError = true;
            console.error("\n" + (0, formatter_1.formatError)(error, buffer) + "\n");
            buffer = "";
            rl.setPrompt("plain> ");
        }
        if (!closed)
            rl.prompt();
    };
    rl.on("line", (line) => { queue = queue.then(() => processLine(line)); });
    rl.on("close", () => {
        if (closed)
            return;
        closed = true;
        queue = queue.then(() => {
            if (buffer.trim()) {
                console.error("Incomplete input: expected 'end' or a closing delimiter before end of input.");
                hadError = true;
            }
            if (hadError)
                process.exitCode = 1;
        });
    });
}
//# sourceMappingURL=repl.js.map