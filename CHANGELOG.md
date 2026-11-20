# Changelog

Changes below are source-development work. Runtime and editor versions are tracked separately. The existing manifests identify the runtime as **1.2.0** and the VS Code extension as **1.3.0**; this file does not invent or announce a new released version.

## Plain Studio 1.3.0-beta.1 — 2026-11-20

- First public-beta candidate of Plain Studio: a standalone Electron/Monaco editor using the existing PLAIN runtime and shared language tooling.
- Native files/folders, tabs, formatting, diagnostics, completions, builtin help, examples, themes, command palette, and bounded local recovery.
- Interactive Run/Stop with input, arguments, structured errors, execution limits, and managed process-tree cleanup.
- Unsigned Windows x64 installer and experimental portable candidates. Packaged startup/runtime verified; clean-machine installation/upgrade checks remain outstanding and portable-wrapper startup verification is inconclusive.
- Linux/macOS build configurations and native validation workflow included, but those platforms are unverified and have no binaries in this beta.
- PLAIN runtime stays at 1.2.0 and the VS Code extension stays at 1.3.0. This desktop beta does not replace legacy downloads or publish npm/Marketplace packages.

## Unreleased language/tooling development

### Added

- Loop control with `break` and `continue`, indexed/member assignment, and `%=`, `**=`, `//=` compound assignments.
- Script arguments through `args()` after the CLI `--` separator.
- Local project initialization, formatting/check-only formatting, test execution, evaluation, and JSON syntax-check output.
- Assertion helpers `assert`, `assert_equal`, and `assert_not_equal` for small PLAIN test programs.
- Source onboarding, a language tour, compatibility notes, contributor/security policies, and a release checklist.
- Bug/feature forms, a pull-request template, and read-only cross-platform CI targeting Node 22 and 24.
- Short examples for the language/CLI additions and a distinction between deterministic and opt-in examples.
- Plain Studio Electron desktop app source, with independent locked dependencies and root `desktop:*` convenience commands; see the [desktop guide](docs/desktop.md) for capabilities, full-host execution trust, and bounded best-effort session recovery.
- Nonpublishing desktop CI configured for native Windows/Linux x64 and macOS x64/arm64 candidates, service tests, Electron end-to-end checks, and SHA-256 manifests. Only manual workflow runs upload candidate build artifacts; signing, notarization, and releases remain separate approval gates. Configured targets do not establish cross-platform verification or download availability.

### Changed

- Supported Node development baseline is now 22 or newer.
- Neural training accepts validated `{inputs, targets}` datasets in addition to legacy `{input, output}` sample records. Documentation uses canonical `create_neural_network`, `train_neural_network`, and `predict_neural_network` APIs.
- Browser execution uses a pure Worker profile rather than exposing Node host capabilities. Local Node tools remain trusted-code, loopback-only tools.
- Native asset preparation stages genuine files into a new directory and records actual sizes and SHA-256 checksums.
- Documentation distinguishes source builds, local editor packages, and existing native artifacts; imports are no longer described as a full package manager.

### Fixed

- Examples and guides that omitted `end`, used reserved identifiers, claimed nonexistent APIs, or passed input rows without training targets.
- Onboarding claims about function counts, artificial executable size, remote installation, and unverified publication/Marketplace availability.
- Portable test guidance no longer assumes a native IDE or extension is installed under a developer's home directory.

### Removed from the new staging process

- Generation of synthetic `student_data.dat` filler and target-size padding. Existing data files and released/local binary artifacts are preserved, not silently deleted or rebuilt.

Before any release, validate these changes against the final source/artifacts, choose versions explicitly, and complete [the launch checklist](docs/releasing.md).
