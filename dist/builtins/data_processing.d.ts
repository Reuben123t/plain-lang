import { PlainObject, PlainValue } from "../runtime/values";
export declare const dataProcessingBuiltins: {
    table_head: (tableVal: any, n?: number) => PlainValue[][];
    table_tail: (tableVal: any, n?: number) => PlainValue[][];
    table_column_names: (tableVal: any) => string[];
    table_add_column: (tableVal: any, colName: string, values: any) => PlainValue[][];
    table_drop_column: (tableVal: any, colName: string) => PlainValue[][];
    table_select_columns: (tableVal: any, colNames: any) => PlainValue[][];
    table_deduplicate: (tableVal: any) => PlainValue[][];
    table_drop_nulls: (tableVal: any) => PlainValue[][];
    table_fill_nulls: (tableVal: any, fallbackVal?: any) => PlainValue[][];
    table_join_inner: (tableA: any, tableB: any, keyCol: string) => PlainValue[][];
    table_group_by_sum: (tableVal: any, groupCol: string, sumCol: string) => PlainObject;
    table_group_by_count: (tableVal: any, groupCol: string) => PlainObject;
    series_rolling_mean: (seriesVal: any, windowSize?: number) => number[];
    series_rolling_sum: (seriesVal: any, windowSize?: number) => number[];
    series_pct_change: (seriesVal: any) => number[];
    series_cumulative_sum: (seriesVal: any) => number[];
    series_z_score: (seriesVal: any) => number[];
    student_t_test_one_sample: (sampleVal: any, muVal?: number) => PlainObject;
    pearson_correlation: (xVal: any, yVal: any) => number;
};
//# sourceMappingURL=data_processing.d.ts.map