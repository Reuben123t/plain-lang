import { PlainValue, plainToBoolean, plainToString, isPlainFunction } from "../runtime/values";
import { PlainError } from "../errors/plain-error";

export function valuesEqual(left: PlainValue, right: PlainValue, visited = new WeakMap<object, object>()): boolean {
  if (Object.is(left, right)) return true;
  if (left === null || right === null || typeof left !== "object" || typeof right !== "object") return false;
  if (isPlainFunction(left) || isPlainFunction(right)) return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  if (visited.has(left)) return visited.get(left) === right;
  visited.set(left, right);
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return leftKeys.length === rightKeys.length && leftKeys.every((key) =>
    Object.prototype.hasOwnProperty.call(right, key) &&
    valuesEqual((left as any)[key], (right as any)[key], visited)
  );
}

function fail(message: string): never {
  throw new PlainError(message, { line: 1, column: 1 }, { kind: "RuntimeError" });
}

export const testingBuiltins = {
  assert: (condition: PlainValue, message?: PlainValue): boolean => {
    if (!plainToBoolean(condition)) fail(message === undefined ? "Assertion failed." : plainToString(message));
    return true;
  },
  assert_equal: (actual: PlainValue, expected: PlainValue, message?: PlainValue): boolean => {
    if (!valuesEqual(actual, expected)) {
      fail(message === undefined ? `Expected ${plainToString(expected)}, received ${plainToString(actual)}.` : plainToString(message));
    }
    return true;
  },
  assert_not_equal: (actual: PlainValue, expected: PlainValue, message?: PlainValue): boolean => {
    if (valuesEqual(actual, expected)) {
      fail(message === undefined ? `Expected values to differ, but both were ${plainToString(actual)}.` : plainToString(message));
    }
    return true;
  }
};
