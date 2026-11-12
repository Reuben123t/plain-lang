import { PlainValue } from "../runtime/values";
export declare const aiBuiltins: {
    vector_dot: (v1Val: PlainValue, v2Val: PlainValue) => number;
    vector_magnitude: (vVal: PlainValue) => number;
    cosine_similarity: (v1Val: PlainValue, v2Val: PlainValue) => number;
    vector_distance: (v1Val: PlainValue, v2Val: PlainValue) => number;
    knn_classify: (trainXVal: PlainValue, trainYVal: PlainValue, testPointVal: PlainValue, kVal?: PlainValue) => PlainValue;
    knn_predict: (trainXVal: PlainValue, trainYVal: PlainValue, testPointVal: PlainValue, kVal?: PlainValue) => number;
    kmeans_cluster: (dataVal: PlainValue, kVal?: PlainValue, maxItersVal?: PlainValue) => PlainValue;
    sentiment_analyze: (textVal: PlainValue) => string[];
    train_text_classifier: (docsVal: PlainValue, labelsVal?: PlainValue) => PlainValue;
    classify_text: (modelVal: PlainValue, textVal: PlainValue) => string;
    sigmoid: (xVal: PlainValue) => number;
    relu: (xVal: PlainValue) => number;
    softmax: (listVal: PlainValue) => number[];
    neural_forward: (weightsVal: PlainValue, biasesVal: PlainValue, inputsVal: PlainValue, activationVal?: PlainValue) => number[];
    predict_linear: (xListVal: PlainValue, yListVal: PlainValue, targetXVal: PlainValue) => number;
    ai_prompt: (templateVal: PlainValue, varsVal: PlainValue) => string;
    ai_chat: (promptVal: PlainValue, systemPromptVal?: PlainValue, apiKeyVal?: PlainValue, modelVal?: PlainValue) => Promise<string>;
};
//# sourceMappingURL=ai.d.ts.map