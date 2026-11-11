import { Interpreter, InterpreterOptions } from "./runtime/interpreter";
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
export declare function runPlain(source: string, options?: RunOptions): Promise<Interpreter>;
//# sourceMappingURL=index.d.ts.map