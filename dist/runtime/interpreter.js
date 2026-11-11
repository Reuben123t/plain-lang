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
exports.Interpreter = void 0;
const environment_1 = require("./environment");
const values_1 = require("./values");
const plain_error_1 = require("../errors/plain-error");
const math_1 = require("../builtins/math");
const list_1 = require("../builtins/list");
const time_1 = require("../builtins/time");
const builtins_1 = require("../builtins");
class ReturnSignal {
    value;
    constructor(value) {
        this.value = value;
    }
}
class Interpreter {
    globalEnv;
    currentEnv;
    sourceCode;
    sourceFile;
    onSay;
    onShow;
    onAsk;
    onClear;
    constructor(options) {
        this.sourceCode = options?.sourceCode;
        this.sourceFile = options?.sourceFile;
        this.onSay = options?.onSay || ((s) => console.log(s));
        this.onShow = options?.onShow || ((s) => console.log(s));
        this.onAsk =
            options?.onAsk ||
                (async (p) => {
                    // Fallback readline prompt
                    const readline = await Promise.resolve().then(() => __importStar(require("readline/promises")));
                    const rl = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    });
                    const ans = await rl.question(p ? `${p} ` : "");
                    rl.close();
                    return ans;
                });
        this.onClear = options?.onClear || (() => console.clear());
        this.globalEnv = (0, builtins_1.createStandardEnvironment)({
            baseDir: options?.baseDir,
            onSay: this.onSay,
            onShow: this.onShow,
            onAsk: this.onAsk,
            onClear: this.onClear
        });
        this.currentEnv = this.globalEnv;
    }
    getGlobalEnvironment() {
        return this.globalEnv;
    }
    async run(program) {
        for (const statement of program.body) {
            await this.executeStatement(statement);
        }
    }
    async executeStatement(statement) {
        switch (statement.type) {
            case "SetStatement":
                await this.executeSet(statement);
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
    async executeSet(stmt) {
        const value = await this.evaluate(stmt.value);
        this.currentEnv.assign(stmt.name, value);
    }
    async executeSay(stmt) {
        const value = await this.evaluate(stmt.value);
        this.onSay((0, values_1.plainToString)(value));
    }
    async executeShow(stmt) {
        const value = await this.evaluate(stmt.value);
        this.onShow((0, values_1.plainToString)(value));
    }
    async executeAsk(stmt) {
        const promptVal = await this.evaluate(stmt.prompt);
        const promptStr = (0, values_1.plainToString)(promptVal);
        const answer = await this.onAsk(promptStr);
        if (stmt.targetVariable) {
            this.currentEnv.assign(stmt.targetVariable, answer);
        }
    }
    async executeIf(stmt) {
        const condition = await this.evaluate(stmt.condition);
        if ((0, values_1.plainToBoolean)(condition)) {
            for (const s of stmt.consequent) {
                await this.executeStatement(s);
            }
            return;
        }
        // Check otherwise if branches
        for (const branch of stmt.otherwiseIfBranches) {
            const branchCond = await this.evaluate(branch.condition);
            if ((0, values_1.plainToBoolean)(branchCond)) {
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
    async executeRepeatTimes(stmt) {
        const countVal = await this.evaluate(stmt.count);
        const count = Math.round(math_1.mathBuiltins.to_number(countVal));
        if (count < 0) {
            throw new plain_error_1.PlainError(`Cannot repeat a negative number of times (${count}).`, stmt.location, { kind: "RuntimeError", sourceCode: this.sourceCode });
        }
        for (let i = 0; i < count; i++) {
            for (const s of stmt.body) {
                await this.executeStatement(s);
            }
        }
    }
    async executeRepeatWhile(stmt) {
        while ((0, values_1.plainToBoolean)(await this.evaluate(stmt.condition))) {
            for (const s of stmt.body) {
                await this.executeStatement(s);
            }
        }
    }
    async executeForEach(stmt) {
        const listVal = await this.evaluate(stmt.list);
        if (!Array.isArray(listVal)) {
            throw new plain_error_1.PlainError(`'for each' expects a list, but received ${typeof listVal}.`, stmt.location, {
                kind: "TypeError",
                sourceCode: this.sourceCode,
                suggestion: "Make sure the variable is a list, like: [1, 2, 3]"
            });
        }
        for (const item of listVal) {
            this.currentEnv.assign(stmt.itemVariable, item);
            for (const s of stmt.body) {
                await this.executeStatement(s);
            }
        }
    }
    executeFunctionDef(stmt) {
        const fn = {
            type: "function",
            name: stmt.name,
            parameters: stmt.parameters,
            body: stmt.body,
            closure: this.currentEnv
        };
        this.currentEnv.define(stmt.name, fn);
    }
    async executeReturn(stmt) {
        let value = null;
        if (stmt.value) {
            value = await this.evaluate(stmt.value);
        }
        throw new ReturnSignal(value);
    }
    async executeListAdd(stmt) {
        const list = this.currentEnv.lookup(stmt.targetVariable, stmt.location, this.sourceCode);
        if (!Array.isArray(list)) {
            throw new plain_error_1.PlainError(`Variable '${stmt.targetVariable}' is not a list.`, stmt.location, {
                kind: "TypeError",
                sourceCode: this.sourceCode,
                suggestion: `Initialize '${stmt.targetVariable}' as a list with: set ${stmt.targetVariable} to []`
            });
        }
        const val = await this.evaluate(stmt.value);
        list.push(val);
    }
    async executeListRemove(stmt) {
        const list = this.currentEnv.lookup(stmt.targetVariable, stmt.location, this.sourceCode);
        if (!Array.isArray(list)) {
            throw new plain_error_1.PlainError(`Variable '${stmt.targetVariable}' is not a list.`, stmt.location, {
                kind: "TypeError",
                sourceCode: this.sourceCode,
                suggestion: `Initialize '${stmt.targetVariable}' as a list with: set ${stmt.targetVariable} to []`
            });
        }
        const target = await this.evaluate(stmt.value);
        const index = list.findIndex((item) => this.valuesEqual(item, target));
        if (index !== -1) {
            list.splice(index, 1);
        }
    }
    async executeWait(stmt) {
        const duration = await this.evaluate(stmt.duration);
        await time_1.timeBuiltins.sleep(duration);
    }
    // ==========================================
    // Expressions Evaluation
    // ==========================================
    async evaluate(expr) {
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
                const elements = [];
                for (const el of expr.elements) {
                    elements.push(await this.evaluate(el));
                }
                return elements;
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
    async evaluateItemOf(expr) {
        const index = await this.evaluate(expr.index);
        const list = await this.evaluate(expr.list);
        return list_1.listBuiltins.item_of(index, list);
    }
    async evaluateUnary(expr) {
        const arg = await this.evaluate(expr.argument);
        if (expr.operator === "not") {
            return !(0, values_1.plainToBoolean)(arg);
        }
        if (expr.operator === "-") {
            const num = math_1.mathBuiltins.to_number(arg);
            return -num;
        }
        return arg;
    }
    async evaluateBinary(expr) {
        // Short-circuit logical operators
        if (expr.operator === "and") {
            const left = await this.evaluate(expr.left);
            if (!(0, values_1.plainToBoolean)(left))
                return false;
            const right = await this.evaluate(expr.right);
            return (0, values_1.plainToBoolean)(right);
        }
        if (expr.operator === "or") {
            const left = await this.evaluate(expr.left);
            if ((0, values_1.plainToBoolean)(left))
                return true;
            const right = await this.evaluate(expr.right);
            return (0, values_1.plainToBoolean)(right);
        }
        const left = await this.evaluate(expr.left);
        const right = await this.evaluate(expr.right);
        switch (expr.operator) {
            case "+": {
                // String concatenation if either is string
                if (typeof left === "string" || typeof right === "string") {
                    return (0, values_1.plainToString)(left) + (0, values_1.plainToString)(right);
                }
                // List concatenation if both are lists
                if (Array.isArray(left) && Array.isArray(right)) {
                    return [...left, ...right];
                }
                // Numbers
                return math_1.mathBuiltins.to_number(left) + math_1.mathBuiltins.to_number(right);
            }
            case "-": {
                return math_1.mathBuiltins.to_number(left) - math_1.mathBuiltins.to_number(right);
            }
            case "*": {
                return math_1.mathBuiltins.to_number(left) * math_1.mathBuiltins.to_number(right);
            }
            case "/": {
                const divisor = math_1.mathBuiltins.to_number(right);
                if (divisor === 0) {
                    throw new plain_error_1.PlainError("Cannot divide by zero.", expr.location, {
                        kind: "RuntimeError",
                        sourceCode: this.sourceCode,
                        suggestion: "Make sure the divisor is not zero."
                    });
                }
                return math_1.mathBuiltins.to_number(left) / divisor;
            }
            case "%": {
                const divisor = math_1.mathBuiltins.to_number(right);
                if (divisor === 0) {
                    throw new plain_error_1.PlainError("Cannot calculate remainder of division by zero.", expr.location, {
                        kind: "RuntimeError",
                        sourceCode: this.sourceCode,
                        suggestion: "Make sure the number after 'remainder of' is not zero."
                    });
                }
                return math_1.mathBuiltins.to_number(left) % divisor;
            }
            case "==":
                return this.valuesEqual(left, right);
            case "!=":
                return !this.valuesEqual(left, right);
            case ">":
                return math_1.mathBuiltins.to_number(left) > math_1.mathBuiltins.to_number(right);
            case "<":
                return math_1.mathBuiltins.to_number(left) < math_1.mathBuiltins.to_number(right);
            case ">=":
                return math_1.mathBuiltins.to_number(left) >= math_1.mathBuiltins.to_number(right);
            case "<=":
                return math_1.mathBuiltins.to_number(left) <= math_1.mathBuiltins.to_number(right);
            default:
                throw new plain_error_1.PlainError(`Unknown operator '${expr.operator}'.`, expr.location, { kind: "RuntimeError", sourceCode: this.sourceCode });
        }
    }
    async evaluateCall(expr) {
        const calleeVal = this.currentEnv.lookup(expr.callee, expr.location, this.sourceCode);
        if (!(0, values_1.isPlainFunction)(calleeVal)) {
            throw new plain_error_1.PlainError(`'${expr.callee}' is a ${typeof calleeVal}, not a function.`, expr.location, {
                kind: "TypeError",
                sourceCode: this.sourceCode,
                suggestion: `Check the name or define it with: to ${expr.callee} ... end`
            });
        }
        const evaluatedArgs = [];
        for (const arg of expr.arguments) {
            evaluatedArgs.push(await this.evaluate(arg));
        }
        // Native Builtin Function
        if (calleeVal.nativeFn) {
            try {
                const result = calleeVal.nativeFn(...evaluatedArgs);
                return result instanceof Promise ? await result : result;
            }
            catch (err) {
                if (err instanceof plain_error_1.PlainError)
                    throw err;
                throw new plain_error_1.PlainError(`Error running function '${calleeVal.name}': ${err.message}`, expr.location, { kind: "RuntimeError", sourceCode: this.sourceCode });
            }
        }
        // User-Defined Function
        if (calleeVal.body) {
            const callEnv = new environment_1.Environment(calleeVal.closure || this.globalEnv);
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
            }
            catch (signal) {
                if (signal instanceof ReturnSignal) {
                    return signal.value;
                }
                throw signal;
            }
            finally {
                this.currentEnv = previousEnv;
            }
        }
        return null;
    }
    valuesEqual(a, b) {
        if (a === b)
            return true;
        if (a === null && b === null)
            return true;
        if (a === null || b === null)
            return false;
        if (typeof a === "number" && typeof b === "number")
            return a === b;
        if (typeof a === "string" && typeof b === "string")
            return a === b;
        if (typeof a === "boolean" && typeof b === "boolean")
            return a === b;
        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length)
                return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.valuesEqual(a[i], b[i]))
                    return false;
            }
            return true;
        }
        return false;
    }
}
exports.Interpreter = Interpreter;
//# sourceMappingURL=interpreter.js.map