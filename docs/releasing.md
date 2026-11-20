# Release and launch checklist

This checklist prepares a candidate. It does **not** authorize a tag, upload, publication, deployment, repository-setting change, or removal of an old artifact. Obtain separate user approval for each external action.

Current component manifests identify the runtime as `1.2.0` and the VS Code extension as `1.3.0`. Keep development notes under **Unreleased** until a maintainer deliberately chooses versions and approves a release. Do not manufacture historical release entries from filenames.

## 1. Validate source and compatibility

- [ ] Review the diff and preserve unrelated local/editor changes.
- [ ] On a fresh checkout with Node 22 or 24, run `npm ci`.
- [ ] Run `npm run typecheck`, `npm test`, `npm run build`, `npm run test:examples`, and `npm run test:package`.
- [ ] Check the CI matrix on Windows, macOS, and Linux for Node 22/24. A local passing run is not evidence that every matrix job passed.
- [ ] Run the source CLI's hello, `check --json`, `eval`, `fmt --check`, assertion-test, and `--` script-argument examples.
- [ ] Review case handling, explicit `end`, English 1-based versus bracket 0-based/negative indexing, invalid input behavior, and capability-profile tests.
- [ ] Confirm the default test suite does not rely on internet hosts, credentials, or a real home installation. Record optional native/editor checks separately.

## 2. Review documentation and generated outputs

- [ ] Regenerate the canonical API catalog/site outputs with the repository's owning build scripts. Do not hand-patch generated `docs/standard-library.md` or generated site files.
- [ ] Check links, CLI help, tutorial snippets, editor snippets, and examples against actual registrations and behavior.
- [ ] Verify `train_neural_network` examples pass both inputs and targets and use the correct network dimensions.
- [ ] Clearly separate the browser pure Worker profile from trusted Node tools; local services stay on loopback.
- [ ] Remove unsupported claims about function counts, performance, production readiness, executable size, package management, release downloads, or Marketplace/npm availability.
- [ ] Keep runtime/editor component versions distinct and reconcile chosen versions with manifest, CLI, launcher, package names, and release notes before release approval.

## 3. Inspect candidate packages

- [ ] Review the packed file list and sizes; include runtime code, declarations where applicable, CLI entry, license, and intended learning material.
- [ ] Exclude local agent state, credentials, machine-specific files, caches, tests/build inputs not intended for users, legacy binaries, and synthetic filler.
- [ ] Install/run the candidate in an isolated temporary project, without relying on this checkout's `node_modules` or a global PLAIN installation.
- [ ] Confirm the source extension compiles and its locally built VSIX has the expected manifest, runtime entry, and language assets. Do not assume old VSIX files contain source changes.
- [ ] Build a native candidate only through the separately reviewed [Windows staging process](release-native.md); never label a copied Node bundle as a new native binary.
- [ ] Record actual file sizes and SHA-256 checksums. A checksum is not a signature or an authenticity guarantee.
- [ ] Review all third-party runtime/dependency redistribution licenses. Verify signing/update/rollback behavior for artifacts that need it.
- [ ] Keep existing published/local binaries untouched until replacement or removal is explicitly approved.

## 4. Approval gates for public launch

These are **separate decisions**, not actions performed by the verification workflow:

- [ ] **Repository metadata:** approve the description, topics, homepage, social image, and any visibility/settings changes.
- [ ] **Security reporting:** verify a real private contact or GitHub private-reporting control before advertising it. Update SECURITY.md only with confirmed information.
- [ ] **Website:** approve a deployment target and review the built static site, Worker behavior, URLs, and privacy implications. Local Node code-execution servers must not be deployed as the public site.
- [ ] **GitHub release:** approve the exact tag/version, notes, artifact filenames, checksums, prerelease status, and whether older downloads remain available.
- [ ] **npm:** verify package ownership, package contents, access level, and the exact version. Obtain explicit publishing approval and use the intended account.
- [ ] **VS Code Marketplace:** verify publisher ownership, extension identifier, compatibility, package contents, and signing requirements; obtain explicit publishing approval.
- [ ] **Native downloads:** approve platform/architecture labels only for artifacts actually built and clean-machine tested. Review launcher caching/extraction, argument handling, runtime updates, and uninstall behavior.
- [ ] **Automation:** any future publish/deploy workflow requires an independent permission/credential review. Do not silently add write permissions or publishing secrets to the validation workflow.

## 5. After an approved release

- [ ] Verify downloads and installation from the actual approved channel, including checksum comparison and CLI behavior.
- [ ] Link only verified release/package/Marketplace URLs, then move the corresponding Unreleased entries under the approved version/date.
- [ ] Document any known limitations, upgrade notes, and rollback path based on actual testing.

The current GitHub Actions workflow has `contents: read` and runs validation only. It does not deploy a site, upload release artifacts, publish npm/VSIX packages, modify topics, or make the approval decisions above.
