import * as readline from "readline";
import * as fs from "fs";
import * as path from "path";
import {
  AssignmentStatement,
  BinaryExpression,
  CallExpression,
  Expression,
  ForEachStatement,
  FunctionDefStatement,
  IfStatement,
  ImportStatement,
  ItemOfExpression,
  ListAddStatement,
  ListRemoveStatement,
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
import { Environment } from "./environment";
import {
  isPlainFunction,
  isPlainObject,
  PlainFunction,
  PlainObject,
  plainToBoolean,
  plainToString,
  PlainValue
} from "./values";
import { Lexer } from "../lexer/lexer";
import { Parser } from "../parser/parser";
import { PlainError, SourceLocation } from "../errors/plain-error";
import { mathBuiltins } from "../builtins/math";
import { listBuiltins } from "../builtins/list";
import { timeBuiltins } from "../builtins/time";
import { createStandardEnvironment } from "../builtins";

class ReturnSignal {
  public readonly value: PlainValue;
  constructor(value: PlainValue) {
    this.value = value;
  }
}

export interface InterpreterOptions {
  baseDir?: string;
  sourceCode?: string;
  sourceFile?: string;
  onSay?: (output: string) => void;
  onShow?: (output: string) => void;
  onAsk?: (prompt: string) => Promise<string>;
  onClear?: () => void;
}

export class Interpreter {
  private globalEnv: Environment;
  private currentEnv: Environment;
  private sourceCode?: string;
  private sourceFile?: string;
  private baseDir: string;
  private onSay: (output: string) => void;
  private onShow: (output: string) => void;
  private onAsk: (prompt: string) => Promise<string>;
  private onClear: () => void;

  constructor(options?: InterpreterOptions) {
    this.sourceCode = options?.sourceCode;
    this.sourceFile = options?.sourceFile;
    this.baseDir = options?.baseDir ? path.resolve(options.baseDir) : process.cwd();
    this.onSay = options?.onSay || ((s) => console.log(s));
    this.onShow = options?.onShow || ((s) => console.log(s));
    this.onAsk =
      options?.onAsk ||
      ((p) => {
        return new Promise<string>((resolve) => {
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          });
          rl.question(p ? `${p} ` : "", (ans) => {
            rl.close();
            resolve(ans);
          });
        });
      });
    this.onClear = options?.onClear || (() => console.clear());

    this.globalEnv = createStandardEnvironment({
      baseDir: options?.baseDir,
      onSay: this.onSay,
      onShow: this.onShow,
      onAsk: this.onAsk,
      onClear: this.onClear,
      invokeFunction: (fn, args) => this.callFunction(fn, args)
    });
    this.currentEnv = this.globalEnv;
  }

  public getGlobalEnvironment(): Environment {
    return this.globalEnv;
  }

  public async run(program: Program): Promise<void> {
    for (const statement of program.body) {
      await this.executeStatement(statement);
    }
  }

  public async executeStatement(statement: Statement): Promise<void> {
    switch (statement.type) {
      case "SetStatement":
        await this.executeSet(statement);
        break;
      case "AssignmentStatement":
        await this.executeAssignment(statement);
        break;
      case "ImportStatement":
        await this.executeImport(statement);
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

  private async executeSet(stmt: SetStatement): Promise<void> {
    let value: PlainValue;
    if (stmt.value.type === "Identifier" && !this.currentEnv.has(stmt.value.name)) {
      // Unquoted identifier fallback (e.g. Set ABC = Main -> "Main")
      value = stmt.value.name;
    } else {
      value = await this.evaluate(stmt.value);
    }
    this.currentEnv.assign(stmt.name, value);
  }

  private async executeAssignment(stmt: AssignmentStatement): Promise<void> {
    let rhs: PlainValue;
    if (stmt.operator === "=" && stmt.value.type === "Identifier" && !this.currentEnv.has(stmt.value.name)) {
      // Unquoted identifier fallback (e.g. ABC = Main -> "Main")
      rhs = stmt.value.name;
    } else {
      rhs = await this.evaluate(stmt.value);
    }

    if (stmt.operator === "=") {
      this.currentEnv.assign(stmt.name, rhs);
      return;
    }

    const current = this.currentEnv.lookup(stmt.name, stmt.location, this.sourceCode);
    let finalVal: PlainValue = rhs;
    if (stmt.operator === "+=") {
      if (typeof current === "string" || typeof rhs === "string") {
        finalVal = plainToString(current) + plainToString(rhs);
      } else {
        finalVal = mathBuiltins.to_number(current) + mathBuiltins.to_number(rhs);
      }
    } else if (stmt.operator === "-=") {
      finalVal = mathBuiltins.to_number(current) - mathBuiltins.to_number(rhs);
    } else if (stmt.operator === "*=") {
      finalVal = mathBuiltins.to_number(current) * mathBuiltins.to_number(rhs);
    } else if (stmt.operator === "/=") {
      const divisor = mathBuiltins.to_number(rhs);
      if (divisor === 0) {
        throw new PlainError("Cannot divide by zero.", stmt.location, { kind: "RuntimeError", sourceCode: this.sourceCode });
      }
      finalVal = mathBuiltins.to_number(current) / divisor;
    }
    this.currentEnv.assign(stmt.name, finalVal);
  }

  private async executeImport(stmt: ImportStatement): Promise<void> {
    const source = stmt.source.trim();
    const alias = stmt.alias || source.replace(/\.plain$/, "").replace(/[^a-zA-Z0-9_]/g, "_");

    // Check if source is a local .plain file
    let localFilePath = path.resolve(this.baseDir, source);
    if (!fs.existsSync(localFilePath) && !source.endsWith(".plain")) {
      localFilePath = path.resolve(this.baseDir, source + ".plain");
    }

    if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
      const code = fs.readFileSync(localFilePath, "utf-8");
      const lexer = new Lexer(code, localFilePath);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens, code, localFilePath);
      const ast = parser.parse();

      const subInterpreter = new Interpreter({
        baseDir: path.dirname(localFilePath),
        onSay: this.onSay,
        onShow: this.onShow,
        onAsk: this.onAsk,
        onClear: this.onClear
      });
      // Execute in submodule scope
      for (const s of ast.body) {
        await subInterpreter.executeStatement(s);
      }

      // Collect exported variables
      const moduleExport: PlainObject = {};
      const exportedNames = subInterpreter.getGlobalEnvironment().getAllVariableNames();
      for (const name of exportedNames) {
        const val = subInterpreter.getGlobalEnvironment().lookup(name);
        moduleExport[name] = val;
        if (stmt.symbols && stmt.symbols.includes(name)) {
          this.currentEnv.assign(name, val);
        }
      }

      if (!stmt.symbols || stmt.symbols.length === 0) {
        this.currentEnv.assign(alias, moduleExport);
      }
      return;
    }

    // Built-in virtual packages
    const allVars = this.globalEnv.getAllVariableNames();
    const matchingModuleObj: PlainObject = {};

    for (const name of allVars) {
      const val = this.globalEnv.lookup(name);
      matchingModuleObj[name] = val;
      if (stmt.symbols && stmt.symbols.includes(name)) {
        this.currentEnv.assign(name, val);
      }
    }

    if (!stmt.symbols || stmt.symbols.length === 0) {
      this.currentEnv.assign(alias, matchingModuleObj);
    }
  }

  private async executeSay(stmt: SayStatement): Promise<void> {
    const value = await this.evaluate(stmt.value);
    this.onSay(plainToString(value));
  }

  private async executeShow(stmt: ShowStatement): Promise<void> {
    const value = await this.evaluate(stmt.value);
    this.onShow(plainToString(value));
  }

  private async executeAsk(stmt: any): Promise<void> {
    const promptVal = await this.evaluate(stmt.prompt);
    const promptStr = plainToString(promptVal);
    const answer = await this.onAsk(promptStr);
    if (stmt.targetVariable) {
      this.currentEnv.assign(stmt.targetVariable, answer);
    }
  }

  private async executeIf(stmt: IfStatement): Promise<void> {
    const condition = await this.evaluate(stmt.condition);
    if (plainToBoolean(condition)) {
      for (const s of stmt.consequent) {
        await this.executeStatement(s);
      }
      return;
    }

    // Check otherwise if branches
    for (const branch of stmt.otherwiseIfBranches) {
      const branchCond = await this.evaluate(branch.condition);
      if (plainToBoolean(branchCond)) {
        for (const s of branch.body) {
          await this.executeStatement(s);
        }
        return;
      }
    }

    // Alternate (otherwise)
    if (stmt.alternate) {
      for (const s of stmt.alternate) {
        await this.executeStatement(s);
      }
    }
  }

  private async executeRepeatTimes(stmt: RepeatTimesStatement): Promise<void> {
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

  private async executeRepeatWhile(stmt: RepeatWhileStatement): Promise<void> {
    while (plainToBoolean(await this.evaluate(stmt.condition))) {
      for (const s of stmt.body) {
        await this.executeStatement(s);
      }
    }
  }

  private async executeForEach(stmt: ForEachStatement): Promise<void> {
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

  private executeFunctionDef(stmt: FunctionDefStatement): void {
    const fn: PlainFunction = {
      type: "function",
      name: stmt.name,
      parameters: stmt.parameters,
      body: stmt.body,
      closure: this.currentEnv
    };
    this.currentEnv.define(stmt.name, fn);
  }

  private async executeReturn(stmt: ReturnStatement): Promise<void> {
    let value: PlainValue = null;
    if (stmt.value) {
      value = await this.evaluate(stmt.value);
    }
    throw new ReturnSignal(value);
  }

  private async executeListAdd(stmt: ListAddStatement): Promise<void> {
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

  private async executeListRemove(stmt: ListRemoveStatement): Promise<void> {
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

  private async executeWait(stmt: WaitStatement): Promise<void> {
    const duration = await this.evaluate(stmt.duration);
    await timeBuiltins.sleep(duration);
  }

  // ==========================================
  // Expressions Evaluation
  // ==========================================

  public async evaluate(expr: Expression): Promise<PlainValue> {
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
        const elements: PlainValue[] = [];
        for (const el of expr.elements) {
          elements.push(await this.evaluate(el));
        }
        return elements;
      }
      case "DictionaryLiteral": {
        const obj: PlainObject = {};
        for (const entry of expr.entries) {
          obj[entry.key] = await this.evaluate(entry.value);
        }
        return obj;
      }
      case "IndexExpression": {
        const target = await this.evaluate(expr.object);
        const idxVal = await this.evaluate(expr.index);
        if (Array.isArray(target)) {
          const idx = Math.floor(mathBuiltins.to_number(idxVal));
          if (idx < 0) {
            const wrapped = target.length + idx;
            return wrapped >= 0 && wrapped < target.length ? target[wrapped] : null;
          }
          if (idx < target.length) {
            return target[idx];
          }
          return null;
        }
        if (isPlainObject(target)) {
          const key = plainToString(idxVal);
          return target[key] ?? null;
        }
        return null;
      }
      case "MemberAccessExpression": {
        const target = await this.evaluate(expr.object);
        if (isPlainObject(target)) {
          return target[expr.property] ?? null;
        }
        return null;
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

  private async evaluateItemOf(expr: ItemOfExpression): Promise<PlainValue> {
    const index = await this.evaluate(expr.index);
    const list = await this.evaluate(expr.list);
    return listBuiltins.item_of(index, list);
  }

  private async evaluateUnary(expr: UnaryExpression): Promise<PlainValue> {
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

  private async evaluateBinary(expr: BinaryExpression): Promise<PlainValue> {
    // Short-circuit logical operators
    if (expr.operator === "and") {
      const left = await this.evaluate(expr.left);
      if (!plainToBoolean(left)) return false;
      const right = await this.evaluate(expr.right);
      return plainToBoolean(right);
    }
    if (expr.operator === "or") {
      const left = await this.evaluate(expr.left);
      if (plainToBoolean(left)) return true;
      const right = await this.evaluate(expr.right);
      return plainToBoolean(right);
    }

    const left = await this.evaluate(expr.left);
    const right = await this.evaluate(expr.right);

    switch (expr.operator) {
      case "+": {
        // String concatenation if either is string
        if (typeof left === "string" || typeof right === "string") {
          return plainToString(left) + plainToString(right);
        }
        // List concatenation if both are lists
        if (Array.isArray(left) && Array.isArray(right)) {
          return [...left, ...right];
        }
        // Numbers
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
      case "**": {
        return Math.pow(mathBuiltins.to_number(left), mathBuiltins.to_number(right));
      }
      case "//": {
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
        return Math.floor(mathBuiltins.to_number(left) / divisor);
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

  private async evaluateCall(expr: CallExpression): Promise<PlainValue> {
    let calleeVal: PlainValue;
    let calleeName = "function";

    if (typeof expr.callee === "string") {
      calleeName = expr.callee;
      calleeVal = this.currentEnv.lookup(expr.callee, expr.location, this.sourceCode);
    } else {
      calleeVal = await this.evaluate(expr.callee);
      if (expr.callee.type === "MemberAccessExpression") {
        calleeName = expr.callee.property;
      }
    }

    if (!isPlainFunction(calleeVal)) {
      throw new PlainError(
        `'${calleeName}' is a ${typeof calleeVal}, not a function.`,
        expr.location,
        {
          kind: "TypeError",
          sourceCode: this.sourceCode,
          suggestion: `Check the name or define it with: to ${calleeName} ... end`
        }
      );
    }

    const evaluatedArgs: PlainValue[] = [];
    for (const arg of expr.arguments) {
      evaluatedArgs.push(await this.evaluate(arg));
    }

    return this.callFunction(calleeVal, evaluatedArgs, expr.location);
  }

  public async callFunction(
    calleeVal: PlainFunction,
    evaluatedArgs: PlainValue[],
    location?: SourceLocation
  ): Promise<PlainValue> {
    // Native Builtin Function
    if (calleeVal.nativeFn) {
      try {
        const result = calleeVal.nativeFn(...evaluatedArgs);
        return result instanceof Promise ? await result : result;
      } catch (err: any) {
        if (err instanceof PlainError) throw err;
        throw new PlainError(
          `Error running function '${calleeVal.name}': ${err.message}`,
          location || { line: 1, column: 1 },
          { kind: "RuntimeError", sourceCode: this.sourceCode }
        );
      }
    }

    // User-Defined Function
    if (calleeVal.body) {
      const callEnv = new Environment(calleeVal.closure || this.globalEnv);

      // Bind parameters
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

  private valuesEqual(a: PlainValue, b: PlainValue): boolean {
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
}

