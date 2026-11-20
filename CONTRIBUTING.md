# Contributing to PLAIN

Thanks for helping improve PLAIN. Small, reproducible changes are easiest to review: describe the behavior, include a regression test, and keep unrelated generated files or local installations out of the change.

## Set up a checkout

Use Node.js **22 or newer** and npm. CI runs Node 22 and 24 on Windows, macOS, and Linux.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run test:examples
npm run test:package
```

Run these commands from the repository root. `npm ci` uses the committed dependency lockfile. Use `node bin/plain.js` after building to test the CLI that a source user will run; source-only tests do not prove a packaged build works.

The current runtime version is `1.2.0`, while the editor extension version is `1.3.0`. Do not bump either version or announce a release as a side effect of an unrelated fix. Record user-visible work under **Unreleased** in [CHANGELOG.md](CHANGELOG.md).

## Test expectations

- Add lexer/parser/interpreter regressions for language changes, including invalid inputs and source locations.
- Cover both English and Python-style spellings where relevant. Preserve explicit `end`, case-insensitive names, and the 1-based English / 0-based bracket distinction.
- Test actual canonical builtin registrations, argument contracts, and capability profiles. Do not infer APIs from names in an old README.
- CLI regressions should exercise exit statuses and stdout/stderr separately. Syntax checking must not run a program; format checking must not write files.
- Keep the default suite portable: temporary directories, deterministic output, and local fixtures rather than a developer's home directory, global installation, credentials, or internet services.
- Network tests should be explicitly scoped to a temporary loopback listener, close it reliably, and never scan outside test-owned fixtures.
- Do not snapshot random neural predictions, timestamps, machine IPs, or exact timings. Test stable output shapes/invariants instead.
- Follow the [example guide](examples/README.md). Parse every example, but run only the declared deterministic subset automatically. Use isolated directories for write-capable examples and injected input for interactive tests.

`npm run test:package` validates the package workflow without publishing. Package verification and CI must not replace old native binaries or require an installed desktop IDE or editor extension.

## Plain Studio desktop development

The Electron app has its own manifest and committed lockfile in `desktop/`; it is not an npm workspace or part of the root install/build/test scripts. Keep the existing core checks above. After root `npm ci`, use:

```sh
npm run desktop:setup
npm run desktop:typecheck
npm run desktop:test
npm run desktop:build
npm run desktop:test:e2e
npm run desktop:dev
```

`desktop:setup` runs `npm ci --prefix desktop`. Other `desktop:*` aliases forward to the corresponding desktop package script and pass through arguments after `--`. Linux Electron GUI tests need a display; use `xvfb-run -a npm run desktop:test:e2e` on a headless machine. Electron's Linux system libraries must also be installed; CI uses Playwright's `install-deps chromium` helper. Node.js 22 or newer is a development requirement; packaged users do not install Node separately.

Read the [desktop guide](docs/desktop.md) before changing execution, IPC, native dialogs, file saves, settings, or recovery. Keep the renderer isolated from Node and execution behind an explicit user action. Desktop programs are fully trusted host code, not browser-sandboxed examples. Preserve the argument array supplied to `onRun`; never silently drop it or convert it to a shell command. Recovery is bounded and best effort, not a backup or an autosave guarantee.

Service tests and Electron E2E tests must use temporary fixtures and an isolated test profile. Never reuse a contributor's real application profile or run arbitrary restored/opened code. `--smoke-test` is an isolated startup check that must not execute a program; it does not replace E2E or packaged-candidate testing. Record the checks actually run. Accessibility, clean/existing-profile, packaging, and install/upgrade/uninstall checks still require explicit manual evidence; a configured CI matrix is not proof they passed.

For native, unsigned, nonpublishing candidates, use `desktop:package`, `desktop:package:dir`, and `desktop:checksums` as described in the guide. Do not replace legacy binaries. Signing, notarization, external publication, and release assets require separate approval.

## Optional native/local integration checks

Native artifact assertions are opt-in through `PLAIN_TEST_NATIVE=1`; they are not prerequisites for the normal cross-platform suite. Only enable them on a deliberately configured Windows machine with the artifacts/installations being tested.

PowerShell:

```powershell
$env:PLAIN_TEST_NATIVE = "1"
npm test
Remove-Item Env:PLAIN_TEST_NATIVE
```

POSIX shell syntax for an appropriate configured environment:

```sh
PLAIN_TEST_NATIVE=1 npm test
```

A skip is not evidence that a native artifact works. Record what artifact, platform, and installation were actually tested. Any test of an extension under a real user home must also remain opt-in; ordinary source/manifest/editor logic tests must run without it. Do not install an extension into a contributor's home just to make a test green.

## Repository map

| Area | Purpose |
| --- | --- |
| `src/lexer`, `src/parser`, `src/ast` | Language syntax |
| `src/runtime`, `src/builtins` | Execution and builtin implementations |
| `src/cli` | Command-line interface |
| `tests` | Automated regressions |
| `examples` | Runnable learning material; see its execution guide |
| `editors/vscode` | Editor extension source and packaging |
| `desktop` | Plain Studio Electron app, independent dependencies, service/E2E tests, and native candidate builds |
| `docs` | Guides and generated reference/site outputs |
| `scripts` | Build, verification, and release-staging tools |

Prefer editing source over generated output. The standard-library catalog at `docs/standard-library.md` and generated site/reference outputs are produced from source; update the generator/catalog inputs through the owning build workflow rather than hand-editing generated files. Inspect and preserve pre-existing local changes, including editor changes, before touching a shared worktree.

## Documentation and examples

- Read existing documentation before replacing it. Keep onboarding concise and runnable from a fresh source checkout.
- Use `npm ci`, `npm run build`, and `node bin/plain.js` as the baseline instructions.
- Close every block with `end`. Avoid reserved names such as `item` or `add` in variables/functions.
- Prefer canonical snake_case APIs; link to the generated catalog instead of copying an unmaintainable builtin list.
- Document side effects and capability requirements. Browser examples must not depend on Node I/O, shell, or network access.
- Do not invent a released version, function count, benchmark, download availability, Marketplace status, or production-readiness guarantee.

## Issues and pull requests

Use the bug form for a minimal reproduction and the feature form for a proposal. Include the Node/OS/runtime version, exact command, expected behavior, and observed result. Remove credentials, personal paths, and unrelated data before sharing logs.

For a pull request, explain the change, list the checks actually run, identify compatibility implications, and link relevant issues. Keep diffs focused; do not bundle generated binaries, dependency upgrades, or formatting across unrelated files without a reason.

Be constructive and specific in review. Discuss the behavior and evidence rather than the person proposing a change. Security-sensitive details belong in the reporting process in [SECURITY.md](SECURITY.md), not a public bug reproduction.

## CI and releases

The workflows in `.github/workflows/ci.yml` and `.github/workflows/desktop.yml` use read-only repository permissions and official `actions/checkout@v4` and `actions/setup-node@v4` major-version references. Desktop CI also uses `actions/upload-artifact@v4`, only on manual workflow runs. These are explicit, documented upstream major pins, not immutable SHAs. Review upstream changes when updating them; use a verified full upstream SHA if the project adopts immutable action pinning. Never insert a guessed SHA.

Core CI retains its Node 22/24 matrix. Desktop CI uses Node 22 on native Linux/Windows x64 runners and separate macOS Intel x64/Apple Silicon arm64 runners. Push/PR path filters cover desktop, shared core/tooling, build inputs, and integration docs. It installs both lockfiles, checks types, runs desktop service tests and Electron E2E (with Xvfb on Linux), builds native candidates with explicit platform/architecture arguments and `--publish never`, and generates SHA-256 manifests. Only successful `workflow_dispatch` jobs upload unsigned candidate files as seven-day Actions build artifacts; push/PR runs do not upload them. These artifacts follow repository/Actions access rules and are not release assets or an approved public distribution channel.

CI checks changes; it does not deploy, publish packages, or create releases, and the desktop workflow requires no publishing/signing secrets. Metadata/topics/site changes, npm or Marketplace publication, release uploads, signing/notarization, and replacement/removal of legacy artifacts require separate approval and the [release checklist](docs/releasing.md).
