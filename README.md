# PLAIN

PLAIN is an interpreted language by Reuben for readable scripts and learning. It combines English statements with familiar Python-style expressions, explicit `end` blocks, lists, dictionaries, and a standard library for text, numbers, data, and local automation.

```plain
set scores to [80, 90, 100]

def passed(mark):
    return mark >= 60
end

for each score in scores
    if passed(score) then
        say "Passed: " plus score
    end
end
say "Average: " plus average(scores)
```

PLAIN is its own language, not a Python implementation. Indentation is for readability; blocks still need `end`. Keywords and variable/function names are case-insensitive. English `item 1 of scores` and bracket `scores[0]` both select the first item; `scores[-1]` selects the last.

## Build from source

Use **Node.js 22 or newer** and npm. CI targets Node 22 and 24 on Windows, macOS, and Linux. From a checkout of this repository:

```sh
npm ci
npm run build
node bin/plain.js examples/01_hello.plain
```

Expected output:

```text
Hello, world!
```

Start an interactive session with `node bin/plain.js repl`. Use `node bin/plain.js help` for the CLI reference. These commands do not require a global install or a published npm package.

The checked-in manifests currently identify the runtime as **1.2.0** and the VS Code extension as **1.3.0**. Changes described as **Unreleased** belong to this source checkout, not a newly announced release. Existing executable/VSIX files may predate the source; rebuilding JavaScript does not rebuild those artifacts.

## Everyday commands

Use `node bin/plain.js` in place of `plain` when working from source.

```sh
node bin/plain.js run examples/16_control_flow.plain
node bin/plain.js check examples/17_collections.plain --json
node bin/plain.js eval 'say 6 * 7'
node bin/plain.js fmt --check examples/16_control_flow.plain
node bin/plain.js test examples/19_assertions.test.plain
node bin/plain.js run examples/18_script_args.plain -- Ada blue
node bin/plain.js init my-plain-project
```

`check` parses without executing; it cannot prove that a program is correct. `test`, `eval`, and normal execution run code. Formatting without `--check` changes files. See [Getting started](docs/getting-started.md) for the workflow and [Compatibility notes](docs/compatibility.md) for this checkout's additions.

## Learn and explore

- [Getting started](docs/getting-started.md) — installation, CLI, and editor setup.
- [Language tour](docs/tutorial.md) — English/Python-style syntax, functions, loops, collections, and tests.
- [Language reference](docs/language-reference.md) — syntax and compatibility rules.
- [Standard library](docs/standard-library.md) — generated canonical API catalog; prefer it over old function-count claims.
- [Example guide](examples/README.md) — deterministic examples and opt-in demos with side effects.
- [Neural-network contracts](docs/PLAIN_AI_SPECIFICATION.md) — actual API names and dataset shapes, including `train_neural_network(net, dataset, epochs, learning_rate)`.

Imports support built-in namespaces and local `.plain` modules. They are not an npm/Python package manager or a hosted PLAIN package registry.

## Execution and trust

- The **static browser playground** uses a Web Worker and a pure-language profile: no Node filesystem, shell, environment, or network APIs. Not every Node builtin is available there.
- The **Node CLI and Node-backed local tools** execute trusted programs with your account's capabilities. File helpers do not make all automation, imports, or shell commands a security sandbox.
- Local IDE/playground services are loopback tools, not public multi-user hosting services. Do not expose them through a public bind, proxy, or tunnel.
- The VS Code extension is maintained in [`editors/vscode`](editors/vscode). Use its source/VSIX workflow; Marketplace availability is not assumed.

See [SECURITY.md](SECURITY.md) before running code from another source or reporting a vulnerability.

## Contribute and release

```sh
npm run typecheck
npm test
npm run build
npm run test:examples
npm run test:package
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for portable and optional native tests, [CHANGELOG.md](CHANGELOG.md) for Unreleased work, and [ROADMAP.md](ROADMAP.md) for future directions. Release candidates follow the [launch checklist](docs/releasing.md); publishing, deployment, repository metadata changes, and replacement of old downloads require separate approval.

PLAIN is licensed under the [MIT License](LICENSE).
