"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.datascienceBuiltins = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const values_1 = require("../runtime/values");
const plain_error_1 = require("../errors/plain-error");
const stats_1 = require("./stats");
const math_1 = require("./math");
function parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            }
            else {
                inQuotes = !inQuotes;
            }
        }
        else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        }
        else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}
function getColumnIndex(table, colVal) {
    if (table.length === 0)
        return -1;
    const headers = table[0];
    if (typeof colVal === "number") {
        // 1-based indexing for PLAIN
        const idx = Math.floor(colVal) - 1;
        if (idx < 0 || idx >= headers.length) {
            throw new plain_error_1.PlainError(`Column index ${colVal} is out of bounds (table has ${headers.length} columns).`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        return idx;
    }
    const colName = (0, values_1.plainToString)(colVal).toLowerCase();
    for (let i = 0; i < headers.length; i++) {
        if ((0, values_1.plainToString)(headers[i]).toLowerCase() === colName) {
            return i;
        }
    }
    throw new plain_error_1.PlainError(`Column named '${(0, values_1.plainToString)(colVal)}' not found in table.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
}
exports.datascienceBuiltins = {
    parse_csv: (textVal) => {
        const text = (0, values_1.plainToString)(textVal);
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        const table = [];
        for (const line of lines) {
            const rawCols = parseCsvLine(line);
            const row = rawCols.map((c) => {
                const num = Number(c);
                return !isNaN(num) && c !== "" ? num : c;
            });
            table.push(row);
        }
        return table;
    },
    to_csv: (tableVal) => {
        if (!Array.isArray(tableVal)) {
            throw new plain_error_1.PlainError("to_csv expects a 2D list (table).", { line: 1, column: 1 }, { kind: "TypeError" });
        }
        return tableVal
            .map((row) => {
            if (!Array.isArray(row))
                return `"${(0, values_1.plainToString)(row)}"`;
            return row
                .map((cell) => {
                const s = (0, values_1.plainToString)(cell);
                if (s.includes(",") || s.includes('"') || s.includes("\n")) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            })
                .join(",");
        })
            .join("\n");
    },
    read_csv: (filePathVal) => {
        const fp = path.resolve((0, values_1.plainToString)(filePathVal));
        if (!fs.existsSync(fp)) {
            throw new plain_error_1.PlainError(`CSV file not found: "${fp}"`, { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        const content = fs.readFileSync(fp, "utf-8");
        return exports.datascienceBuiltins.parse_csv(content);
    },
    write_csv: (filePathVal, tableVal) => {
        const fp = path.resolve((0, values_1.plainToString)(filePathVal));
        const content = exports.datascienceBuiltins.to_csv(tableVal);
        fs.mkdirSync(path.dirname(fp), { recursive: true });
        fs.writeFileSync(fp, content, "utf-8");
    },
    table_headers: (tableVal) => {
        if (!Array.isArray(tableVal) || tableVal.length === 0)
            return [];
        return Array.isArray(tableVal[0]) ? tableVal[0] : [];
    },
    table_rows: (tableVal) => {
        if (!Array.isArray(tableVal) || tableVal.length <= 1)
            return [];
        return tableVal.slice(1);
    },
    table_column: (tableVal, colVal) => {
        if (!Array.isArray(tableVal) || tableVal.length === 0)
            return [];
        const idx = getColumnIndex(tableVal, colVal);
        const result = [];
        for (let i = 1; i < tableVal.length; i++) {
            const row = tableVal[i];
            if (Array.isArray(row) && idx < row.length) {
                result.push(row[idx]);
            }
        }
        return result;
    },
    filter_table: (tableVal, colVal, opVal, targetVal) => {
        if (!Array.isArray(tableVal) || tableVal.length === 0)
            return [];
        const idx = getColumnIndex(tableVal, colVal);
        const op = (0, values_1.plainToString)(opVal).trim();
        const headers = tableVal[0];
        const result = [headers];
        for (let i = 1; i < tableVal.length; i++) {
            const row = tableVal[i];
            if (!Array.isArray(row) || idx >= row.length)
                continue;
            const cell = row[idx];
            let match = false;
            if (op === "==" || op === "is equal to" || op === "equals") {
                match = cell === targetVal || String(cell) === String(targetVal);
            }
            else if (op === "!=" || op === "is not equal to") {
                match = cell !== targetVal && String(cell) !== String(targetVal);
            }
            else if (op === ">" || op === "is greater than") {
                match = Number(cell) > Number(targetVal);
            }
            else if (op === "<" || op === "is less than") {
                match = Number(cell) < Number(targetVal);
            }
            else if (op === ">=" || op === "is at least") {
                match = Number(cell) >= Number(targetVal);
            }
            else if (op === "<=" || op === "is at most") {
                match = Number(cell) <= Number(targetVal);
            }
            else if (op === "contains") {
                match = (0, values_1.plainToString)(cell).toLowerCase().includes((0, values_1.plainToString)(targetVal).toLowerCase());
            }
            if (match) {
                result.push(row);
            }
        }
        return result;
    },
    sort_table: (tableVal, colVal, ascendingVal) => {
        if (!Array.isArray(tableVal) || tableVal.length <= 1)
            return tableVal;
        const idx = getColumnIndex(tableVal, colVal);
        const asc = ascendingVal !== undefined ? Boolean(ascendingVal) : true;
        const headers = tableVal[0];
        const dataRows = tableVal.slice(1).slice();
        dataRows.sort((a, b) => {
            const valA = a[idx];
            const valB = b[idx];
            if (typeof valA === "number" && typeof valB === "number") {
                return asc ? valA - valB : valB - valA;
            }
            const strA = (0, values_1.plainToString)(valA);
            const strB = (0, values_1.plainToString)(valB);
            return asc ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
        return [headers, ...dataRows];
    },
    group_by_count: (tableVal, colVal) => {
        if (!Array.isArray(tableVal) || tableVal.length === 0 || !Array.isArray(tableVal[0]))
            return [];
        const idx = getColumnIndex(tableVal, colVal);
        const colName = (0, values_1.plainToString)(tableVal[0][idx]);
        const counts = {};
        for (let i = 1; i < tableVal.length; i++) {
            const row = tableVal[i];
            if (Array.isArray(row) && idx < row.length) {
                const key = (0, values_1.plainToString)(row[idx]);
                counts[key] = (counts[key] || 0) + 1;
            }
        }
        const result = [[colName, "Count"]];
        for (const [k, v] of Object.entries(counts)) {
            result.push([k, v]);
        }
        return result;
    },
    group_by_sum: (tableVal, groupColVal, sumColVal) => {
        if (!Array.isArray(tableVal) || tableVal.length === 0 || !Array.isArray(tableVal[0]))
            return [];
        const gIdx = getColumnIndex(tableVal, groupColVal);
        const sIdx = getColumnIndex(tableVal, sumColVal);
        const gName = (0, values_1.plainToString)(tableVal[0][gIdx]);
        const sName = (0, values_1.plainToString)(tableVal[0][sIdx]);
        const sums = {};
        for (let i = 1; i < tableVal.length; i++) {
            const row = tableVal[i];
            if (Array.isArray(row) && gIdx < row.length && sIdx < row.length) {
                const key = (0, values_1.plainToString)(row[gIdx]);
                const val = Number(row[sIdx]) || 0;
                sums[key] = (sums[key] || 0) + val;
            }
        }
        const result = [[gName, `Total ${sName}`]];
        for (const [k, v] of Object.entries(sums)) {
            result.push([k, Math.round(v * 100) / 100]);
        }
        return result;
    },
    describe_column: (colVal) => {
        if (!Array.isArray(colVal) || colVal.length === 0) {
            return ["count: 0"];
        }
        const nums = colVal.map((v) => Number(v)).filter((v) => !isNaN(v));
        if (nums.length === 0) {
            return [`count: ${colVal.length}`, "type: non-numeric"];
        }
        const count = nums.length;
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const mean = stats_1.statsBuiltins.mean(nums);
        const median = stats_1.statsBuiltins.median(nums);
        const stdev = stats_1.statsBuiltins.standard_deviation(nums);
        return [
            `count: ${count}`,
            `min: ${min}`,
            `max: ${max}`,
            `mean: ${Math.round(mean * 100) / 100}`,
            `median: ${median}`,
            `stdev: ${Math.round(stdev * 100) / 100}`
        ];
    },
    normalize_data: (listVal) => {
        if (!Array.isArray(listVal) || listVal.length === 0)
            return [];
        const nums = listVal.map((x) => math_1.mathBuiltins.to_number(x));
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        if (max === min)
            return nums.map(() => 0);
        return nums.map((x) => Math.round(((x - min) / (max - min)) * 10000) / 10000);
    },
    standardize_data: (listVal) => {
        if (!Array.isArray(listVal) || listVal.length === 0)
            return [];
        const nums = listVal.map((x) => math_1.mathBuiltins.to_number(x));
        const mean = stats_1.statsBuiltins.mean(nums);
        const stdev = stats_1.statsBuiltins.standard_deviation(nums);
        if (stdev === 0)
            return nums.map(() => 0);
        return nums.map((x) => Math.round(((x - mean) / stdev) * 10000) / 10000);
    },
    train_test_split: (dataVal, testRatioVal) => {
        if (!Array.isArray(dataVal))
            return [[], []];
        const ratio = testRatioVal !== undefined ? math_1.mathBuiltins.to_number(testRatioVal) : 0.2;
        const testCount = Math.max(1, Math.floor(dataVal.length * ratio));
        const shuffled = dataVal.slice().sort(() => Math.random() - 0.5);
        const test = shuffled.slice(0, testCount);
        const train = shuffled.slice(testCount);
        return [train, test];
    },
    ascii_bar_chart: (labelsVal, valuesVal, maxWidthVal) => {
        if (!Array.isArray(labelsVal) || !Array.isArray(valuesVal)) {
            throw new plain_error_1.PlainError("ascii_bar_chart expects labels list and values list.", { line: 1, column: 1 }, { kind: "TypeError" });
        }
        const width = maxWidthVal !== undefined ? math_1.mathBuiltins.to_number(maxWidthVal) : 30;
        const nums = valuesVal.map((v) => Number(v) || 0);
        const maxVal = Math.max(...nums, 1);
        const maxLabelLen = Math.max(...labelsVal.map((l) => (0, values_1.plainToString)(l).length), 1);
        const lines = [];
        for (let i = 0; i < labelsVal.length; i++) {
            const label = (0, values_1.plainToString)(labelsVal[i]).padEnd(maxLabelLen);
            const val = nums[i] || 0;
            const barLen = Math.round((val / maxVal) * width);
            const bar = "█".repeat(Math.max(0, barLen));
            lines.push(`${label} | ${bar} ${val}`);
        }
        return lines.join("\n");
    },
    ascii_histogram: (listVal, binsVal) => {
        if (!Array.isArray(listVal) || listVal.length === 0)
            return "";
        const numBins = binsVal !== undefined ? Math.max(2, Math.floor(math_1.mathBuiltins.to_number(binsVal))) : 5;
        const nums = listVal.map((v) => Number(v) || 0);
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const binWidth = (max - min) / numBins || 1;
        const counts = new Array(numBins).fill(0);
        for (const n of nums) {
            let b = Math.floor((n - min) / binWidth);
            if (b >= numBins)
                b = numBins - 1;
            counts[b]++;
        }
        const maxCount = Math.max(...counts, 1);
        const lines = [];
        for (let i = 0; i < numBins; i++) {
            const lower = Math.round((min + i * binWidth) * 10) / 10;
            const upper = Math.round((min + (i + 1) * binWidth) * 10) / 10;
            const bar = "█".repeat(Math.round((counts[i] / maxCount) * 25));
            lines.push(`[${lower} - ${upper}] | ${bar} (${counts[i]})`);
        }
        return lines.join("\n");
    },
    export_html_chart: (titleVal, typeVal, labelsVal, dataVal, filePathVal) => {
        const title = (0, values_1.plainToString)(titleVal);
        const chartType = (0, values_1.plainToString)(typeVal).toLowerCase(); // 'bar' or 'line'
        const labels = Array.isArray(labelsVal) ? labelsVal.map((l) => (0, values_1.plainToString)(l)) : [];
        const data = Array.isArray(dataVal) ? dataVal.map((d) => Number(d) || 0) : [];
        const fp = path.resolve((0, values_1.plainToString)(filePathVal));
        const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; padding: 2rem; background: #f8fafc; }
    .card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); width: 800px; max-width: 95%; }
    h2 { text-align: center; color: #1e293b; }
  </style>
</head>
<body>
  <div class="card">
    <h2>${title}</h2>
    <canvas id="myChart"></canvas>
  </div>
  <script>
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: '${chartType === "line" ? "line" : "bar"}',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          label: '${title}',
          data: ${JSON.stringify(data)},
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2
        }]
      },
      options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
  </script>
</body>
</html>`;
        fs.mkdirSync(path.dirname(fp), { recursive: true });
        fs.writeFileSync(fp, html, "utf-8");
        return `Interactive HTML chart saved to: ${fp}`;
    }
};
//# sourceMappingURL=datascience.js.map