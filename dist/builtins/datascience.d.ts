import { PlainValue } from "../runtime/values";
export declare const datascienceBuiltins: {
    parse_csv: (textVal: PlainValue) => PlainValue[][];
    to_csv: (tableVal: PlainValue) => string;
    read_csv: (filePathVal: PlainValue) => PlainValue[][];
    write_csv: (filePathVal: PlainValue, tableVal: PlainValue) => void;
    table_headers: (tableVal: PlainValue) => PlainValue[];
    table_rows: (tableVal: PlainValue) => PlainValue[][];
    table_column: (tableVal: PlainValue, colVal: PlainValue) => PlainValue[];
    filter_table: (tableVal: PlainValue, colVal: PlainValue, opVal: PlainValue, targetVal: PlainValue) => PlainValue[][];
    sort_table: (tableVal: PlainValue, colVal: PlainValue, ascendingVal?: PlainValue) => PlainValue[][];
    group_by_count: (tableVal: PlainValue, colVal: PlainValue) => PlainValue[][];
    group_by_sum: (tableVal: PlainValue, groupColVal: PlainValue, sumColVal: PlainValue) => PlainValue[][];
    describe_column: (colVal: PlainValue) => string[];
    normalize_data: (listVal: PlainValue) => number[];
    standardize_data: (listVal: PlainValue) => number[];
    train_test_split: (dataVal: PlainValue, testRatioVal?: PlainValue) => [PlainValue[], PlainValue[]];
    ascii_bar_chart: (labelsVal: PlainValue, valuesVal: PlainValue, maxWidthVal?: PlainValue) => string;
    ascii_histogram: (listVal: PlainValue, binsVal?: PlainValue) => string;
    export_html_chart: (titleVal: PlainValue, typeVal: PlainValue, labelsVal: PlainValue, dataVal: PlainValue, filePathVal: PlainValue) => string;
};
//# sourceMappingURL=datascience.d.ts.map