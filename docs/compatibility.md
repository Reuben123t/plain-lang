# Compatibility notes

These notes describe the Unreleased source cleanup. The runtime manifest is still **1.2.0** and the editor manifest **1.3.0**; those identifiers do not mean that existing binary downloads contain the work described here. No new release or publication is announced by these notes.

## Requirements and distribution

- Supported source development now starts at **Node.js 22**. CI targets Node 22/24 on Windows, macOS, and Linux. Older README instructions mentioning Node 18 are not the supported workflow.
- Use `npm ci`, `npm run build`, and `node bin/plain.js`. This does not depend on `plain-lang` being published to npm, a Marketplace listing, or a remote installer script.
- A JavaScript build does not rebuild `plain.exe`, the Windows desktop IDE, or an existing VSIX. Old artifacts are preserved and must be validated separately before distribution.
- Imports load supported built-in namespaces/local source files. There is no full PLAIN package manager or public registry promised by this checkout.

## Language behavior retained

| Rule | Correct usage |
| --- | --- |
| English and Python-style spellings coexist | `set score to 10` or `score = 10` |
| Every block needs `end` | Also after `def name(...):`, `while ...:`, and `if ...:` |
| Keywords and variable/function names are case-insensitive | `Score` and `score` refer to the same name |
| Text and dictionary keys are case-sensitive | `record["Name"]` differs from `record["name"]` |
| English item access is 1-based | `item 1 of scores` |
| Bracket indexing is 0-based, with negative indices | `scores[0]`, `scores[-1]` |

`Set ABC = Main` is not a required entry declaration. Existing assignment behavior is not a reason to emit unquoted strings in new code. PLAIN is not Python; do not infer Python's complete grammar, operator precedence, type system, modules, or standard library.

## Source additions

- `break` and `continue` for loop control. These words are now reserved, so rename any old variables/functions using them.
- Assignment through list indices and dictionary members/keys, including compound assignments.
- `%=`, `**=`, and `//=` compound arithmetic.
- `args()` for script arguments passed after the CLI's `--` separator.
- `plain init`, `plain fmt` / `plain fmt --check`, `plain test`, and `plain eval`.
- `plain check file.plain --json` for machine-readable syntax diagnostics.
- Registered `assert`, `assert_equal`, and `assert_not_equal` test helpers.

Use a fresh source build for these features. `check` still parses rather than running a program; it cannot guarantee successful name lookup, imports, I/O, or assertions. `test` is an execution command, not a sandbox.

## Corrected API examples

Use `create_neural_network`, `train_neural_network`, and `predict_neural_network`, rather than invented `neural_network`, `train_ai`, or `predict_ai` functions.

The training call is:

```plain
dataset = load_ai_dataset("iris")
net = create_neural_network([4, 8, 3], "sigmoid")
history = train_neural_network(net, dataset, 10, 0.1)
say "Epochs: " + history.epochs
```

`dataset` contains paired `inputs` and `targets`. Passing only `dataset.inputs` discards targets and is invalid. The legacy list of `{"input": [...], "output": [...]}` records remains accepted. Malformed or empty data is rejected rather than silently producing a meaningless zero loss. See the [neural-network contract](PLAIN_AI_SPECIFICATION.md) for dimensions and validation.

Old samples used keyword-shaped identifiers such as `item` for loop variables or `add` for a function name. Prefer `entry` and `add_values`. Use the generated [standard-library catalog](standard-library.md) to verify names and aliases; historical function-count claims are not a compatibility specification.

## Execution profiles and local tooling

The static browser playground executes in a Worker with a pure profile. Host filesystem, shell, environment, network, and updater APIs are unavailable. Moving Node automation into the browser requires changing the program; unavailable host functions are not silently emulated.

Node programs and Node-backed local IDE/playground services are for trusted code. Local services should remain on loopback and must not be exposed as a public evaluation service. Filesystem restrictions on particular helpers do not constrain every Node builtin. See [SECURITY.md](../SECURITY.md).

## Packaging changes

Native asset preparation no longer generates `student_data.dat` or pads an executable to a target size. The old `.dat` file was synthetic filler, not a trained model or a substantive offline dataset. New staging uses genuine runtime, bundle, documentation, and optional icon files, with actual sizes and SHA-256 checksums in a manifest.

Legacy files and binaries are not automatically removed or overwritten. See [Native release staging](release-native.md) before choosing which artifacts to build or distribute. Compilation, signing, runtime licensing, and clean-machine smoke tests remain separate release checks.
