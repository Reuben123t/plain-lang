import { PlainValue, plainToString } from "../runtime/values";
import { mathBuiltins } from "./math";
import { PlainError } from "../errors/plain-error";

function getNumericArray(val: PlainValue, fnName: string): number[] {
  if (!Array.isArray(val)) {
    throw new PlainError(`'${fnName}' expects a list of numbers.`, { line: 1, column: 1 }, { kind: "TypeError" });
  }
  if (val.length === 0) {
    throw new PlainError(`'${fnName}' cannot be calculated on an empty list.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
  }
  return val.map((v) => mathBuiltins.to_number(v));
}

export const statsBuiltins = {
  mean: (listVal: PlainValue): number => {
    const arr = getNumericArray(listVal, "mean");
    const sum = arr.reduce((acc, v) => acc + v, 0);
    return sum / arr.length;
  },

  median: (listVal: PlainValue): number => {
    const arr = [...getNumericArray(listVal, "median")].sort((a, b) => a - b);
    const mid = Math.floor(arr.length / 2);
    if (arr.length % 2 !== 0) return arr[mid];
    return (arr[mid - 1] + arr[mid]) / 2;
  },

  mode: (listVal: PlainValue): PlainValue => {
    if (!Array.isArray(listVal) || listVal.length === 0) {
      throw new PlainError("'mode' expects a non-empty list.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    const freq: Record<string, { item: PlainValue; count: number }> = {};
    let maxCount = 0;
    let modeVal: PlainValue = listVal[0];

    for (const item of listVal) {
      const key = plainToString(item);
      if (!freq[key]) freq[key] = { item, count: 0 };
      freq[key].count++;
      if (freq[key].count > maxCount) {
        maxCount = freq[key].count;
        modeVal = item;
      }
    }
    return modeVal;
  },

  range_of: (listVal: PlainValue): number => {
    const arr = getNumericArray(listVal, "range_of");
    return Math.max(...arr) - Math.min(...arr);
  },

  variance: (listVal: PlainValue): number => {
    const arr = getNumericArray(listVal, "variance");
    const avg = statsBuiltins.mean(arr);
    const sumSqDiff = arr.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0);
    return sumSqDiff / arr.length;
  },

  standard_deviation: (listVal: PlainValue): number => {
    return Math.sqrt(statsBuiltins.variance(listVal));
  },

  z_score: (valueVal: PlainValue, meanVal: PlainValue, stdevVal: PlainValue): number => {
    const v = mathBuiltins.to_number(valueVal);
    const m = mathBuiltins.to_number(meanVal);
    const s = mathBuiltins.to_number(stdevVal);
    if (s === 0) throw new PlainError("Standard deviation cannot be zero for z-score.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return (v - m) / s;
  },

  percentile: (listVal: PlainValue, pVal: PlainValue): number => {
    const arr = [...getNumericArray(listVal, "percentile")].sort((a, b) => a - b);
    const p = mathBuiltins.to_number(pVal);
    if (p < 0 || p > 100) throw new PlainError("Percentile must be between 0 and 100.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const idx = (p / 100) * (arr.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return arr[lower];
    return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
  },

  quartiles: (listVal: PlainValue): number[] => {
    return [
      statsBuiltins.percentile(listVal, 25),
      statsBuiltins.percentile(listVal, 50),
      statsBuiltins.percentile(listVal, 75)
    ];
  },

  iqr: (listVal: PlainValue): number => {
    const q1 = statsBuiltins.percentile(listVal, 25);
    const q3 = statsBuiltins.percentile(listVal, 75);
    return q3 - q1;
  },

  frequency_table: (listVal: PlainValue): Record<string, number> => {
    if (!Array.isArray(listVal)) throw new PlainError("'frequency_table' expects a list.", { line: 1, column: 1 }, { kind: "TypeError" });
    const table: Record<string, number> = {};
    for (const item of listVal) {
      const k = plainToString(item);
      table[k] = (table[k] || 0) + 1;
    }
    return table;
  },

  covariance: (listAVal: PlainValue, listBVal: PlainValue): number => {
    const a = getNumericArray(listAVal, "covariance");
    const b = getNumericArray(listBVal, "covariance");
    if (a.length !== b.length) throw new PlainError("Lists must have equal lengths for covariance.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const meanA = statsBuiltins.mean(a);
    const meanB = statsBuiltins.mean(b);
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - meanA) * (b[i] - meanB);
    }
    return sum / a.length;
  },

  correlation: (listAVal: PlainValue, listBVal: PlainValue): number => {
    const cov = statsBuiltins.covariance(listAVal, listBVal);
    const stdevA = statsBuiltins.standard_deviation(listAVal);
    const stdevB = statsBuiltins.standard_deviation(listBVal);
    if (stdevA === 0 || stdevB === 0) return 0;
    return cov / (stdevA * stdevB);
  },

  linear_regression: (xListVal: PlainValue, yListVal: PlainValue): { slope: number; intercept: number } => {
    const x = getNumericArray(xListVal, "linear_regression");
    const y = getNumericArray(yListVal, "linear_regression");
    if (x.length !== y.length) throw new PlainError("Lists must have equal lengths for linear regression.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const meanX = statsBuiltins.mean(x);
    const meanY = statsBuiltins.mean(y);
    let num = 0;
    let den = 0;
    for (let i = 0; i < x.length; i++) {
      num += (x[i] - meanX) * (y[i] - meanY);
      den += Math.pow(x[i] - meanX, 2);
    }
    if (den === 0) throw new PlainError("Denominator in linear regression is zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    const slope = num / den;
    const intercept = meanY - slope * meanX;
    return { slope, intercept };
  },

  cumulative_sum: (listVal: PlainValue): number[] => {
    const arr = getNumericArray(listVal, "cumulative_sum");
    const res: number[] = [];
    let cur = 0;
    for (const v of arr) {
      cur += v;
      res.push(cur);
    }
    return res;
  },

  product_of: (listVal: PlainValue): number => {
    const arr = getNumericArray(listVal, "product_of");
    return arr.reduce((acc, v) => acc * v, 1);
  }
};

