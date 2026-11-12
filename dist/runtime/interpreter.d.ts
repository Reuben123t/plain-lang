import { Expression, Program, Statement } from "../ast/types";
import { Environment } from "./environment";
import { PlainFunction, PlainValue } from "./values";
import { SourceLocation } from "../errors/plain-error";
export interface InterpreterOptions {
    baseDir?: string;
    sourceCode?: string;
    sourceFile?: string;
    onSay?: (output: string) => void;
    onShow?: (output: string) => void;
    onAsk?: (prompt: string) => Promise<string>;
    onClear?: () => void;
}
export declare class Interpreter {
    private globalEnv;
    private currentEnv;
    private sourceCode?;
    private sourceFile?;
    private onSay;
    private onShow;
    private onAsk;
    private onClear;
    constructor(options?: InterpreterOptions);
    getGlobalEnvironment(): Environment;
    run(program: Program): Promise<void>;
    executeStatement(statement: Statement): Promise<void>;
    private executeSet;
    private executeSay;
    private executeShow;
    private executeAsk;
    private executeIf;
    private executeRepeatTimes;
    private executeRepeatWhile;
    private executeForEach;
    private executeFunctionDef;
    private executeReturn;
    private executeListAdd;
    private executeListRemove;
    private executeWait;
    evaluate(expr: Expression): Promise<PlainValue>;
    private evaluateItemOf;
    private evaluateUnary;
    private evaluateBinary;
    private evaluateCall;
    callFunction(calleeVal: PlainFunction, evaluatedArgs: PlainValue[], location?: SourceLocation): Promise<PlainValue>;
    private valuesEqual;
}
//# sourceMappingURL=interpreter.d.ts.map