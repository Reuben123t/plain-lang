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
const formatter_1 = require("../errors/formatter");
const values_1 = require("../runtime/values");
const help_1 = require("./help");
function startRepl() {
    console.log("==========================================================");
    console.log("             PLAIN Programming Language REPL              ");
    console.log("      Type instructions in simple English, or 'exit'.     ");
    console.log("==========================================================\n");
    const interpreter = new interpreter_1.Interpreter();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "plain> "
    });
    let buffer = "";
    let blockDepth = 0;
    rl.prompt();
    rl.on("line", async (line) => {
        const trimmed = line.trim();
        // Check for exit commands when not in a multi-line block
        if (blockDepth === 0) {
            if (trimmed === "exit" || trimmed === "quit") {
                console.log("Goodbye! Keep coding in PLAIN.");
                rl.close();
                return;
            }
            if (trimmed === "help") {
                console.log((0, help_1.getHelp)());
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
        // Multi-line block detection
        const lower = trimmed.toLowerCase();
        if (lower.startsWith("if ") ||
            lower.startsWith("repeat ") ||
            lower.startsWith("for each ") ||
            lower.startsWith("to ")) {
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
        // Execute accumulated buffer
        const source = buffer;
        buffer = "";
        rl.setPrompt("plain> ");
        try {
            const lexer = new lexer_1.Lexer(source, "<repl>");
            const tokens = lexer.tokenize();
            const parser = new parser_1.Parser(tokens, source, "<repl>");
            const program = parser.parse();
            for (const stmt of program.body) {
                if (stmt.type === "ExpressionStatement") {
                    const val = await interpreter.evaluate(stmt.expression);
                    if (val !== null && val !== undefined) {
                        console.log("=> " + (0, values_1.plainToString)(val));
                    }
                }
                else {
                    await interpreter.executeStatement(stmt);
                }
            }
        }
        catch (err) {
            console.error("\n" + (0, formatter_1.formatError)(err, source) + "\n");
        }
        rl.prompt();
    });
    rl.on("close", () => {
        process.exit(0);
    });
}
//# sourceMappingURL=repl.js.map