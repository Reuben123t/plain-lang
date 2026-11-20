# PLAIN authoring and neural-network contracts

This document is a compact guide for people and code-generation tools writing PLAIN. The [language reference](language-reference.md) and generated [standard-library catalog](standard-library.md) are authoritative for this checkout; this file is not a separate grammar or a claim of Python compatibility.

## Rules for generated programs

1. Use `.plain` source, UTF-8, and explicit `end` after every block, including Python-style `def`, `if`, `for`, and `while`.
2. No entry declaration is needed. `Set ABC = Main` is a legacy assignment, not a required runtime setup step. Quote text values.
3. Keywords and variable/function names are case-insensitive. Dictionary keys and text remain case-sensitive.
4. Use `entry`, `number`, or another non-keyword as a loop variable. `item`, `add`, and `from` are reserved.
5. English `item 1 of values` is 1-based. Brackets are 0-based; `values[-1]` is the last value.
6. Use canonical APIs from the catalog. Do not invent `neural_network`, `train_ai`, `predict_ai`, or `web_server` as builtin names.
7. Imports load available built-in namespaces or local modules; they do not install Python/npm dependencies or contact a PLAIN package registry.
8. Browser examples must stay in the pure Worker profile. Node I/O, shell, network, and updater functions are unavailable there.

A complete program:

```plain
def area_of_rectangle(width, height):
    return width * height
end

shape = {"width": 4, "height": 6}
say area_of_rectangle(shape.width, shape.height)
```

Output: `24`.

## Neural-network API

Use these canonical functions:

| Function | Contract |
| --- | --- |
| `create_neural_network(layers, activation)` | Creates an in-memory network; `layers` describes input, hidden, and output widths. |
| `train_neural_network(network, dataset, epochs, learning_rate)` | Updates the network in place and returns training information. |
| `predict_neural_network(network, input)` | Returns a numeric output list for one numeric input vector. |
| `load_ai_dataset(name)` | Returns the bundled dataset object, including `inputs` and `targets`. |

`load_dataset` is a registered alias of `load_ai_dataset`. Prefer canonical names in new examples. `sigmoid` is an activation supported by the example below; the catalog/source lists other options.

### Dataset shape

The current source accepts paired matrices:

```plain
dataset = {"inputs": [[0, 0], [0, 1], [1, 0], [1, 1]], "targets": [[0], [1], [1], [0]]}
```

- `inputs` and `targets` must contain the same nonzero number of rows.
- Each input row must match the network's input width.
- Each target row must match the output width.
- Numeric entries must be finite. Supply positive epoch and learning-rate values.
- The legacy list-of-records form, `[{"input": [0, 0], "output": [0]}, ...]`, remains supported.

Pass the **whole dataset**, not `dataset.inputs`. A list of input rows alone omits the targets and is not valid supervised training data. Older builds could silently train on empty/malformed data; validation in the Unreleased source rejects it instead.

### Small local example

```plain
dataset = {"inputs": [[0, 0], [0, 1], [1, 0], [1, 1]], "targets": [[0], [1], [1], [0]]}
net = create_neural_network([2, 4, 1], "sigmoid")
history = train_neural_network(net, dataset, 10, 0.1)
prediction = predict_neural_network(net, [0, 1])

assert_equal(history.epochs, 10)
assert_equal(count(prediction), 1)
say "Prediction width: " plus count(prediction)
```

Output: `Prediction width: 1`.

Initialization and training order use randomness. This example checks the API shape, not learned accuracy; it does not promise XOR convergence in ten epochs. Training information includes `epochs`, `final_loss`, and `loss_history`. Treat the reported loss as the implementation's training statistic, not an independent benchmark.

### Bundled dataset example

```plain
dataset = load_ai_dataset("iris")
net = create_neural_network([4, 8, 3], "sigmoid")
history = train_neural_network(net, dataset, 10, 0.1)
prediction = predict_neural_network(net, dataset.inputs[0])
say "Output width: " plus count(prediction)
```

The bundled datasets are small teaching fixtures, not a substitute for obtaining and validating a complete external dataset. Training and prediction run locally; no remote AI service is needed for these APIs. Other APIs, such as `ai_chat`, have different network/credential requirements and are not part of the browser pure profile.

## Verification

Build from source, then run:

```sh
node bin/plain.js check examples/20_neural_contract.plain
node bin/plain.js run examples/20_neural_contract.plain
node bin/plain.js test examples/19_assertions.test.plain
```

Use [example 14](../examples/14_ai_neural_training.plain) for a longer local demonstration. Do not snapshot random prediction values or describe the existence of this implementation as measured performance, model quality, or production readiness.
