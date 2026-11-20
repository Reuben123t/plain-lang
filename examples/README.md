# Example guide

Build from the repository root with `npm ci` and `npm run build`. Run a chosen example with `node bin/plain.js run examples/01_hello.plain`. Do not blindly execute every `.plain` file: some ask for input, write files, invoke a shell, or start a listener.

## Automatic smoke examples

`npm run test:examples` parses all examples and executes a selected deterministic subset with isolated fixtures. The default execution list is:

| Example | Demonstrates | Expected output or stable property |
| --- | --- | --- |
| `01_hello.plain` | Output | `Hello, world!` |
| `02_calculator.plain` | English arithmetic | `20` |
| `04_custom_function.plain` | English function definition | `24` |
| `05_list_average.plain` | List calculation | `85` |
| `07_todo_list.plain` | Append/remove/iteration | Updated task count is 3 |
| `09_student_science.plain` | Pure calculations | Fixed calculations, no I/O |
| `11_data_science.plain` | In-memory CSV and charts | Fixed table data |
| `12_machine_learning.plain` | Local KNN/text/vector helpers | Fixed teaching data |
| `16_control_flow.plain` | `break` / `continue` | `Total: 8` |
| `17_collections.plain` | Indexed/member assignment and compounds | `First: 12`, `Last: 25`, `Ada: 12`, `Arithmetic: 2` |
| `18_script_args.plain` | `args()` after `--` | With two args beginning `Ada`: `Arguments: 2`, `Hello, Ada` |
| `19_assertions.test.plain` | Assertions and `plain test` | `Assertions passed` |
| `20_neural_contract.plain` | Paired training matrices | `Epochs: 2`, `Prediction width: 1` |

Example 20 uses random network weights internally but only asserts dimensions/epoch count and prints deterministic output. It is not a model-quality or speed test.

## CLI workflow

From the repository root:

```sh
node bin/plain.js run examples/16_control_flow.plain
node bin/plain.js check examples/17_collections.plain --json
node bin/plain.js eval 'say 6 * 7'
node bin/plain.js fmt --check examples/16_control_flow.plain
node bin/plain.js test examples/19_assertions.test.plain
node bin/plain.js run examples/18_script_args.plain -- Ada blue
node bin/plain.js init my-plain-project
```

Choose a new directory for `init`. Syntax/format checking does not execute an example; `test`, `eval`, and `run` do. Format without `--check` changes files. In Windows Command Prompt, use double quotes around `say 6 * 7`; the single-quoted command above is for PowerShell/POSIX shells.

## Opt-in examples

These are **not** part of automatic example execution. They are still syntax-checked. Individual tests may exercise their behavior with controlled input/temporary paths.

| Example | Why it is opt-in | How to approach it |
| --- | --- | --- |
| `03_age_check.plain` | Interactive stdin | Run in a terminal or provide an injected `onAsk` in a test. |
| `06_guessing_game.plain` | Interactive stdin and random choice | Run manually; do not snapshot a random game transcript. |
| `08_files_and_time.plain` | Writes/replaces `welcome.txt`; current time/date | Copy the script to an empty disposable directory before running. |
| `10_web_server.plain` | Writes/replaces `student_portal.html` | Copy to an empty disposable directory. Despite its historical name, it only generates HTML and does not listen on a port. |
| `13_task_automation.plain` | Executes `node --version` through a shell; reads cwd-relative files and emits timestamped logs | Run from the repository root, only in a trusted Node session. No file writes or external hosts are needed. |
| `14_ai_neural_training.plain` | Randomized training/prediction output | Local, finite, no network/files. Use 20 for an automated output contract. |
| `15_network_server_deploy.plain` | Opens a loopback TCP listener and prints server diagnostics | Explicit opt-in only; port 8080 must be available. It closes the listener before exit and is not a public deployment example. |

Example file helpers resolve relative to the script directory when run through the CLI. Automation helpers in example 13 use the process working directory. Running from another directory is not a blanket redirection of all filesystem operations.

For a write-capable example, use a fresh copy rather than changing the original files in this checkout. Do not run network demos against external hosts, expose local IDE/playground services, or put secrets in examples.

## Browser use

The static playground's Worker profile does not expose Node filesystem, subprocess, environment, network, or updater APIs. Use pure-language examples and check the generated [standard-library catalog](../docs/standard-library.md) for available functions; the Node automatic-example list is not a promise that every helper is available in every browser profile.

All examples preserve explicit `end`, case-insensitive variable/function names, English `item 1 of values`, and bracket `values[0]` / `values[-1]` access. See the [language tour](../docs/tutorial.md), [compatibility notes](../docs/compatibility.md), and [security policy](../SECURITY.md).
