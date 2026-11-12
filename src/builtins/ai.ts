import { PlainValue, plainToString } from "../runtime/values";
import { PlainError } from "../errors/plain-error";
import { mathBuiltins } from "./math";
import { statsBuiltins } from "./stats";

// Lexicon for lightweight, fast offline sentiment analysis
const POSITIVE_WORDS = new Set([
  "good", "great", "excellent", "amazing", "love", "wonderful", "fantastic",
  "superb", "brilliant", "awesome", "happy", "best", "beautiful", "positive",
  "clean", "fast", "easy", "perfect", "success", "helpful", "delight", "impressive"
]);

const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "horrible", "hate", "worst", "poor", "fail",
  "failure", "broken", "slow", "hard", "difficult", "ugly", "sad", "angry",
  "negative", "annoying", "boring", "useless", "flaw", "error", "painful"
]);

const NEGATION_WORDS = new Set(["not", "never", "no", "without", "hardly", "barely"]);
const INTENSIFIERS = new Set(["very", "extremely", "super", "really", "incredibly", "totally"]);

export const aiBuiltins = {
  vector_dot: (v1Val: PlainValue, v2Val: PlainValue): number => {
    if (!Array.isArray(v1Val) || !Array.isArray(v2Val)) {
      throw new PlainError("vector_dot expects two numeric lists.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    if (v1Val.length !== v2Val.length) {
      throw new PlainError(`Vectors must have equal length (got ${v1Val.length} and ${v2Val.length}).`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
    let sum = 0;
    for (let i = 0; i < v1Val.length; i++) {
      sum += Number(v1Val[i]) * Number(v2Val[i]);
    }
    return Math.round(sum * 1e8) / 1e8;
  },

  vector_magnitude: (vVal: PlainValue): number => {
    if (!Array.isArray(vVal)) return 0;
    let sumSq = 0;
    for (const x of vVal) {
      const n = Number(x);
      sumSq += n * n;
    }
    return Math.sqrt(sumSq);
  },

  cosine_similarity: (v1Val: PlainValue, v2Val: PlainValue): number => {
    const dot = aiBuiltins.vector_dot(v1Val, v2Val);
    const mag1 = aiBuiltins.vector_magnitude(v1Val);
    const mag2 = aiBuiltins.vector_magnitude(v2Val);
    if (mag1 === 0 || mag2 === 0) return 0;
    return Math.round((dot / (mag1 * mag2)) * 1e6) / 1e6;
  },

  vector_distance: (v1Val: PlainValue, v2Val: PlainValue): number => {
    if (!Array.isArray(v1Val) || !Array.isArray(v2Val)) return 0;
    const len = Math.min(v1Val.length, v2Val.length);
    let sumSq = 0;
    for (let i = 0; i < len; i++) {
      const diff = Number(v1Val[i]) - Number(v2Val[i]);
      sumSq += diff * diff;
    }
    return Math.round(Math.sqrt(sumSq) * 1e6) / 1e6;
  },

  knn_classify: (
    trainXVal: PlainValue,
    trainYVal: PlainValue,
    testPointVal: PlainValue,
    kVal?: PlainValue
  ): PlainValue => {
    if (!Array.isArray(trainXVal) || !Array.isArray(trainYVal) || !Array.isArray(testPointVal)) {
      throw new PlainError("knn_classify expects train_x (list of vectors), train_y (labels), and test_point (vector).", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const k = kVal !== undefined ? Math.max(1, Math.floor(mathBuiltins.to_number(kVal))) : 3;

    // Compute distances
    const distances: { dist: number; label: PlainValue }[] = [];
    for (let i = 0; i < trainXVal.length; i++) {
      const point = trainXVal[i];
      if (!Array.isArray(point)) continue;
      const dist = aiBuiltins.vector_distance(point, testPointVal);
      distances.push({ dist, label: trainYVal[i] });
    }

    distances.sort((a, b) => a.dist - b.dist);
    const neighbors = distances.slice(0, k);

    // Vote
    const votes: Record<string, { label: PlainValue; count: number }> = {};
    let maxCount = 0;
    let winner = neighbors[0]?.label ?? null;

    for (const n of neighbors) {
      const key = plainToString(n.label);
      if (!votes[key]) votes[key] = { label: n.label, count: 0 };
      votes[key].count++;
      if (votes[key].count > maxCount) {
        maxCount = votes[key].count;
        winner = n.label;
      }
    }
    return winner;
  },

  knn_predict: (
    trainXVal: PlainValue,
    trainYVal: PlainValue,
    testPointVal: PlainValue,
    kVal?: PlainValue
  ): number => {
    if (!Array.isArray(trainXVal) || !Array.isArray(trainYVal) || !Array.isArray(testPointVal)) {
      throw new PlainError("knn_predict expects train_x (list of vectors), train_y (numeric targets), and test_point (vector).", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const k = kVal !== undefined ? Math.max(1, Math.floor(mathBuiltins.to_number(kVal))) : 3;

    const distances: { dist: number; target: number }[] = [];
    for (let i = 0; i < trainXVal.length; i++) {
      const point = trainXVal[i];
      if (!Array.isArray(point)) continue;
      const dist = aiBuiltins.vector_distance(point, testPointVal);
      distances.push({ dist, target: Number(trainYVal[i]) || 0 });
    }

    distances.sort((a, b) => a.dist - b.dist);
    const neighbors = distances.slice(0, k);
    const sum = neighbors.reduce((acc, curr) => acc + curr.target, 0);
    return Math.round((sum / neighbors.length) * 1e4) / 1e4;
  },

  kmeans_cluster: (
    dataVal: PlainValue,
    kVal?: PlainValue,
    maxItersVal?: PlainValue
  ): PlainValue => {
    if (!Array.isArray(dataVal) || dataVal.length === 0) return [];
    const k = kVal !== undefined ? Math.max(1, Math.floor(mathBuiltins.to_number(kVal))) : 2;
    const maxIters = maxItersVal !== undefined ? Math.floor(mathBuiltins.to_number(maxItersVal)) : 20;

    const points = dataVal.filter((p) => Array.isArray(p)) as number[][];
    if (points.length < k) return dataVal;
    const dims = points[0].length;

    // Initialize centroids from random distinct points
    const centroids: number[][] = points.slice(0, k).map((p) => p.slice());
    let assignments = new Array(points.length).fill(0);

    for (let iter = 0; iter < maxIters; iter++) {
      let changed = false;

      // 1. Assign points to closest centroid
      for (let i = 0; i < points.length; i++) {
        let minDist = Infinity;
        let bestC = 0;
        for (let c = 0; c < k; c++) {
          const d = aiBuiltins.vector_distance(points[i], centroids[c]);
          if (d < minDist) {
            minDist = d;
            bestC = c;
          }
        }
        if (assignments[i] !== bestC) {
          assignments[i] = bestC;
          changed = true;
        }
      }

      if (!changed && iter > 0) break;

      // 2. Recompute centroids
      const sums = Array.from({ length: k }, () => new Array(dims).fill(0));
      const counts = new Array(k).fill(0);

      for (let i = 0; i < points.length; i++) {
        const c = assignments[i];
        counts[c]++;
        for (let d = 0; d < dims; d++) {
          sums[c][d] += points[i][d];
        }
      }

      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let d = 0; d < dims; d++) {
            centroids[c][d] = Math.round((sums[c][d] / counts[c]) * 1e4) / 1e4;
          }
        }
      }
    }

    // Return assignments list with 1-based cluster indices for students
    return assignments.map((c) => c + 1);
  },

  sentiment_analyze: (textVal: PlainValue): string[] => {
    const text = plainToString(textVal).toLowerCase();
    const words = text.match(/[a-z']+/g) || [];

    let score = 0;
    let isNegated = false;

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (NEGATION_WORDS.has(w)) {
        isNegated = true;
        continue;
      }

      let multiplier = 1;
      if (i > 0 && INTENSIFIERS.has(words[i - 1])) {
        multiplier = 1.75;
      }

      let delta = 0;
      if (POSITIVE_WORDS.has(w)) {
        delta = 1 * multiplier;
      } else if (NEGATIVE_WORDS.has(w)) {
        delta = -1 * multiplier;
      }

      if (delta !== 0) {
        if (isNegated) delta = -delta * 0.75;
        score += delta;
        isNegated = false;
      }
    }

    let sentiment = "neutral";
    if (score > 0.5) sentiment = "positive";
    else if (score < -0.5) sentiment = "negative";

    return [sentiment, String(Math.round(score * 100) / 100)];
  },

  train_text_classifier: (
    docsVal: PlainValue,
    labelsVal?: PlainValue
  ): PlainValue => {
    if (!Array.isArray(docsVal)) return "";
    let docs: string[] = [];
    let labels: string[] = [];

    if (Array.isArray(labelsVal)) {
      docs = docsVal.map((d) => plainToString(d));
      labels = labelsVal.map((l) => plainToString(l));
    } else {
      // List of [text, label] pairs
      for (const row of docsVal) {
        if (Array.isArray(row) && row.length >= 2) {
          docs.push(plainToString(row[0]));
          labels.push(plainToString(row[1]));
        }
      }
    }

    const classCounts: Record<string, number> = {};
    const wordCounts: Record<string, Record<string, number>> = {};
    const classTotalWords: Record<string, number> = {};
    const vocab = new Set<string>();

    for (let i = 0; i < docs.length; i++) {
      const cls = labels[i] || "unknown";
      classCounts[cls] = (classCounts[cls] || 0) + 1;
      if (!wordCounts[cls]) wordCounts[cls] = {};

      const words = docs[i].toLowerCase().match(/[a-z0-9]+/g) || [];
      for (const w of words) {
        vocab.add(w);
        wordCounts[cls][w] = (wordCounts[cls][w] || 0) + 1;
        classTotalWords[cls] = (classTotalWords[cls] || 0) + 1;
      }
    }

    return JSON.stringify({
      totalDocs: docs.length,
      vocabSize: vocab.size,
      classCounts,
      wordCounts,
      classTotalWords
    });
  },

  classify_text: (modelVal: PlainValue, textVal: PlainValue): string => {
    const modelStr = plainToString(modelVal);
    let model: any;
    try {
      model = JSON.parse(modelStr);
    } catch {
      return "unknown";
    }

    const text = plainToString(textVal).toLowerCase();
    const words = text.match(/[a-z0-9]+/g) || [];
    const classes = Object.keys(model.classCounts || {});
    if (classes.length === 0) return "unknown";

    let bestScore = -Infinity;
    let bestClass = classes[0];

    for (const cls of classes) {
      // Prior: P(C)
      let logProb = Math.log(model.classCounts[cls] / model.totalDocs);
      const totalWords = model.classTotalWords[cls] || 0;
      const vocabSize = model.vocabSize || 1;

      // Likelihood with Laplace smoothing
      for (const w of words) {
        const count = (model.wordCounts[cls] && model.wordCounts[cls][w]) || 0;
        logProb += Math.log((count + 1) / (totalWords + vocabSize));
      }

      if (logProb > bestScore) {
        bestScore = logProb;
        bestClass = cls;
      }
    }

    return bestClass;
  },

  sigmoid: (xVal: PlainValue): number => {
    const x = mathBuiltins.to_number(xVal);
    return Math.round((1 / (1 + Math.exp(-x))) * 1e6) / 1e6;
  },

  relu: (xVal: PlainValue): number => {
    const x = mathBuiltins.to_number(xVal);
    return Math.max(0, x);
  },

  softmax: (listVal: PlainValue): number[] => {
    if (!Array.isArray(listVal) || listVal.length === 0) return [];
    const nums = listVal.map((x) => mathBuiltins.to_number(x));
    const maxVal = Math.max(...nums);
    const exps = nums.map((x) => Math.exp(x - maxVal));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => Math.round((e / sumExps) * 1e4) / 1e4);
  },

  neural_forward: (
    weightsVal: PlainValue,
    biasesVal: PlainValue,
    inputsVal: PlainValue,
    activationVal?: PlainValue
  ): number[] => {
    if (!Array.isArray(weightsVal) || !Array.isArray(biasesVal) || !Array.isArray(inputsVal)) {
      throw new PlainError("neural_forward expects weights (2D list), biases (1D list), and inputs (1D list).", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const activation = activationVal !== undefined ? plainToString(activationVal).toLowerCase() : "relu";
    const inputs = inputsVal.map((x) => Number(x) || 0);
    const biases = biasesVal.map((x) => Number(x) || 0);

    const outputs: number[] = [];
    for (let i = 0; i < weightsVal.length; i++) {
      const neuronWeights = weightsVal[i];
      if (!Array.isArray(neuronWeights)) continue;
      let sum = biases[i] || 0;
      for (let j = 0; j < inputs.length; j++) {
        sum += (Number(neuronWeights[j]) || 0) * inputs[j];
      }

      let activated = sum;
      if (activation === "relu") {
        activated = Math.max(0, sum);
      } else if (activation === "sigmoid") {
        activated = 1 / (1 + Math.exp(-sum));
      }
      outputs.push(Math.round(activated * 1e4) / 1e4);
    }

    if (activation === "softmax") {
      return aiBuiltins.softmax(outputs);
    }
    return outputs;
  },

  predict_linear: (xListVal: PlainValue, yListVal: PlainValue, targetXVal: PlainValue): number => {
    if (!Array.isArray(xListVal) || !Array.isArray(yListVal)) {
      throw new PlainError("predict_linear expects x values list and y values list.", { line: 1, column: 1 }, { kind: "TypeError" });
    }
    const targetX = mathBuiltins.to_number(targetXVal);
    const reg = statsBuiltins.linear_regression(xListVal, yListVal);
    return Math.round((reg.slope * targetX + reg.intercept) * 1e4) / 1e4;
  },

  ai_prompt: (templateVal: PlainValue, varsVal: PlainValue): string => {
    let tpl = plainToString(templateVal);
    if (Array.isArray(varsVal)) {
      for (const item of varsVal) {
        const s = plainToString(item);
        const idx = s.indexOf(":");
        if (idx !== -1) {
          const key = s.slice(0, idx).trim();
          const val = s.slice(idx + 1).trim();
          tpl = tpl.replace(new RegExp(`{${key}}`, "g"), val);
        }
      }
    }
    return tpl;
  },

  ai_chat: async (
    promptVal: PlainValue,
    systemPromptVal?: PlainValue,
    apiKeyVal?: PlainValue,
    modelVal?: PlainValue
  ): Promise<string> => {
    const prompt = plainToString(promptVal);
    const systemPrompt = systemPromptVal !== undefined ? plainToString(systemPromptVal) : "You are a helpful assistant.";
    const apiKey = apiKeyVal !== undefined && plainToString(apiKeyVal).trim() !== ""
      ? plainToString(apiKeyVal).trim()
      : process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || "";
    const model = modelVal !== undefined ? plainToString(modelVal) : "gpt-3.5-turbo";

    if (!apiKey) {
      return `[AI Simulation Mode]: To connect to live LLMs, provide an API key or set OPENAI_API_KEY.\nResponse to "${prompt}":\nArtificial Intelligence is transforming how we learn, analyze data, and build software!`;
    }

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ]
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err: any) {
      throw new PlainError(`AI Chat request failed: ${err.message}`, { line: 1, column: 1 }, { kind: "RuntimeError" });
    }
  }
};
