# PLAIN

PLAIN is a readable, interpreted programming language by Reuben. It combines English-style statements with familiar Python-style expressions, explicit `end` blocks, collections, modules, tests, editor tooling, and a browser playground.

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

PLAIN is its own language, not a Python implementation. Indentation improves readability; blocks still close with `end`. Keywords and names are case-insensitive. Both `item 1 of scores` and `scores[0]` select the first item, while `scores[-1]` selects the last.

## Install from GitHub

Use Node.js 22 or newer and Git.

```sh
git clone https://github.com/Reuben123t/plain-lang.git
cd plain-lang
npm ci
npm run build
npm link --ignore-scripts
plain --version
```

The source installer is also available:

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
```

The installer creates a new `$HOME/.plain` checkout and never replaces an existing installation. To install a different destination, pass `-InstallDir`.

## Run PLAIN

From a source checkout, use `node bin/plain.js` instead of the global `plain` command.

```sh
plain run examples/01_hello.plain
plain repl
plain eval 'say 6 * 7'
plain check examples/17_collections.plain --json
plain fmt examples/16_control_flow.plain
plain test examples/19_assertions.test.plain
plain run examples/18_script_args.plain -- Ada blue
plain init my-plain-project
```

`check` parses without executing. `fmt` formats files unless `--check` is supplied. `test`, `eval`, and `run` execute programs. Run `plain help` for the complete command reference.

## Learn the language

- [Getting started](docs/getting-started.md): installation, CLI, and editor setup.
- [Tutorial](docs/tutorial.md): syntax, functions, loops, collections, and tests.
- [Language reference](docs/language-reference.md): grammar and compatibility rules.
- [Standard library](docs/standard-library.md): generated canonical API catalog.
- [Examples](examples/README.md): runnable programs and optional side-effect demos.
- [AI specification](docs/PLAIN_AI_SPECIFICATION.md): neural-network APIs and dataset shapes.

Imports support built-in namespaces and local `.plain` modules. PLAIN does not use npm or Python packages as its module system.

## VS Code extension

The extension source is in [`editors/vscode`](editors/vscode). Build and package it from the repository root:

```sh
npm run package:vscode
code --install-extension .artifacts/plain-language-support-1.3.0.vsix --force
```

The extension provides syntax highlighting, snippets, diagnostics, hover information, symbols, completions, and PLAIN execution commands.

## Plain Studio desktop

**Plain Studio 1.3.0-beta.1** is the first cross-platform desktop source release. [Windows beta downloads and release notes](https://github.com/Reuben123t/plain-lang/releases/tag/v1.3.0-beta.1) · [Website](https://plain-lang.vercel.app/#studio).

Windows x64 packages are unsigned betas. The packaged app and bundled runtime were tested; clean-machine installer/upgrade checks remain outstanding, and the portable-wrapper startup check is inconclusive. Linux/macOS packaging is provided as source but has not been verified on native hosts; no Linux/macOS binaries are offered in this beta. Existing CLI downloads remain available in the v1.2.0 release.

Plain Studio is the Electron desktop app in [`desktop`](desktop), separate from the CLI, VS Code extension, and legacy native launchers. From a source checkout with Node.js 22 or newer:

```sh
npm ci
npm run desktop:setup
npm run desktop:dev
```

Packaged candidates bundle their runtime; end users do not need a separate Node installation. Running a program grants it the current user's host capabilities, not a sandbox. See the [desktop guide](docs/desktop.md) for features, trust boundaries, checks, and nonpublishing Windows/Linux/macOS candidate builds; configured targets are not a claim of verified release downloads.

## Browser playground

Build the static playground with:

```sh
npm run build:web
```

The browser runtime executes in a Web Worker using a pure-language profile. It has no Node filesystem, shell, environment, or network access. Node CLI programs and local tools run with the capabilities of the current user account, so only run trusted code.

## Development checks

```sh
npm run typecheck
npm test
npm run build
npm run test:examples
npm run test:package
npm run test:catalog
```

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), [CHANGELOG.md](CHANGELOG.md), and [ROADMAP.md](ROADMAP.md) for project policies and release information.

PLAIN is licensed under the [MIT License](LICENSE).
