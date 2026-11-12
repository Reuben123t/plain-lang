"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsBuiltins = void 0;
const values_1 = require("../runtime/values");
const math_1 = require("./math");
const plain_error_1 = require("../errors/plain-error");
function getNumericArray(val, fnName) {
    if (!Array.isArray(val)) {
        throw new plain_error_1.PlainError(`'${fnName}' expects a list of numbers.`, { line: 1, column: 1 }, { kind: "TypeError" });
    }
    if (val.length === 0) {
        throw new plain_error_1.PlainError(`'${fnName}' cannot be calculated on an empty list.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    return val.map((v) => math_1.mathBuiltins.to_number(v));
}
exports.statsBuiltins = {
    mean: (listVal) => {
        const arr = getNumericArray(listVal, "mean");
        const sum = arr.reduce((acc, v) => acc + v, 0);
        return sum / arr.length;
    },
    median: (listVal) => {
        const arr = [...getNumericArray(listVal, "median")].sort((a, b) => a - b);
        const mid = Math.floor(arr.length / 2);
        if (arr.length % 2 !== 0)
            return arr[mid];
        return (arr[mid - 1] + arr[mid]) / 2;
    },
    mode: (listVal) => {
        if (!Array.isArray(listVal) || listVal.length === 0) {
            throw new plain_error_1.PlainError("'mode' expects a non-empty list.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        const freq = {};
        let maxCount = 0;
        let modeVal = listVal[0];
        for (const item of listVal) {
            const key = (0, values_1.plainToString)(item);
            if (!freq[key])
                freq[key] = { item, count: 0 };
            freq[key].count++;
            if (freq[key].count > maxCount) {
                maxCount = freq[key].count;
                modeVal = item;
            }
        }
        return modeVal;
    },
    range_of: (listVal) => {
        const arr = getNumericArray(listVal, "range_of");
        return Math.max(...arr) - Math.min(...arr);
    },
    variance: (listVal) => {
        const arr = getNumericArray(listVal, "variance");
        const avg = exports.statsBuiltins.mean(arr);
        const sumSqDiff = arr.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0);
        return sumSqDiff / arr.length;
    },
    standard_deviation: (listVal) => {
        return Math.sqrt(exports.statsBuiltins.variance(listVal));
    },
    z_score: (valueVal, meanVal, stdevVal) => {
        const v = math_1.mathBuiltins.to_number(valueVal);
        const m = math_1.mathBuiltins.to_number(meanVal);
        const s = math_1.mathBuiltins.to_number(stdevVal);
        if (s === 0)
            throw new plain_error_1.PlainError("Standard deviation cannot be zero for z-score.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return (v - m) / s;
    },
    percentile: (listVal, pVal) => {
        const arr = [...getNumericArray(listVal, "percentile")].sort((a, b) => a - b);
        const p = math_1.mathBuiltins.to_number(pVal);
        if (p < 0 || p > 100)
            throw new plain_error_1.PlainError("Percentile must be between 0 and 100.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        const idx = (p / 100) * (arr.length - 1);
        const lower = Math.floor(idx);
        const upper = Math.ceil(idx);
        if (lower === upper)
            return arr[lower];
        return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
    },
    quartiles: (listVal) => {
        return [
            exports.statsBuiltins.percentile(listVal, 25),
            exports.statsBuiltins.percentile(listVal, 50),
            exports.statsBuiltins.percentile(listVal, 75)
        ];
    },
    iqr: (listVal) => {
        const q1 = exports.statsBuiltins.percentile(listVal, 25);
        const q3 = exports.statsBuiltins.percentile(listVal, 75);
        return q3 - q1;
    },
    frequency_table: (listVal) => {
        if (!Array.isArray(listVal))
            throw new plain_error_1.PlainError("'frequency_table' expects a list.", { line: 1, column: 1 }, { kind: "TypeError" });
        const table = {};
        for (const item of listVal) {
            const k = (0, values_1.plainToString)(item);
            table[k] = (table[k] || 0) + 1;
        }
        return table;
    },
    covariance: (listAVal, listBVal) => {
        const a = getNumericArray(listAVal, "covariance");
        const b = getNumericArray(listBVal, "covariance");
        if (a.length !== b.length)
            throw new plain_error_1.PlainError("Lists must have equal lengths for covariance.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        const meanA = exports.statsBuiltins.mean(a);
        const meanB = exports.statsBuiltins.mean(b);
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
            sum += (a[i] - meanA) * (b[i] - meanB);
        }
        return sum / a.length;
    },
    correlation: (listAVal, listBVal) => {
        const cov = exports.statsBuiltins.covariance(listAVal, listBVal);
        const stdevA = exports.statsBuiltins.standard_deviation(listAVal);
        const stdevB = exports.statsBuiltins.standard_deviation(listBVal);
        if (stdevA === 0 || stdevB === 0)
            return 0;
        return cov / (stdevA * stdevB);
    },
    linear_regression: (xListVal, yListVal) => {
        const x = getNumericArray(xListVal, "linear_regression");
        const y = getNumericArray(yListVal, "linear_regression");
        if (x.length !== y.length)
            throw new plain_error_1.PlainError("Lists must have equal lengths for linear regression.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        const meanX = exports.statsBuiltins.mean(x);
        const meanY = exports.statsBuiltins.mean(y);
        let num = 0;
        let den = 0;
        for (let i = 0; i < x.length; i++) {
            num += (x[i] - meanX) * (y[i] - meanY);
            den += Math.pow(x[i] - meanX, 2);
        }
        if (den === 0)
            throw new plain_error_1.PlainError("Denominator in linear regression is zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        const slope = num / den;
        const intercept = meanY - slope * meanX;
        return { slope, intercept };
    },
    cumulative_sum: (listVal) => {
        const arr = getNumericArray(listVal, "cumulative_sum");
        const res = [];
        let cur = 0;
        for (const v of arr) {
            cur += v;
            res.push(cur);
        }
        return res;
    },
    product_of: (listVal) => {
        const arr = getNumericArray(listVal, "product_of");
        return arr.reduce((acc, v) => acc * v, 1);
    }
};
//# sourceMappingURL=stats.js.map