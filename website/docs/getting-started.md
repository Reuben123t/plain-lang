# Getting started

## Requirements and installation

Install Node.js **22 or newer**, with npm, and obtain a source checkout of this repository. Node 22 and 24 are the CI targets on Windows, macOS, and Linux. Run these commands from the repository directory:

```sh
npm ci
npm run build
node bin/plain.js --version
node bin/plain.js examples/01_hello.plain
```

`npm ci` uses the committed lockfile. `npm run build` compiles the source. The last command prints `Hello, world!`.

The current runtime manifest says `1.2.0`; the editor extension has its own `1.3.0` version. This guide also describes Unreleased source changes. It does not establish that either package is available from npm, a Marketplace, or a particular release download.

You can use the checkout without `npm link`, a global install, or a downloaded executable. In all commands below, `node bin/plain.js` means the CLI from the checkout. If you deliberately install/link a build, `plain` is the corresponding shorter command.

## Write and run a file

Create `hello.plain` in the repository directory:

```plain
set visitor to "Ada"
say "Hello, " plus visitor
```

Run it and check its syntax:

```sh
node bin/plain.js run hello.plain
node bin/plain.js check hello.plain
node bin/plain.js check hello.plain --json
```

Output from the program:

```text
Hello, Ada
```

`run` is optional: `node bin/plain.js hello.plain` does the same thing. `check` does not execute statements, resolve all runtime names, or validate external files. Its JSON mode is intended for tooling; use the command's exit status as well as its diagnostics.

## Try a short expression or a REPL

```sh
node bin/plain.js eval 'say 6 * 7'
node bin/plain.js repl
```

The `eval` example prints `42`. The quoting shown works in PowerShell and POSIX shells; in Windows Command Prompt use `node bin/plain.js eval "say 6 * 7"` instead.

In the REPL, enter:

```plain
set greeting to "Hello"
say uppercase(greeting)
```

Use `exit` to leave. Prefer a file for multi-line examples and automated runs. `eval` and the REPL execute code with the same trust requirements as running a file.

## Start a small project

From the repository directory, create a new, unused directory:

```sh
node bin/plain.js init my-plain-project
```

Inspect the generated files before changing them. Initialization creates a local starter project; it does not install dependencies from a PLAIN registry or publish anything. The command reports the paths and next steps for the generated project. Existing files must not be silently replaced.

## Format and test

```sh
node bin/plain.js fmt --check examples/16_control_flow.plain
node bin/plain.js test examples/19_assertions.test.plain
```

`fmt --check` checks formatting without writing. To format your own file, use `node bin/plain.js fmt hello.plain`; review its diff afterward. Formatting is conservative and is not a translation from Python to PLAIN.

A small test file can use the registered assertion functions:

```plain
assert(2 + 2 == 4)
assert_equal(average([80, 90, 100]), 90)
assert_not_equal("red", "blue")
say "Assertions passed"
```

Save it as `sample.test.plain`, then run `node bin/plain.js test sample.test.plain`. Assertions that fail make the test command fail. Test files execute normally, so use only trusted files and keep their side effects isolated.

## Pass script arguments

Place script arguments **after `--`**:

```sh
node bin/plain.js run examples/18_script_args.plain -- Ada blue
```

The script reads them with `args()`. These are script arguments, not options for the PLAIN CLI. The example prints:

```text
Arguments: 2
Hello, Ada
```

Without arguments it prints `Arguments: 0` and `Hello, visitor`.

## Syntax to remember

```plain
set scores to [80, 90, 100]
say item 1 of scores
say scores[0]
say scores[-1]

def double_value(number):
    return number * 2
end

if double_value(4) == 8:
    say "Ready"
end
```

- English and Python-style spellings can be mixed. Python-style blocks still require `end`; indentation alone does not close a block.
- Keywords, variables, and function names are case-insensitive. Dictionary keys and text are case-sensitive.
- `item 1 of scores` is 1-based; `scores[0]` is 0-based; negative bracket indices count from the end.
- `item`, `add`, `from`, and other keywords are not ordinary variable names. Use names such as `entry`, `append_value`, and `source_name`.
- An entry declaration such as `Set ABC = Main` is not required. Quote text explicitly.

Continue with the [language tour](tutorial.md) and the generated [standard-library catalog](standard-library.md).

## Editors and browser tools

The VS Code extension lives in [`editors/vscode`](../editors/vscode). Follow that directory's build instructions, then install a locally built VSIX with VS Code's **Extensions: Install from VSIX** command. Open only workspaces you trust before running programs. Copying raw TypeScript sources into a user extensions directory is not a substitute for compiling and packaging them.

The static browser playground runs a restricted, pure profile in a Web Worker. Filesystem, subprocess, environment, network, and updater operations are unavailable there. Use a trusted Node session for local scripts requiring those capabilities.

`node bin/plain.js playground` starts a Node-backed local playground. Follow the loopback URL printed by the CLI. Local IDE/playground services execute trusted local code: do not publish them or forward their ports. Stop a local server with Ctrl+C when done. Native desktop availability depends on an explicitly built/installed Windows artifact, not on `npm run build`.

## Troubleshooting

- **Wrong Node version:** check `node --version` and your shell's PATH, then use Node 22 or newer.
- **Missing `dist` modules:** run `npm ci` followed by `npm run build` in the checkout.
- **A block consumes following code:** add the matching `end`, including after `def` and `while` blocks.
- **Unknown function or wrong argument shape:** use the canonical API in [standard-library.md](standard-library.md), not a legacy snippet or a guessed Python name.
- **Example waits for input or writes files:** consult the [example guide](../examples/README.md) before running it.
- **Existing executable differs from source:** use the newly built source CLI; native/VSIX releases are separate artifacts.

For development checks, see [CONTRIBUTING.md](../CONTRIBUTING.md). For trust boundaries and vulnerability reports, see [SECURITY.md](../SECURITY.md).
