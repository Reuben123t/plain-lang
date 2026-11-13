import { PlainObject, PlainValue, plainToString } from "../runtime/values";

// Multi-Layer Perceptron (Neural Network) Implementation
export class NeuralNetwork {
  public layerSizes: number[];
  public weights: number[][][]; // weights[layer][toNode][fromNode]
  public biases: number[][]; // biases[layer][toNode]
  public activation: string;

  constructor(layerSizes: number[], activation: string = "sigmoid") {
    this.layerSizes = layerSizes;
    this.activation = activation;
    this.weights = [];
    this.biases = [];

    // Xavier / He initialization
    for (let l = 0; l < layerSizes.length - 1; l++) {
      const fanIn = layerSizes[l];
      const fanOut = layerSizes[l + 1];
      const scale = Math.sqrt(2.0 / (fanIn + fanOut));

      const layerWeights: number[][] = [];
      const layerBiases: number[] = [];
      for (let j = 0; j < fanOut; j++) {
        const nodeWeights: number[] = [];
        for (let k = 0; k < fanIn; k++) {
          nodeWeights.push((Math.random() * 2 - 1) * scale);
        }
        layerWeights.push(nodeWeights);
        layerBiases.push(0.01 * (Math.random() * 2 - 1));
      }
      this.weights.push(layerWeights);
      this.biases.push(layerBiases);
    }
  }

  private activate(x: number): number {
    switch (this.activation) {
      case "relu":
        return Math.max(0, x);
      case "leaky_relu":
        return x > 0 ? x : 0.01 * x;
      case "tanh":
        return Math.tanh(x);
      case "sigmoid":
      default:
        return 1.0 / (1.0 + Math.exp(-Math.max(-45, Math.min(45, x))));
    }
  }

  private activatePrime(y: number): number {
    switch (this.activation) {
      case "relu":
        return y > 0 ? 1 : 0;
      case "leaky_relu":
        return y > 0 ? 1 : 0.01;
      case "tanh":
        return 1 - y * y;
      case "sigmoid":
      default:
        return y * (1.0 - y);
    }
  }

  public forward(input: number[]): { activations: number[][]; zValues: number[][] } {
    let current = [...input];
    const activations: number[][] = [current];
    const zValues: number[][] = [];

    for (let l = 0; l < this.weights.length; l++) {
      const next: number[] = [];
      const zLayer: number[] = [];
      const isOutput = l === this.weights.length - 1;

      for (let j = 0; j < this.weights[l].length; j++) {
        let z = this.biases[l][j];
        for (let k = 0; k < current.length; k++) {
          z += this.weights[l][j][k] * current[k];
        }
        zLayer.push(z);
        next.push(this.activate(z));
      }

      // If output layer has > 1 node and softmax is used
      if (isOutput && next.length > 1 && this.activation === "softmax") {
        const maxZ = Math.max(...zLayer);
        const exp = zLayer.map((z) => Math.exp(z - maxZ));
        const sumExp = exp.reduce((a, b) => a + b, 0);
        for (let i = 0; i < next.length; i++) {
          next[i] = exp[i] / sumExp;
        }
      }

      zValues.push(zLayer);
      activations.push(next);
      current = next;
    }

    return { activations, zValues };
  }

  public predict(input: number[]): number[] {
    return this.forward(input).activations[this.weights.length];
  }

