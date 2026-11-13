import { PlainObject } from "../runtime/values";
export declare class NeuralNetwork {
    layerSizes: number[];
    weights: number[][][];
    biases: number[][];
    activation: string;
    constructor(layerSizes: number[], activation?: string);
    private activate;
    private activatePrime;
    forward(input: number[]): {
        activations: number[][];
        zValues: number[][];
    };
    predict(input: number[]): number[];
    train(dataset: {
        input: number[];
        output: number[];
    }[], epochs?: number, learningRate?: number, batchSize?: number): {
        finalLoss: number;
        lossHistory: number[];
        epochs: number;
    };
}
export declare const aiTrainingBuiltins: {
    create_neural_network: (layers: any, activationVal?: any) => {
        _type: string;
        layers: number[];
        activation: string;
        net: NeuralNetwork;
    };
    train_neural_network: (netObj: any, datasetVal: any, epochsVal?: any, lrVal?: any) => {
        epochs: any;
        final_loss: any;
        loss_history: any;
        message: string;
    };
    predict_neural_network: (netObj: any, inputVal: any) => any;
    get_network_weights: (netObj: any) => any;
    get_network_biases: (netObj: any) => any;
    sigmoid: (x: number) => number;
    sigmoid_derivative: (y: number) => number;
    relu: (x: number) => number;
    relu_derivative: (x: number) => 0 | 1;
    leaky_relu: (x: number, alpha?: number) => number;
    tanh_activation: (x: number) => number;
    tanh_derivative: (y: number) => number;
    softmax: (vec: any) => number[];
    gelu: (x: number) => number;
    swish: (x: number) => number;
    mean_squared_error_loss: (yTrue: any, yPred: any) => number;
    mean_absolute_error_loss: (yTrue: any, yPred: any) => number;
    binary_cross_entropy_loss: (yTrue: any, yPred: any) => number;
    categorical_cross_entropy_loss: (yTrue: any, yPred: any) => number;
    load_ai_dataset: (nameVal: string) => PlainObject;
    train_test_split: (inputs: any, targets: any, testRatioVal?: any) => PlainObject;
    standard_scale: (matrixVal: any) => PlainObject;
    min_max_scale: (matrixVal: any, minVal?: number, maxVal?: number) => PlainObject;
    one_hot_encode: (labelsVal: any) => PlainObject;
    label_encode: (labelsVal: any) => PlainObject;
    train_logistic_regression: (featuresVal: any, labelsVal: any, epochs?: number, lr?: number) => PlainObject;
    predict_logistic_regression: (model: any, sampleVal: any) => number;
    train_decision_tree_stump: (featuresVal: any, labelsVal: any) => PlainObject;
    predict_decision_tree_stump: (model: any, sampleVal: any) => number;
    accuracy_score: (yTrue: any, yPred: any) => number;
    confusion_matrix: (yTrue: any, yPred: any) => PlainObject;
    r2_score: (yTrue: any, yPred: any) => number;
    tokenize_words: (textVal: string) => string[];
    tokenize_sentences: (textVal: string) => string[];
    remove_stopwords: (wordsVal: any) => string[];
    cosine_similarity_text: (doc1: string, doc2: string) => number;
    levenshtein_distance: (a: string, b: string) => number;
};
//# sourceMappingURL=ai_training.d.ts.map