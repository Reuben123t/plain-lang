import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";
import { mathBuiltins } from "./math";

function ensureList(val: PlainValue, fnName: string): PlainValue[] {
  if (!Array.isArray(val)) {
    throw new PlainError(
      `'${fnName}' expects a list, but received a ${typeof val}.`,
      { line: 1, column: 1 },
      {
        kind: "TypeError",
        suggestion: "Create a list using square brackets, like: set my_list to [1, 2, 3]"
      }
    );
  }
  return val;
}

export const listBuiltins: Record<string, (...args: any[]) => any> = {
  count: (val: PlainValue): number => {
    if (Array.isArray(val)) return val.length;
    if (typeof val === "string") return val.length;
    return 1;
  },

  first: (val: PlainValue): PlainValue => {
    const list = ensureList(val, "first");
    if (list.length === 0) {
      throw new PlainError(
        "I cannot get the first item because the list is empty.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Add items to the list before calling first(list)."
        }
      );
    }
    return list[0];
  },

  last: (val: PlainValue): PlainValue => {
    const list = ensureList(val, "last");
    if (list.length === 0) {
      throw new PlainError(
        "I cannot get the last item because the list is empty.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Add items to the list before calling last(list)."
        }
      );
    }
    return list[list.length - 1];
  },

  item_of: (indexVal: PlainValue, listVal: PlainValue): PlainValue => {
    const list = ensureList(listVal, "item ... of");
    const index = mathBuiltins.to_number(indexVal);
    if (!Number.isInteger(index) || index < 1 || index > list.length) {
      throw new PlainError(
        `List item ${index} is out of range. The list contains ${list.length} item${list.length === 1 ? "" : "s"}.`,
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Remember that PLAIN uses 1-based indexing: item 1 is the first item."
        }
      );
    }
    return list[index - 1];
  },

  sort: (val: PlainValue): PlainValue[] => {
    const list = [...ensureList(val, "sort")];
    return list.sort((a, b) => {
      if (typeof a === "number" && typeof b === "number") return a - b;
      return plainToString(a).localeCompare(plainToString(b));
    });
  },

  reverse: (val: PlainValue): PlainValue[] => {
    const list = [...ensureList(val, "reverse")];
    return list.reverse();
  },

  sum: (val: PlainValue): number => {
    const list = ensureList(val, "sum");
    let total = 0;
    for (const item of list) {
      total += mathBuiltins.to_number(item);
    }
    return total;
  },

  average: (val: PlainValue): number => {
    const list = ensureList(val, "average");
    if (list.length === 0) {
      throw new PlainError(
        "I cannot calculate the average of an empty list.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Make sure the list has at least one number before finding the average."
        }
      );
    }
    return listBuiltins.sum(list) / list.length;
  },

  highest: (val: PlainValue): number => {
    const list = ensureList(val, "highest");
    if (list.length === 0) {
      throw new PlainError(
        "I cannot find the highest item because the list is empty.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Make sure the list has at least one number."
        }
      );
    }
    const numbers = list.map((item) => mathBuiltins.to_number(item));
    return Math.max(...numbers);
  },

  lowest: (val: PlainValue): number => {
    const list = ensureList(val, "lowest");
    if (list.length === 0) {
      throw new PlainError(
        "I cannot find the lowest item because the list is empty.",
        { line: 1, column: 1 },
        {
          kind: "RuntimeError",
          suggestion: "Make sure the list has at least one number."
        }
      );
    }
    const numbers = list.map((item) => mathBuiltins.to_number(item));
    return Math.min(...numbers);
  }
};

