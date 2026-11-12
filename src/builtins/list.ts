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
      throw new PlainError("I cannot get the first item because the list is empty.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return list[0];
  },

  last: (val: PlainValue): PlainValue => {
    const list = ensureList(val, "last");
    if (list.length === 0) {
      throw new PlainError("I cannot get the last item because the list is empty.", { line: 1, column: 1 }, { kind: "RuntimeError" });
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
        { kind: "RuntimeError", suggestion: "Remember that PLAIN uses 1-based indexing: item 1 is the first item." }
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
      throw new PlainError("I cannot calculate the average of an empty list.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return listBuiltins.sum(list) / list.length;
  },

  highest: (val: PlainValue): number => {
    const list = ensureList(val, "highest");
    if (list.length === 0) {
      throw new PlainError("I cannot find the highest item because the list is empty.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const numbers = list.map((item) => mathBuiltins.to_number(item));
    return Math.max(...numbers);
  },

  lowest: (val: PlainValue): number => {
    const list = ensureList(val, "lowest");
    if (list.length === 0) {
      throw new PlainError("I cannot find the lowest item because the list is empty.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const numbers = list.map((item) => mathBuiltins.to_number(item));
    return Math.min(...numbers);
  },

  unique: (val: PlainValue): PlainValue[] => {
    const list = ensureList(val, "unique");
    const seen = new Set<string>();
    const res: PlainValue[] = [];
    for (const item of list) {
      const k = typeof item + ":" + plainToString(item);
      if (!seen.has(k)) {
        seen.add(k);
        res.push(item);
      }
    }
    return res;
  },

  shuffle: (val: PlainValue): PlainValue[] => {
    const list = [...ensureList(val, "shuffle")];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  },

  sample: (val: PlainValue): PlainValue => {
    const list = ensureList(val, "sample");
    if (list.length === 0) return null;
    const idx = Math.floor(Math.random() * list.length);
    return list[idx];
  },

  take: (val: PlainValue, countVal: PlainValue): PlainValue[] => {
    const list = ensureList(val, "take");
    const count = Math.max(0, Math.round(mathBuiltins.to_number(countVal)));
    return list.slice(0, count);
  },

  drop: (val: PlainValue, countVal: PlainValue): PlainValue[] => {
    const list = ensureList(val, "drop");
    const count = Math.max(0, Math.round(mathBuiltins.to_number(countVal)));
    return list.slice(count);
  },

  flatten: (val: PlainValue): PlainValue[] => {
    const list = ensureList(val, "flatten");
    const res: PlainValue[] = [];
    for (const item of list) {
      if (Array.isArray(item)) {
        res.push(...item);
      } else {
        res.push(item);
      }
    }
    return res;
  },

  chunk: (val: PlainValue, sizeVal: PlainValue): PlainValue[][] => {
    const list = ensureList(val, "chunk");
    const size = Math.max(1, Math.round(mathBuiltins.to_number(sizeVal)));
    const res: PlainValue[][] = [];
    for (let i = 0; i < list.length; i += size) {
      res.push(list.slice(i, i + size));
    }
    return res;
  },

  intersection: (listAVal: PlainValue, listBVal: PlainValue): PlainValue[] => {
    const a = ensureList(listAVal, "intersection");
    const b = ensureList(listBVal, "intersection");
    return a.filter((itemA) => b.some((itemB) => plainToString(itemA) === plainToString(itemB)));
  },

  union: (listAVal: PlainValue, listBVal: PlainValue): PlainValue[] => {
    const a = ensureList(listAVal, "union");
    const b = ensureList(listBVal, "union");
    return listBuiltins.unique([...a, ...b]);
  },

  difference: (listAVal: PlainValue, listBVal: PlainValue): PlainValue[] => {
    const a = ensureList(listAVal, "difference");
    const b = ensureList(listBVal, "difference");
    return a.filter((itemA) => !b.some((itemB) => plainToString(itemA) === plainToString(itemB)));
  },

  zip: (listAVal: PlainValue, listBVal: PlainValue): PlainValue[][] => {
    const a = ensureList(listAVal, "zip");
    const b = ensureList(listBVal, "zip");
    const minLen = Math.min(a.length, b.length);
    const res: PlainValue[][] = [];
    for (let i = 0; i < minLen; i++) {
      res.push([a[i], b[i]]);
    }
    return res;
  },

  find_index: (listVal: PlainValue, itemVal: PlainValue): number => {
    const list = ensureList(listVal, "find_index");
    for (let i = 0; i < list.length; i++) {
      if (list[i] === itemVal || plainToString(list[i]) === plainToString(itemVal)) {
        return i + 1; // 1-based indexing
      }
    }
    return 0; // 0 means not found in 1-based language
  },

  slice_list: (listVal: PlainValue, startVal: PlainValue, endVal?: PlainValue): PlainValue[] => {
    const list = ensureList(listVal, "slice_list");
    const start = Math.max(0, mathBuiltins.to_number(startVal) - 1); // 1-based
    if (endVal !== undefined) {
      const end = mathBuiltins.to_number(endVal);
      return list.slice(start, end);
    }
    return list.slice(start);
  },

  insert_at: (listVal: PlainValue, indexVal: PlainValue, itemVal: PlainValue): PlainValue[] => {
    const list = [...ensureList(listVal, "insert_at")];
    const idx = Math.max(0, Math.min(list.length, mathBuiltins.to_number(indexVal) - 1));
    list.splice(idx, 0, itemVal);
    return list;
  },

  is_empty: (val: PlainValue): boolean => {
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === "string") return val.length === 0;
    return val === null || val === undefined;
  },

  is_sorted: (val: PlainValue): boolean => {
    const list = ensureList(val, "is_sorted");
    for (let i = 0; i < list.length - 1; i++) {
      if (typeof list[i] === "number" && typeof list[i + 1] === "number") {
        if ((list[i] as number) > (list[i + 1] as number)) return false;
      } else {
        if (plainToString(list[i]).localeCompare(plainToString(list[i + 1])) > 0) return false;
      }
    }
    return true;
  },

  fill_list: (val: PlainValue, countVal: PlainValue): PlainValue[] => {
    const count = Math.max(0, Math.round(mathBuiltins.to_number(countVal)));
    return new Array(count).fill(val);
  },

  range_list: (startVal: PlainValue, endVal: PlainValue, stepVal?: PlainValue): number[] => {
    const start = mathBuiltins.to_number(startVal);
    const end = mathBuiltins.to_number(endVal);
    const step = stepVal ? mathBuiltins.to_number(stepVal) : start <= end ? 1 : -1;
    if (step === 0) throw new PlainError("Step cannot be zero in range.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const res: number[] = [];
    if (step > 0) {
      for (let i = start; i <= end; i += step) res.push(i);
    } else {
      for (let i = start; i >= end; i += step) res.push(i);
    }
    return res;
  }
};
