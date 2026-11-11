"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mathBuiltins = void 0;
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
exports.mathBuiltins = {
    to_number: (val) => {
        if (typeof val === "number")
            return val;
        if (typeof val === "boolean")
            return val ? 1 : 0;
        const str = (0, values_1.plainToString)(val).trim();
        const num = Number(str);
        if (isNaN(num) || str === "") {
            throw new plain_error_1.PlainError(`I cannot convert "${str}" into a number.`, { line: 1, column: 1 }, {
                kind: "TypeError",
                suggestion: "Make sure the text contains only digits (for example, '42' or '3.14')."
            });
        }
        return num;
    },
    to_text: (val) => {
        return (0, values_1.plainToString)(val);
    },
    round: (num) => {
        const n = exports.mathBuiltins.to_number(num);
        return Math.round(n);
    },
    floor: (num) => {
        const n = exports.mathBuiltins.to_number(num);
        return Math.floor(n);
    },
    ceiling: (num) => {
        const n = exports.mathBuiltins.to_number(num);
        return Math.ceil(n);
    },
    absolute: (num) => {
        const n = exports.mathBuiltins.to_number(num);
        return Math.abs(n);
    },
    minimum: (...args) => {
        if (args.length === 0) {
            throw new plain_error_1.PlainError("minimum(...) requires at least one number.", { line: 1, column: 1 }, { kind: "TypeError" });
        }
        const numbers = args.map((a) => exports.mathBuiltins.to_number(a));
        return Math.min(...numbers);
    },
    maximum: (...args) => {
        if (args.length === 0) {
            throw new plain_error_1.PlainError("maximum(...) requires at least one number.", { line: 1, column: 1 }, { kind: "TypeError" });
        }
        const numbers = args.map((a) => exports.mathBuiltins.to_number(a));
        return Math.max(...numbers);
    },
    random_between: (minVal, maxVal) => {
        const min = Math.ceil(exports.mathBuiltins.to_number(minVal));
        const max = Math.floor(exports.mathBuiltins.to_number(maxVal));
        if (min > max) {
            return Math.floor(Math.random() * (min - max + 1)) + max;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};
//# sourceMappingURL=math.js.map