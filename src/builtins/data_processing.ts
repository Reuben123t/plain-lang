import { PlainObject, PlainValue } from "../runtime/values";

export const dataProcessingBuiltins = {
  // 1. Advanced Table / DataFrame Operations
  table_head: (tableVal: any, n: number = 5): PlainValue[][] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const count = Math.max(1, Math.floor(Number(n)));
    return [tableVal[0], ...tableVal.slice(1, count + 1)];
  },

  table_tail: (tableVal: any, n: number = 5): PlainValue[][] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const count = Math.max(1, Math.floor(Number(n)));
    const rows = tableVal.slice(1);
    return [tableVal[0], ...rows.slice(Math.max(0, rows.length - count))];
  },

  table_column_names: (tableVal: any): string[] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    return (tableVal[0] as PlainValue[]).map(String);
  },

  table_add_column: (tableVal: any, colName: string, values: any): PlainValue[][] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const vals = Array.isArray(values) ? values : [values];
    const newHeader = [...tableVal[0], String(colName)];
    const newRows = tableVal.slice(1).map((row: any, i: number) => {
      const rowArr = Array.isArray(row) ? [...row] : [row];
      rowArr.push(vals[i] !== undefined ? vals[i] : null);
      return rowArr;
    });
    return [newHeader, ...newRows];
  },

  table_drop_column: (tableVal: any, colName: string): PlainValue[][] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const header = tableVal[0] as PlainValue[];
    const idx = header.indexOf(String(colName));
    if (idx === -1) return tableVal;
    return tableVal.map((row: any) => {
      const arr = Array.isArray(row) ? [...row] : [row];
      arr.splice(idx, 1);
      return arr;
    });
  },

  table_select_columns: (tableVal: any, colNames: any): PlainValue[][] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const requested = Array.isArray(colNames) ? colNames.map(String) : [String(colNames)];
    const header = tableVal[0] as PlainValue[];
    const indices = requested.map((col) => header.indexOf(col)).filter((i) => i !== -1);
    return tableVal.map((row: any) => indices.map((i) => row[i]));
  },

  table_deduplicate: (tableVal: any): PlainValue[][] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const header = tableVal[0];
    const seen = new Set<string>();
    const uniqueRows: PlainValue[][] = [];
    for (const row of tableVal.slice(1)) {
      const key = JSON.stringify(row);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRows.push(row);
      }
    }
    return [header, ...uniqueRows];
  },

  table_drop_nulls: (tableVal: any): PlainValue[][] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const header = tableVal[0];
    const cleanRows = tableVal.slice(1).filter((row: any) =>
      Array.isArray(row) && row.every((val) => val !== null && val !== undefined && val !== "")
    );
    return [header, ...cleanRows];
  },

  table_fill_nulls: (tableVal: any, fallbackVal: any = 0): PlainValue[][] => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return [];
    const header = tableVal[0];
    const filledRows = tableVal.slice(1).map((row: any) =>
      (row as PlainValue[]).map((val) => (val === null || val === undefined || val === "" ? fallbackVal : val))
    );
    return [header, ...filledRows];
  },

  table_join_inner: (tableA: any, tableB: any, keyCol: string): PlainValue[][] => {
    if (!Array.isArray(tableA) || !Array.isArray(tableB)) return [];
    const headerA = (tableA[0] as PlainValue[]) || [];
    const headerB = (tableB[0] as PlainValue[]) || [];
    const keyA = headerA.indexOf(keyCol);
    const keyB = headerB.indexOf(keyCol);
    if (keyA === -1 || keyB === -1) return [];

    const extraBIndices = headerB.map((_, i) => i).filter((i) => i !== keyB);
    const joinedHeader = [...headerA, ...extraBIndices.map((i) => headerB[i])];

    const bMap = new Map<string, PlainValue[]>();
    for (const row of tableB.slice(1)) {
      const k = String(row[keyB]);
      bMap.set(k, row);
    }

    const resultRows: PlainValue[][] = [];
    for (const rowA of tableA.slice(1)) {
      const k = String(rowA[keyA]);
      const matchB = bMap.get(k);
      if (matchB) {
        resultRows.push([...rowA, ...extraBIndices.map((i) => matchB[i])]);
      }
    }
    return [joinedHeader, ...resultRows];
  },

  table_group_by_sum: (tableVal: any, groupCol: string, sumCol: string): PlainObject => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return {};
    const header = tableVal[0] as PlainValue[];
    const gIdx = header.indexOf(groupCol);
    const sIdx = header.indexOf(sumCol);
    if (gIdx === -1 || sIdx === -1) return {};

    const totals: Record<string, number> = {};
    for (const row of tableVal.slice(1)) {
      const groupKey = String(row[gIdx]);
      const val = parseFloat(String(row[sIdx])) || 0;
      totals[groupKey] = (totals[groupKey] || 0) + val;
    }
    return totals;
  },

  table_group_by_count: (tableVal: any, groupCol: string): PlainObject => {
    if (!Array.isArray(tableVal) || tableVal.length === 0) return {};
    const header = tableVal[0] as PlainValue[];
    const gIdx = header.indexOf(groupCol);
    if (gIdx === -1) return {};

    const counts: Record<string, number> = {};
    for (const row of tableVal.slice(1)) {
      const groupKey = String(row[gIdx]);
      counts[groupKey] = (counts[groupKey] || 0) + 1;
    }
    return counts;
  },

  // 2. Series / Array Processing
  series_rolling_mean: (seriesVal: any, windowSize: number = 3): number[] => {
    const arr = Array.isArray(seriesVal) ? seriesVal.map(Number) : [];
    const w = Math.max(1, Math.floor(Number(windowSize)));
    const result: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - w + 1);
      const window = arr.slice(start, i + 1);
      const mean = window.reduce((a, b) => a + b, 0) / window.length;
      result.push(parseFloat(mean.toFixed(4)));
    }
    return result;
  },

  series_rolling_sum: (seriesVal: any, windowSize: number = 3): number[] => {
    const arr = Array.isArray(seriesVal) ? seriesVal.map(Number) : [];
    const w = Math.max(1, Math.floor(Number(windowSize)));
    const result: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const start = Math.max(0, i - w + 1);
      const sum = arr.slice(start, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum);
    }
    return result;
  },

  series_pct_change: (seriesVal: any): number[] => {
    const arr = Array.isArray(seriesVal) ? seriesVal.map(Number) : [];
    const result: number[] = [0];
    for (let i = 1; i < arr.length; i++) {
      const prev = arr[i - 1];
      const change = prev === 0 ? 0 : (arr[i] - prev) / Math.abs(prev);
      result.push(parseFloat((change * 100).toFixed(2)));
    }
    return result;
  },

  series_cumulative_sum: (seriesVal: any): number[] => {
    const arr = Array.isArray(seriesVal) ? seriesVal.map(Number) : [];
    let acc = 0;
    return arr.map((x) => (acc += x));
  },

  series_z_score: (seriesVal: any): number[] => {
    const arr = Array.isArray(seriesVal) ? seriesVal.map(Number) : [];
    if (arr.length === 0) return [];
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length) || 1e-7;
    return arr.map((x) => parseFloat(((x - mean) / std).toFixed(4)));
  },

  // 3. Inferential Statistics
  student_t_test_one_sample: (sampleVal: any, muVal: number = 0): PlainObject => {
    const arr = Array.isArray(sampleVal) ? sampleVal.map(Number) : [];
    const mu = Number(muVal);
    const n = arr.length;
    if (n < 2) return { t_stat: 0, p_value_approx: 1, df: 0 };
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
    const se = Math.sqrt(variance / n);
    const tStat = se === 0 ? 0 : (mean - mu) / se;
    return {
      t_stat: parseFloat(tStat.toFixed(4)),
      sample_mean: mean,
      hypothesized_mean: mu,
      degrees_of_freedom: n - 1
    };
  },

  pearson_correlation: (xVal: any, yVal: any): number => {
    const x = Array.isArray(xVal) ? xVal.map(Number) : [];
    const y = Array.isArray(yVal) ? yVal.map(Number) : [];
    const n = Math.min(x.length, y.length);
    if (n < 2) return 0;
    const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const den = Math.sqrt(denX * denY);
    return den === 0 ? 0 : parseFloat((num / den).toFixed(4));
  }
};
