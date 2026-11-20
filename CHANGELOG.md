# Changelog

Changes below are source-development work. Runtime and editor versions are tracked separately. The existing manifests identify the runtime as **1.2.0** and the VS Code extension as **1.3.0**; this file does not invent or announce a new released version.

## Unreleased

### Added

- Loop control with `break` and `continue`, indexed/member assignment, and `%=`, `**=`, `//=` compound assignments.
- Script arguments through `args()` after the CLI `--` separator.
- Local project initialization, formatting/check-only formatting, test execution, evaluation, and JSON syntax-check output.
- Assertion helpers `assert`, `assert_equal`, and `assert_not_equal` for small PLAIN test programs.
- Source onboarding, a language tour, compatibility notes, contributor/security policies, and a release checklist.
- Bug/feature forms, a pull-request template, and read-only cross-platform CI targeting Node 22 and 24.
- Short examples for the language/CLI additions and a distinction between deterministic and opt-in examples.

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
