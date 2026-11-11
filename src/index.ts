import { Lexer } from "./lexer/lexer";
import { Parser } from "./parser/parser";
import { Interpreter, InterpreterOptions } from "./runtime/interpreter";
import { formatError } from "./errors/formatter";
import { PlainError } from "./errors/plain-error";

export * from "./ast/types";
export * from "./lexer/token";
export * from "./lexer/lexer";
export * from "./parser/parser";
export * from "./runtime/environment";
export * from "./runtime/values";
export * from "./runtime/interpreter";
export * from "./errors/plain-error";
export * from "./errors/formatter";

export interface RunOptions extends InterpreterOptions {
  filename?: string;
}

export async function runPlain(
  source: string,
  options?: RunOptions
): Promise<Interpreter> {
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

