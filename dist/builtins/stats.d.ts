import { PlainValue } from "../runtime/values";
export declare const statsBuiltins: {
    mean: (listVal: PlainValue) => number;
    median: (listVal: PlainValue) => number;
    mode: (listVal: PlainValue) => PlainValue;
    range_of: (listVal: PlainValue) => number;
    variance: (listVal: PlainValue) => number;
    standard_deviation: (listVal: PlainValue) => number;
    z_score: (valueVal: PlainValue, meanVal: PlainValue, stdevVal: PlainValue) => number;
    percentile: (listVal: PlainValue, pVal: PlainValue) => number;
    quartiles: (listVal: PlainValue) => number[];
    iqr: (listVal: PlainValue) => number;
    frequency_table: (listVal: PlainValue) => Record<string, number>;
    covariance: (listAVal: PlainValue, listBVal: PlainValue) => number;
    correlation: (listAVal: PlainValue, listBVal: PlainValue) => number;
    linear_regression: (xListVal: PlainValue, yListVal: PlainValue) => {
        slope: number;
        intercept: number;
    };
    cumulative_sum: (listVal: PlainValue) => number[];
    product_of: (listVal: PlainValue) => number;
};
//# sourceMappingURL=stats.d.ts.map