  public train(
    dataset: { input: number[]; output: number[] }[],
    epochs: number = 100,
    learningRate: number = 0.1,
    batchSize: number = 16
  ): { finalLoss: number; lossHistory: number[]; epochs: number } {
    const lossHistory: number[] = [];

    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochLoss = 0;

      // Shuffle dataset
      const shuffled = [...dataset].sort(() => Math.random() - 0.5);

      for (const sample of shuffled) {
        const { activations } = this.forward(sample.input);
        const L = this.weights.length;
        const output = activations[L];

        // Output error (Mean Squared Error gradient)
        const deltas: number[][] = [];
        const outputDeltas: number[] = [];
        for (let j = 0; j < output.length; j++) {
          const target = sample.output[j] ?? 0;
          const diff = output[j] - target;
          epochLoss += 0.5 * diff * diff;
          outputDeltas.push(diff * this.activatePrime(output[j]));
        }
        deltas[L - 1] = outputDeltas;

        // Backpropagate through hidden layers
        for (let l = L - 2; l >= 0; l--) {
          const layerDeltas: number[] = [];
          for (let j = 0; j < this.layerSizes[l + 1]; j++) {
            let error = 0;
            for (let k = 0; k < this.weights[l + 1].length; k++) {
              error += this.weights[l + 1][k][j] * deltas[l + 1][k];
            }
            layerDeltas.push(error * this.activatePrime(activations[l + 1][j]));
          }
          deltas[l] = layerDeltas;
        }

        // Apply weight and bias updates (Stochastic Gradient Descent)
        for (let l = 0; l < L; l++) {
          for (let j = 0; j < this.weights[l].length; j++) {
            for (let k = 0; k < this.weights[l][j].length; k++) {
              this.weights[l][j][k] -= learningRate * deltas[l][j] * activations[l][k];
            }
            this.biases[l][j] -= learningRate * deltas[l][j];
          }
        }
      }

      const meanLoss = epochLoss / Math.max(1, dataset.length);
      if (epoch % Math.max(1, Math.floor(epochs / 10)) === 0 || epoch === epochs - 1) {
        lossHistory.push(parseFloat(meanLoss.toFixed(6)));
      }
    }

    return {
      finalLoss: lossHistory[lossHistory.length - 1] || 0,
      lossHistory,
      epochs
    };
  }
}

// Built-in Benchmark Datasets
const PRELOADED_DATASETS: Record<string, { inputs: number[][]; targets: number[][]; labels?: string[] }> = {
  iris: {
    labels: ["setosa", "versicolor", "virginica"],
    inputs: [
      [5.1, 3.5, 1.4, 0.2],
      [4.9, 3.0, 1.4, 0.2],
      [4.7, 3.2, 1.3, 0.2],
      [4.6, 3.1, 1.5, 0.2],
      [5.0, 3.6, 1.4, 0.2],
      [7.0, 3.2, 4.7, 1.4],
      [6.4, 3.2, 4.5, 1.5],
      [6.9, 3.1, 4.9, 1.5],
      [5.5, 2.3, 4.0, 1.3],
      [6.5, 2.8, 4.6, 1.5],
      [6.3, 3.3, 6.0, 2.5],
      [5.8, 2.7, 5.1, 1.9],
      [7.1, 3.0, 5.9, 2.1],
      [6.3, 2.9, 5.6, 1.8],
      [6.5, 3.0, 5.8, 2.2]
    ],
    targets: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1]
    ]
  },
  mnist_mini: {
    inputs: [
      [0, 1, 1, 0, 0, 1, 1, 0], // '0' pattern
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 1, 0, 0, 0, 1, 0], // '1' pattern
      [0, 0, 1, 0, 0, 0, 1, 0]
    ],
    targets: [
      [1, 0],
      [1, 0],
      [0, 1],
      [0, 1]
    ]
  },
  housing: {
    inputs: [
      [1200, 2, 1],
      [1500, 3, 2],
      [1800, 3, 2],
      [2200, 4, 3],
      [2600, 4, 3],
      [3000, 5, 4]
    ],
    targets: [
      [250000],
      [310000],
      [360000],
      [440000],
      [510000],
      [600000]
    ]
  },
  sentiment: {
    inputs: [
      [1, 0, 1], // great, good
      [1, 1, 1], // awesome, love, best
      [0, 0, 0], // bad, terrible, worst
      [0, 0, 0]
    ],
    targets: [[1], [1], [0], [0]]
  }
};

