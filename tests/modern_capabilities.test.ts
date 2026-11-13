import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createStandardEnvironment } from "../src/builtins/index";
import { runPlain } from "../src/index";

async function executePlain(code: string): Promise<string[]> {
  const outputs: string[] = [];
  await runPlain(code, {
    onSay: (msg) => outputs.push(msg),
    onShow: (msg) => outputs.push(msg)
  });
  return outputs;
}

describe("Modern Capabilities: Web, Data Science, AI & Automation", () => {
  it("evaluates Web Development functions (HTML generation & templates)", () => {
    const env = createStandardEnvironment();
    const htmlPage = env.lookup("html_page") as any;
    const htmlTag = env.lookup("html_tag") as any;
    const htmlTable = env.lookup("html_table") as any;
    const renderTpl = env.lookup("render_template") as any;
    const parseQuery = env.lookup("parse_query_string") as any;

    const page = htmlPage.nativeFn("My Site", "<h1>Hello</h1>");
    assert.ok(page.includes("<title>My Site</title>"));
    assert.ok(page.includes("<h1>Hello</h1>"));

    const tag = htmlTag.nativeFn("button", "Click Me", "class='btn'");
    assert.equal(tag, "<button class='btn'>Click Me</button>");

    const table = htmlTable.nativeFn(["Name", "Age"], [["Alice", 20], ["Bob", 22]]);
    assert.ok(table.includes("<th>Name</th>"));
    assert.ok(table.includes("<td>Alice</td>"));

    const rendered = renderTpl.nativeFn("Hello, {{name}}! You have {{count}} messages.", [
      "name: Reuben",
      "count: 5"
    ]);
    assert.equal(rendered, "Hello, Reuben! You have 5 messages.");

    const query = parseQuery.nativeFn("?search=plain&limit=10");
    assert.deepEqual(query, { search: "plain", limit: "10" });
  });

  it("evaluates Data Science functions (CSV, tables, statistics & charts)", () => {
    const env = createStandardEnvironment();
    const parseCsv = env.lookup("parse_csv") as any;
    const toCsv = env.lookup("to_csv") as any;
    const tableCol = env.lookup("table_column") as any;
    const filterTable = env.lookup("filter_table") as any;
    const groupCount = env.lookup("group_by_count") as any;
    const groupSum = env.lookup("group_by_sum") as any;
    const normalize = env.lookup("normalize_data") as any;
    const barChart = env.lookup("ascii_bar_chart") as any;

    const csvText = `Name,Dept,Salary
Alice,Engineering,90000
Bob,Design,70000
Charlie,Engineering,95000
Diana,Marketing,65000`;

    const table = parseCsv.nativeFn(csvText);
    assert.equal(table.length, 5);

    const salaries = tableCol.nativeFn(table, "Salary");
    assert.deepEqual(salaries, [90000, 70000, 95000, 65000]);

    const engOnly = filterTable.nativeFn(table, "Dept", "==", "Engineering");
    assert.equal(engOnly.length, 3); // Header + 2 engineering rows

    const deptCounts = groupCount.nativeFn(table, "Dept");
    assert.equal(deptCounts.length, 4); // Header + 3 depts

    const deptSums = groupSum.nativeFn(table, "Dept", "Salary");
    assert.equal(deptSums.length, 4);

    const norm = normalize.nativeFn([0, 50, 100]);
    assert.deepEqual(norm, [0, 0.5, 1]);

    const chart = barChart.nativeFn(["Apples", "Bananas"], [10, 25], 10);
    assert.ok(chart.includes("Apples"));
    assert.ok(chart.includes("Bananas"));
    assert.ok(chart.includes("█"));
  });

  it("evaluates Artificial Intelligence & Machine Learning algorithms", () => {
    const env = createStandardEnvironment();
    const vecDot = env.lookup("vector_dot") as any;
    const cosSim = env.lookup("cosine_similarity") as any;
    const knnClassify = env.lookup("knn_classify") as any;
    const sentiment = env.lookup("sentiment_analyze") as any;
    const trainNb = env.lookup("train_text_classifier") as any;
    const classifyNb = env.lookup("classify_text") as any;
    const sigmoid = env.lookup("sigmoid") as any;
    const relu = env.lookup("relu") as any;
    const softmax = env.lookup("softmax") as any;

    // Vector operations & cosine similarity
    assert.equal(vecDot.nativeFn([1, 2, 3], [4, 5, 6]), 32);
    const sim = cosSim.nativeFn([1, 0], [1, 0]);
    assert.equal(sim, 1);

    // K-Nearest Neighbors classification
    const trainX = [[1, 1], [1, 2], [5, 5], [6, 5]];
    const trainY = ["classA", "classA", "classB", "classB"];
    const predA = knnClassify.nativeFn(trainX, trainY, [1.5, 1.5], 3);
    const predB = knnClassify.nativeFn(trainX, trainY, [5.5, 5.2], 3);
    assert.equal(predA, "classA");
    assert.equal(predB, "classB");

    // Sentiment Analysis
    const pos = sentiment.nativeFn("This language is amazing and wonderful!");
    assert.equal(pos[0], "positive");
    const neg = sentiment.nativeFn("This is terrible, broken, and awful.");
    assert.equal(neg[0], "negative");

    // Naive Bayes text classification
    const trainingData = [
      ["free money win prize claim now", "spam"],
      ["urgent credit prize jackpot offer", "spam"],
      ["hey are we meeting for coffee today", "ham"],
      ["homework assignment report due tomorrow", "ham"]
    ];
    const model = trainNb.nativeFn(trainingData);
    const testSpam = classifyNb.nativeFn(model, "win prize money");
    const testHam = classifyNb.nativeFn(model, "coffee homework report");
    assert.equal(testSpam, "spam");
    assert.equal(testHam, "ham");

    // Neural Network activations
    assert.equal(relu.nativeFn(-5), 0);
    assert.equal(relu.nativeFn(10), 10);
    assert.equal(sigmoid.nativeFn(0), 0.5);

    const sm = softmax.nativeFn([1, 2, 3]);
    const sumSm = sm.reduce((a: number, b: number) => a + b, 0);
    assert.ok(Math.abs(sumSm - 1.0) < 0.01);
  });

  it("evaluates Task Automation functions", () => {
    const env = createStandardEnvironment();
    const runCmd = env.lookup("run_command") as any;
    const findFiles = env.lookup("find_files") as any;

    // Shell execution
    const out = runCmd.nativeFn("node --version");
    assert.ok(out.startsWith("v"));

    // Find files in workspace
    const plainFiles = findFiles.nativeFn(".", ".plain");
    assert.ok(plainFiles.length >= 7);
  });

  it("runs an integrated Data Science & AI pipeline in PLAIN script", async () => {
    const script = `
set data to [[1, 2], [2, 3], [8, 9], [9, 10]]
set labels to ["small", "small", "large", "large"]
set test_item to [1.5, 2.2]
set predicted to knn(data, labels, test_item, 3)
say "KNN Classification: " + predicted

set review to "PLAIN language is amazing, fast, and very clean!"
set sent to sentiment_analyze(review)
say "Review Sentiment: " + item 1 of sent
`;
    const outputs = await executePlain(script);
    assert.equal(outputs.length, 2);
    assert.equal(outputs[0], "KNN Classification: small");
    assert.equal(outputs[1], "Review Sentiment: positive");
  });
});

