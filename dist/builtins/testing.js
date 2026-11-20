"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testingBuiltins = void 0;
exports.valuesEqual = valuesEqual;
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
function valuesEqual(left, right, visited = new WeakMap()) {
    if (Object.is(left, right))
        return true;
    if (left === null || right === null || typeof left !== "object" || typeof right !== "object")
        return false;
    if ((0, values_1.isPlainFunction)(left) || (0, values_1.isPlainFunction)(right))
        return false;
    if (Array.isArray(left) !== Array.isArray(right))
        return false;
    if (visited.has(left))
        return visited.get(left) === right;
    visited.set(left, right);
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    return leftKeys.length === rightKeys.length && leftKeys.every((key) => Object.prototype.hasOwnProperty.call(right, key) &&
        valuesEqual(left[key], right[key], visited));
}
function fail(message) {
    throw new plain_error_1.PlainError(message, { line: 1, column: 1 }, { kind: "RuntimeError" });
}
exports.testingBuiltins = {
    assert: (condition, message) => {
        if (!(0, values_1.plainToBoolean)(condition))
            fail(message === undefined ? "Assertion failed." : (0, values_1.plainToString)(message));
        return true;
    },
    assert_equal: (actual, expected, message) => {
        if (!valuesEqual(actual, expected)) {
            fail(message === undefined ? `Expected ${(0, values_1.plainToString)(expected)}, received ${(0, values_1.plainToString)(actual)}.` : (0, values_1.plainToString)(message));
        }
        return true;
    },
    assert_not_equal: (actual, expected, message) => {
        if (valuesEqual(actual, expected)) {
            fail(message === undefined ? `Expected values to differ, but both were ${(0, values_1.plainToString)(actual)}.` : (0, values_1.plainToString)(message));
        }
        return true;
    }
};
//# sourceMappingURL=testing.js.map