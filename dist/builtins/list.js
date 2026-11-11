"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBuiltins = void 0;
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
const math_1 = require("./math");
function ensureList(val, fnName) {
    if (!Array.isArray(val)) {
        throw new plain_error_1.PlainError(`'${fnName}' expects a list, but received a ${typeof val}.`, { line: 1, column: 1 }, {
            kind: "TypeError",
            suggestion: "Create a list using square brackets, like: set my_list to [1, 2, 3]"
        });
    }
    return val;
}
exports.listBuiltins = {
    count: (val) => {
        if (Array.isArray(val))
            return val.length;
        if (typeof val === "string")
            return val.length;
        return 1;
    },
    first: (val) => {
        const list = ensureList(val, "first");
        if (list.length === 0) {
            throw new plain_error_1.PlainError("I cannot get the first item because the list is empty.", { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Add items to the list before calling first(list)."
            });
        }
        return list[0];
    },
    last: (val) => {
        const list = ensureList(val, "last");
        if (list.length === 0) {
            throw new plain_error_1.PlainError("I cannot get the last item because the list is empty.", { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Add items to the list before calling last(list)."
            });
        }
        return list[list.length - 1];
    },
    item_of: (indexVal, listVal) => {
        const list = ensureList(listVal, "item ... of");
        const index = math_1.mathBuiltins.to_number(indexVal);
        if (!Number.isInteger(index) || index < 1 || index > list.length) {
            throw new plain_error_1.PlainError(`List item ${index} is out of range. The list contains ${list.length} item${list.length === 1 ? "" : "s"}.`, { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Remember that PLAIN uses 1-based indexing: item 1 is the first item."
            });
        }
        return list[index - 1];
    },
    sort: (val) => {
        const list = [...ensureList(val, "sort")];
        return list.sort((a, b) => {
            if (typeof a === "number" && typeof b === "number")
                return a - b;
            return (0, values_1.plainToString)(a).localeCompare((0, values_1.plainToString)(b));
        });
    },
    reverse: (val) => {
        const list = [...ensureList(val, "reverse")];
        return list.reverse();
    },
    sum: (val) => {
        const list = ensureList(val, "sum");
        let total = 0;
        for (const item of list) {
            total += math_1.mathBuiltins.to_number(item);
        }
        return total;
    },
    average: (val) => {
        const list = ensureList(val, "average");
        if (list.length === 0) {
            throw new plain_error_1.PlainError("I cannot calculate the average of an empty list.", { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Make sure the list has at least one number before finding the average."
            });
        }
        return exports.listBuiltins.sum(list) / list.length;
    },
    highest: (val) => {
        const list = ensureList(val, "highest");
        if (list.length === 0) {
            throw new plain_error_1.PlainError("I cannot find the highest item because the list is empty.", { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Make sure the list has at least one number."
            });
        }
        const numbers = list.map((item) => math_1.mathBuiltins.to_number(item));
        return Math.max(...numbers);
    },
    lowest: (val) => {
        const list = ensureList(val, "lowest");
        if (list.length === 0) {
            throw new plain_error_1.PlainError("I cannot find the lowest item because the list is empty.", { line: 1, column: 1 }, {
                kind: "RuntimeError",
                suggestion: "Make sure the list has at least one number."
            });
        }
        const numbers = list.map((item) => math_1.mathBuiltins.to_number(item));
        return Math.min(...numbers);
    }
};
//# sourceMappingURL=list.js.map