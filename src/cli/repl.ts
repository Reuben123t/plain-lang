import * as readline from "readline";
import { Interpreter } from "../runtime/interpreter";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { TokenType } from "../lexer/token";
import { formatError } from "../errors/formatter";
import { plainToString } from "../runtime/values";
import { getHelp } from "./help";

function incompleteDepth(source: string): number {
  const tokens = new Lexer(source, "<repl>").tokenize().filter((token) => token.type !== TokenType.Newline && token.type !== TokenType.EOF);
  let blocks = 0;
  let delimiters = 0;
  let first = true;
  for (const token of tokens) {
    if (first && [TokenType.If, TokenType.Repeat, TokenType.For, TokenType.While, TokenType.Def, TokenType.To].includes(token.type)) blocks++;
    if (token.type === TokenType.End) blocks = Math.max(0, blocks - 1);
    if ([TokenType.LeftParen, TokenType.LeftBracket, TokenType.LeftBrace].includes(token.type)) delimiters++;
    if ([TokenType.RightParen, TokenType.RightBracket, TokenType.RightBrace].includes(token.type)) delimiters = Math.max(0, delimiters - 1);
    if (token.location.line !== tokens[tokens.indexOf(token) + 1]?.location.line) first = true;
    else first = false;
  }
  return blocks + delimiters;
}

export function startRepl(): void {
  console.log("==========================================================");
  console.log("             PLAIN Programming Language REPL              ");
  console.log("          Readable syntax • Standard library              ");
  console.log("               Created by Author: Reuben                  ");
  console.log("      Type instructions in simple English, or 'exit'.     ");
  console.log("==========================================================\n");

  const interpreter = new Interpreter();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "plain> " });
  let buffer = "";
  let queue = Promise.resolve();
  let hadError = false;
  let closed = false;
  rl.prompt();

  const processLine = async (line: string): Promise<void> => {
    const trimmed = line.trim();
    if (!buffer && (trimmed.toLowerCase() === "exit" || trimmed.toLowerCase() === "quit")) { rl.close(); return; }
    if (!buffer && trimmed.toLowerCase() === "help") { console.log(getHelp()); if (!closed) rl.prompt(); return; }
    if (!buffer && trimmed.toLowerCase() === "clear") { console.clear(); if (!closed) rl.prompt(); return; }
    buffer += line + "\n";
    try {
      const depth = incompleteDepth(buffer);
      if (depth > 0) { rl.setPrompt("...   "); if (!closed) rl.prompt(); return; }
      const source = buffer;
      buffer = "";
      rl.setPrompt("plain> ");
      console.log();
      const program = new Parser(new Lexer(source, "<repl>").tokenize(), source, "<repl>").parse();
      for (const statement of program.body) {
        if (statement.type === "ExpressionStatement") {
          const value = await interpreter.evaluate(statement.expression);
          if (value !== null && value !== undefined) console.log("=> " + plainToString(value));
        } else await interpreter.executeStatement(statement);
      }
    } catch (error) {
      hadError = true;
      console.error("\n" + formatError(error, buffer) + "\n");
      buffer = "";
      rl.setPrompt("plain> ");
    }
    if (!closed) rl.prompt();
  };

  rl.on("line", (line) => { queue = queue.then(() => processLine(line)); });
  rl.on("close", () => {
    if (closed) return;
    closed = true;
    queue = queue.then(() => {
      if (buffer.trim()) { console.error("Incomplete input: expected 'end' or a closing delimiter before end of input."); hadError = true; }
      if (hadError) process.exitCode = 1;
    });
  });
}
