import * as readline from "readline";
import { Interpreter } from "../runtime/interpreter";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { formatError } from "../errors/formatter";
import { plainToString } from "../runtime/values";
import { getHelp } from "./help";

export function startRepl(): void {
  console.log("==========================================================");
  console.log("             PLAIN Programming Language REPL              ");
  console.log("      Type instructions in simple English, or 'exit'.     ");
  console.log("==========================================================\n");

  const interpreter = new Interpreter();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "plain> "
  });

  let buffer = "";
  let blockDepth = 0;

  rl.prompt();

  rl.on("line", async (line: string) => {
    const trimmed = line.trim();

    // Check for exit commands when not in a multi-line block
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

    // Multi-line block detection
    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith("if ") ||
      lower.startsWith("repeat ") ||
      lower.startsWith("for each ") ||
      lower.startsWith("to ")
    ) {
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
      const lexer = new Lexer(source, "<repl>");
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens, source, "<repl>");
      const program = parser.parse();

      for (const stmt of program.body) {
        if (stmt.type === "ExpressionStatement") {
          const val = await interpreter.evaluate(stmt.expression);
          if (val !== null && val !== undefined) {
            console.log("=> " + plainToString(val));
          }
        } else {
          await interpreter.executeStatement(stmt);
        }
      }
    } catch (err: any) {
      console.error("\n" + formatError(err, source) + "\n");
    }

    rl.prompt();
  });

  rl.on("close", () => {
    process.exit(0);
  });
}