export const aiTrainingBuiltins = {
  // 1. Neural Networks & Deep Learning
  create_neural_network: (layers: any, activationVal: any = "sigmoid") => {
    const layerSizes = Array.isArray(layers)
      ? layers.map((n) => (typeof n === "number" ? n : parseInt(String(n), 10) || 1))
      : [2, 4, 1];
    const act = typeof activationVal === "string" ? activationVal : "sigmoid";
    const net = new NeuralNetwork(layerSizes, act);
    return {
      _type: "NeuralNetwork",
      layers: layerSizes,
      activation: act,
      net
    };
  },

  train_neural_network: (netObj: any, datasetVal: any, epochsVal: any = 100, lrVal: any = 0.1) => {
    if (!netObj || !netObj.net || !(netObj.net instanceof NeuralNetwork)) {
      throw new Error("Invalid neural network object. Use create_neural_network() first.");
    }
    const epochs = typeof epochsVal === "number" ? epochsVal : 100;
    const lr = typeof lrVal === "number" ? lrVal : 0.1;

    let dataset: { input: number[]; output: number[] }[] = [];
    if (Array.isArray(datasetVal)) {
      dataset = datasetVal.map((item: any) => ({
        input: Array.isArray(item.input) ? item.input.map(Number) : [],
        output: Array.isArray(item.output) ? item.output.map(Number) : [Number(item.output)]
      }));
    }

    const trainingResult = netObj.net.train(dataset, epochs, lr);
    return {
      epochs: trainingResult.epochs,
      final_loss: trainingResult.finalLoss,
      loss_history: trainingResult.lossHistory,
      message: `Trained network for ${epochs} epochs. Final loss: ${trainingResult.finalLoss}`
    };
  },

  predict_neural_network: (netObj: any, inputVal: any) => {
    if (!netObj || !netObj.net || !(netObj.net instanceof NeuralNetwork)) {
      throw new Error("Invalid neural network object.");
    }
    const input = Array.isArray(inputVal) ? inputVal.map(Number) : [Number(inputVal)];
    return netObj.net.predict(input);
  },

  get_network_weights: (netObj: any) => {
    if (!netObj || !netObj.net) return [];
    return netObj.net.weights;
  },

  get_network_biases: (netObj: any) => {
    if (!netObj || !netObj.net) return [];
    return netObj.net.biases;
  },

  // 2. Activations & Math
  sigmoid: (x: number) => 1 / (1 + Math.exp(-Math.max(-45, Math.min(45, Number(x))))),
  sigmoid_derivative: (y: number) => Number(y) * (1 - Number(y)),
  relu: (x: number) => Math.max(0, Number(x)),
  relu_derivative: (x: number) => (Number(x) > 0 ? 1 : 0),
  leaky_relu: (x: number, alpha: number = 0.01) => (Number(x) > 0 ? Number(x) : Number(alpha) * Number(x)),
  tanh_activation: (x: number) => Math.tanh(Number(x)),
  tanh_derivative: (y: number) => 1 - Math.pow(Number(y), 2),
  softmax: (vec: any) => {
    const arr = Array.isArray(vec) ? vec.map(Number) : [Number(vec)];
    const maxVal = Math.max(...arr);
    const exps = arr.map((v) => Math.exp(v - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  },
  gelu: (x: number) => {
    const num = Number(x);
    return 0.5 * num * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (num + 0.044715 * Math.pow(num, 3))));
  },
  swish: (x: number) => {
    const num = Number(x);
    return num / (1 + Math.exp(-num));
  },

  // 3. Loss Functions
  mean_squared_error_loss: (yTrue: any, yPred: any) => {
    const actual = Array.isArray(yTrue) ? yTrue.map(Number) : [Number(yTrue)];
    const predicted = Array.isArray(yPred) ? yPred.map(Number) : [Number(yPred)];
    const n = Math.min(actual.length, predicted.length);
    if (n === 0) return 0;
    const sum = actual.slice(0, n).reduce((acc, y, i) => acc + Math.pow(y - predicted[i], 2), 0);
    return sum / n;
  },

  mean_absolute_error_loss: (yTrue: any, yPred: any) => {
    const actual = Array.isArray(yTrue) ? yTrue.map(Number) : [Number(yTrue)];
    const predicted = Array.isArray(yPred) ? yPred.map(Number) : [Number(yPred)];
    const n = Math.min(actual.length, predicted.length);
    if (n === 0) return 0;
    const sum = actual.slice(0, n).reduce((acc, y, i) => acc + Math.abs(y - predicted[i]), 0);
    return sum / n;
  },

  binary_cross_entropy_loss: (yTrue: any, yPred: any) => {
    const actual = Array.isArray(yTrue) ? yTrue.map(Number) : [Number(yTrue)];
    const predicted = Array.isArray(yPred) ? yPred.map(Number) : [Number(yPred)];
    const n = Math.min(actual.length, predicted.length);
    if (n === 0) return 0;
    const eps = 1e-15;
    const sum = actual.slice(0, n).reduce((acc, y, i) => {
      const p = Math.max(eps, Math.min(1 - eps, predicted[i]));
      return acc - (y * Math.log(p) + (1 - y) * Math.log(1 - p));
    }, 0);
    return sum / n;
  },

  categorical_cross_entropy_loss: (yTrue: any, yPred: any) => {
    const actual = Array.isArray(yTrue) ? yTrue.map(Number) : [Number(yTrue)];
    const predicted = Array.isArray(yPred) ? yPred.map(Number) : [Number(yPred)];
    const eps = 1e-15;
    return -actual.reduce((acc, y, i) => acc + y * Math.log(Math.max(eps, predicted[i] ?? eps)), 0);
  },

  // 4. Preloaded Datasets
  load_ai_dataset: (nameVal: string): PlainObject => {
    const key = String(nameVal).toLowerCase().trim();
    const data = PRELOADED_DATASETS[key];
    if (!data) {
      const available = Object.keys(PRELOADED_DATASETS).join(", ");
      throw new Error(`Dataset '${key}' not found. Available datasets: ${available}`);
    }
    return {
      name: key,
      sample_count: data.inputs.length,
      feature_count: data.inputs[0]?.length || 0,
      inputs: data.inputs,
      targets: data.targets,
      labels: data.labels || []
    };
  },

  // 5. Preprocessing & Data Wrangling
  train_test_split: (inputs: any, targets: any, testRatioVal: any = 0.2): PlainObject => {
    const x = Array.isArray(inputs) ? inputs : [];
    const y = Array.isArray(targets) ? targets : [];
    const ratio = typeof testRatioVal === "number" ? testRatioVal : 0.2;
    const testSize = Math.max(1, Math.floor(x.length * ratio));
    const trainSize = x.length - testSize;

    const indices = Array.from({ length: x.length }, (_, i) => i).sort(() => Math.random() - 0.5);

    const xTrain: any[] = [];
    const xTest: any[] = [];
    const yTrain: any[] = [];
    const yTest: any[] = [];

    indices.forEach((idx, i) => {
      if (i < trainSize) {
        xTrain.push(x[idx]);
        yTrain.push(y[idx]);
      } else {
        xTest.push(x[idx]);
        yTest.push(y[idx]);
      }
    });

    return {
      x_train: xTrain,
      x_test: xTest,
      y_train: yTrain,
      y_test: yTest
    };
  },

  standard_scale: (matrixVal: any): PlainObject => {
    const mat = Array.isArray(matrixVal) ? matrixVal.map((row: any) => (Array.isArray(row) ? row.map(Number) : [Number(row)])) : [];
    if (mat.length === 0) return { scaled: [], means: [], stds: [] };

    const numCols = mat[0].length;
    const means: number[] = [];
    const stds: number[] = [];

    for (let c = 0; c < numCols; c++) {
      const col = mat.map((row) => row[c]);
      const mean = col.reduce((a, b) => a + b, 0) / col.length;
      const variance = col.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / col.length;
      const std = Math.sqrt(variance) || 1e-7;
      means.push(mean);
      stds.push(std);
    }

    const scaled = mat.map((row) => row.map((val, c) => (val - means[c]) / stds[c]));
    return { scaled, means, stds };
  },

  min_max_scale: (matrixVal: any, minVal: number = 0, maxVal: number = 1): PlainObject => {
    const mat = Array.isArray(matrixVal) ? matrixVal.map((row: any) => (Array.isArray(row) ? row.map(Number) : [Number(row)])) : [];
    if (mat.length === 0) return { scaled: [], mins: [], maxs: [] };

    const numCols = mat[0].length;
    const mins: number[] = [];
    const maxs: number[] = [];

    for (let c = 0; c < numCols; c++) {
      const col = mat.map((row) => row[c]);
      mins.push(Math.min(...col));
      maxs.push(Math.max(...col));
    }

    const scaled = mat.map((row) =>
      row.map((val, c) => {
        const range = maxs[c] - mins[c] || 1e-7;
        return minVal + ((val - mins[c]) / range) * (maxVal - minVal);
      })
    );

    return { scaled, mins, maxs };
  },

  one_hot_encode: (labelsVal: any): PlainObject => {
    const labels = Array.isArray(labelsVal) ? labelsVal.map(String) : [String(labelsVal)];
    const unique = Array.from(new Set(labels)).sort();
    const encoded = labels.map((item) => unique.map((u) => (u === item ? 1 : 0)));
    return {
      encoded,
      classes: unique
    };
  },

  label_encode: (labelsVal: any): PlainObject => {
    const labels = Array.isArray(labelsVal) ? labelsVal.map(String) : [String(labelsVal)];
    const unique = Array.from(new Set(labels)).sort();
    const mapping: Record<string, number> = {};
    unique.forEach((u, i) => (mapping[u] = i));
    const encoded = labels.map((item) => mapping[item]);
    return {
      encoded,
      classes: unique,
      mapping
    };
  },

  // 6. Classical ML: Logistic Regression
  train_logistic_regression: (featuresVal: any, labelsVal: any, epochs: number = 200, lr: number = 0.1): PlainObject => {
    const x = Array.isArray(featuresVal) ? featuresVal.map((r: any) => (Array.isArray(r) ? r.map(Number) : [Number(r)])) : [];
    const y = Array.isArray(labelsVal) ? labelsVal.map(Number) : [];
    const numFeatures = x[0]?.length || 1;
    const weights = new Array(numFeatures).fill(0).map(() => (Math.random() - 0.5) * 0.1);
    let bias = 0;

    for (let ep = 0; ep < epochs; ep++) {
      for (let i = 0; i < x.length; i++) {
        let z = bias;
        for (let j = 0; j < numFeatures; j++) {
          z += weights[j] * x[i][j];
        }
        const pred = 1 / (1 + Math.exp(-Math.max(-45, Math.min(45, z))));
        const error = pred - y[i];
        for (let j = 0; j < numFeatures; j++) {
          weights[j] -= lr * error * x[i][j];
        }
        bias -= lr * error;
      }
    }

    return {
      _type: "LogisticRegressionModel",
      weights,
      bias
    };
  },

  predict_logistic_regression: (model: any, sampleVal: any): number => {
    if (!model || !model.weights) return 0;
    const sample = Array.isArray(sampleVal) ? sampleVal.map(Number) : [Number(sampleVal)];
    let z = model.bias;
    for (let j = 0; j < model.weights.length; j++) {
      z += model.weights[j] * (sample[j] ?? 0);
    }
    const prob = 1 / (1 + Math.exp(-Math.max(-45, Math.min(45, z))));
    return prob >= 0.5 ? 1 : 0;
  },

  // 7. Classical ML: Decision Tree (simple stump/depth-1 classifier)
  train_decision_tree_stump: (featuresVal: any, labelsVal: any): PlainObject => {
    const x = Array.isArray(featuresVal) ? featuresVal : [];
    const y = Array.isArray(labelsVal) ? labelsVal.map(Number) : [];
    const numFeatures = x[0]?.length || 1;

    let bestFeature = 0;
    let bestThreshold = 0;
    let bestAccuracy = -1;
    let bestPolarity = 1;

    for (let f = 0; f < numFeatures; f++) {
      const values = x.map((r: any) => r[f]);
      const thresholds = Array.from(new Set(values)).sort((a: any, b: any) => a - b);
      for (const th of thresholds as number[]) {
        for (const polarity of [1, -1]) {
          let correct = 0;
          for (let i = 0; i < x.length; i++) {
            const pred = polarity * x[i][f] >= polarity * th ? 1 : 0;
            if (pred === y[i]) correct++;
          }
          const acc = correct / x.length;
          if (acc > bestAccuracy) {
            bestAccuracy = acc;
            bestFeature = f;
            bestThreshold = th;
            bestPolarity = polarity;
          }
        }
      }
    }

    return {
      _type: "DecisionTreeStump",
      feature_index: bestFeature,
      threshold: bestThreshold,
      polarity: bestPolarity,
      train_accuracy: bestAccuracy
    };
  },

  predict_decision_tree_stump: (model: any, sampleVal: any): number => {
    if (!model) return 0;
    const sample = Array.isArray(sampleVal) ? sampleVal.map(Number) : [Number(sampleVal)];
    const val = sample[model.feature_index] ?? 0;
    return model.polarity * val >= model.polarity * model.threshold ? 1 : 0;
  },

  // 8. Model Evaluation Metrics
  accuracy_score: (yTrue: any, yPred: any): number => {
    const actual = Array.isArray(yTrue) ? yTrue : [];
    const predicted = Array.isArray(yPred) ? yPred : [];
    const n = Math.min(actual.length, predicted.length);
    if (n === 0) return 0;
    let correct = 0;
    for (let i = 0; i < n; i++) {
      if (actual[i] === predicted[i]) correct++;
    }
    return correct / n;
  },

  confusion_matrix: (yTrue: any, yPred: any): PlainObject => {
    const actual = Array.isArray(yTrue) ? yTrue.map(Number) : [];
    const predicted = Array.isArray(yPred) ? yPred.map(Number) : [];
    let tp = 0,
      fp = 0,
      fn = 0,
      tn = 0;
    for (let i = 0; i < Math.min(actual.length, predicted.length); i++) {
      const a = actual[i];
      const p = predicted[i];
      if (a === 1 && p === 1) tp++;
      else if (a === 0 && p === 1) fp++;
      else if (a === 1 && p === 0) fn++;
      else if (a === 0 && p === 0) tn++;
    }
    return {
      true_positives: tp,
      false_positives: fp,
      false_negatives: fn,
      true_negatives: tn,
      accuracy: (tp + tn) / Math.max(1, tp + fp + fn + tn),
      precision: tp / Math.max(1, tp + fp),
      recall: tp / Math.max(1, tp + fn),
      f1_score: (2 * tp) / Math.max(1, 2 * tp + fp + fn)
    };
  },

  r2_score: (yTrue: any, yPred: any): number => {
    const actual = Array.isArray(yTrue) ? yTrue.map(Number) : [];
    const predicted = Array.isArray(yPred) ? yPred.map(Number) : [];
    const n = Math.min(actual.length, predicted.length);
    if (n === 0) return 0;
    const mean = actual.reduce((a, b) => a + b, 0) / n;
    const ssTotal = actual.reduce((a, b) => a + Math.pow(b - mean, 2), 0);
    const ssRes = actual.slice(0, n).reduce((a, b, i) => a + Math.pow(b - predicted[i], 2), 0);
    return ssTotal === 0 ? 1 : 1 - ssRes / ssTotal;
  },

  // 9. NLP Tools
  tokenize_words: (textVal: string): string[] => {
    return String(textVal)
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
  },

  tokenize_sentences: (textVal: string): string[] => {
    return String(textVal)
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  },

  remove_stopwords: (wordsVal: any): string[] => {
    const stopwords = new Set([
      "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
      "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "can",
      "can't", "cannot", "could", "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for",
      "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself",
      "his", "how", "i", "if", "in", "into", "is", "isn't", "it", "its", "itself", "me", "more", "most", "my",
      "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
      "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their",
      "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too",
      "under", "until", "up", "very", "was", "wasn't", "we", "were", "what", "when", "where", "which", "while",
      "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself"
    ]);
    const words = Array.isArray(wordsVal) ? wordsVal.map(String) : [String(wordsVal)];
    return words.filter((w) => !stopwords.has(w.toLowerCase()));
  },

  cosine_similarity_text: (doc1: string, doc2: string): number => {
    const words1 = String(doc1).toLowerCase().match(/\w+/g) || [];
    const words2 = String(doc2).toLowerCase().match(/\w+/g) || [];
    const vocab = Array.from(new Set([...words1, ...words2]));

    const vec1 = vocab.map((w) => words1.filter((x) => x === w).length);
    const vec2 = vocab.map((w) => words2.filter((x) => x === w).length);

    let dot = 0;
    let norm1 = 0;
    let norm2 = 0;
    for (let i = 0; i < vocab.length; i++) {
      dot += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    const denom = Math.sqrt(norm1) * Math.sqrt(norm2);
    return denom === 0 ? 0 : dot / denom;
  },

  levenshtein_distance: (a: string, b: string): number => {
    const s1 = String(a);
    const s2 = String(b);
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }
    return dp[m][n];
  }
};
