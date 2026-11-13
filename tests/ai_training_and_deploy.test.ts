import { describe, it } from "node:test";
import * as assert from "node:assert";
import { createStandardEnvironment } from "../src/builtins/index";
import { runPlain } from "../src/index";

describe("AI Training, Server Deployment & 1000+ Functions", () => {
  it("verifies the standard environment contains at least 1,000 functions", () => {
    const env = createStandardEnvironment();
    const count = env.getAllVariableNames().length;
    console.log(`Verified function count: ${count}`);
    assert.ok(count >= 1000, `Expected >= 1000 functions, but found ${count}`);
  });

  it("trains an MLP neural network with backpropagation", () => {
    const env = createStandardEnvironment();
    const createNet = env.lookup("create_neural_network") as any;
    const trainNet = env.lookup("train_neural_network") as any;
    const predictNet = env.lookup("predict_neural_network") as any;

    const net = createNet.nativeFn([2, 4, 1], "sigmoid");

    // XOR dataset
    const dataset = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ];

    const result = trainNet.nativeFn(net, dataset, 50, 0.2);
    assert.ok(typeof result.final_loss === "number");
    assert.equal(result.epochs, 50);

    const prediction = predictNet.nativeFn(net, [1, 0]);
    assert.ok(Array.isArray(prediction));
    assert.equal(prediction.length, 1);
  });

  it("loads preloaded AI benchmark datasets", () => {
    const env = createStandardEnvironment();
    const loadDataset = env.lookup("load_ai_dataset") as any;
    const iris = loadDataset.nativeFn("iris");
    assert.equal(iris.name, "iris");
    assert.equal(iris.sample_count, 15);
    assert.equal(iris.feature_count, 4);
  });

  it("performs linear algebra matrix operations", () => {
    const env = createStandardEnvironment();
    const matMult = env.lookup("matrix_mult") as any;
    const matAdd = env.lookup("matrix_add") as any;
    const matDet = env.lookup("matrix_determinant") as any;

    const A = [
      [1, 2],
      [3, 4]
    ];
    const B = [
      [2, 0],
      [1, 2]
    ];

    const multResult = matMult.nativeFn(A, B);
    assert.deepEqual(multResult, [
      [4, 4],
      [10, 8]
    ]);

    const addResult = matAdd.nativeFn(A, B);
    assert.deepEqual(addResult, [
      [3, 2],
      [4, 6]
    ]);

    const det = matDet.nativeFn(A);
    assert.equal(det, -2);
  });

  it("tests crypto, hashing, and JWT tokens", () => {
    const env = createStandardEnvironment();
    const sha256 = env.lookup("sha256") as any;
    const createJwt = env.lookup("create_jwt") as any;
    const verifyJwt = env.lookup("verify_jwt") as any;

    const hash = sha256.nativeFn("PLAIN Language Reuben");
    assert.equal(typeof hash, "string");
    assert.equal(hash.length, 64);

    const token = createJwt.nativeFn({ user: "Reuben", role: "admin" }, "my_secret_key");
    assert.ok(token.includes("."));

    const verified = verifyJwt.nativeFn(token, "my_secret_key");
    assert.equal(verified.valid, true);
    assert.equal(verified.payload.user, "Reuben");
  });

  it("discovers network IPs for server deployment", () => {
    const env = createStandardEnvironment();
    const getLocalIp = env.lookup("get_local_ip") as any;
    const getAllIps = env.lookup("get_all_ips") as any;

    const localIp = getLocalIp.nativeFn();
    assert.ok(typeof localIp === "string");
    assert.ok(localIp.length > 0);

    const allIps = getAllIps.nativeFn();
    assert.ok(Array.isArray(allIps));
    assert.ok(allIps.length >= 1);
  });

  it("checks version and updater metadata", () => {
    const env = createStandardEnvironment();
    const versionFn = env.lookup("plain_version") as any;
    const authorFn = env.lookup("author_name") as any;

    assert.equal(versionFn.nativeFn(), "1.1.0");
    assert.equal(authorFn.nativeFn(), "Reuben");
  });
});

