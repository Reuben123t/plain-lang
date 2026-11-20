# Plain Studio desktop

Plain Studio is the Electron app in [`desktop/`](../desktop). It shares the PLAIN language/runtime and tooling sources with the CLI, with a local Monaco-based editor and a native file/execution bridge. It is separate from the VS Code extension, static browser playground, Node-backed local IDE, and legacy Windows native launchers described in [release-native.md](release-native.md).

See the [local verification record](desktop-verification.md) for checks actually run and outstanding platform gates.

This guide describes Plain Studio **1.3.0-beta.1** and its candidate-build configuration. [Beta downloads and limitations](https://github.com/Reuben123t/plain-lang/releases/tag/v1.3.0-beta.1) are Windows x64 only, unsigned, and not a claim of successful verification on every configured platform. The root PLAIN runtime remains at `1.2.0`; the desktop app is versioned separately.

## Start from source

For **development**, install Node.js **22 or newer** with npm, obtain a source checkout, and run from its root:

```sh
npm ci
npm run desktop:setup
npm run desktop:dev
```

The root install and `desktop:setup` use separate committed lockfiles. `desktop:setup` is `npm ci --prefix desktop`; the desktop directory is not an npm workspace. `desktop:dev` builds the app, then starts Electron. It is not a hot-reload server: restart it after source changes. It does not require a globally installed `plain` command, an old native executable, or the VS Code extension.

**Packaged users do not need a separate Node.js installation.** Electron and the built language runtime are included in a candidate package. Development tools and package creation still require Node/npm. The root `npm run build`, `npm test`, and other core scripts keep their existing behavior; they do not install or build the desktop app.

On Linux, Electron needs a working GUI session and its operating-system libraries. For headless E2E use Xvfb. CI installs the GUI libraries using `npx --no-install playwright install-deps chromium` from `desktop/`; this helper can require administrator privileges on a local machine. Electron E2E launches the desktop package's Electron, not a separately downloaded Playwright browser.

### Interface-only browser preview

```sh
npm run desktop:build
npm run desktop:preview
```

The preview serves the built renderer at the loopback URL printed by the script (default `http://127.0.0.1:4317`). Stop it with Ctrl+C. It is explicitly an **interface preview**: native file dialogs, local saves, execution, and durable application-profile recovery are not available. It is neither the native app nor the browser playground's runnable pure-language Worker. Do not expose or forward the preview server publicly.

## What is implemented

- A welcome page, bundled examples opened as unsaved buffers, and recent-file navigation.
- Local files and folders through native dialogs, a folder explorer, multiple document tabs, new files, Save/Save As/Save All, and dirty-document close prompts.
- UTF-8 editing with line-ending/BOM preservation, version-aware saves that report external-change conflicts, and external-change checks on window focus. Keep backups; these checks are not a filesystem transaction guarantee.
- Monaco syntax highlighting, completions, hover help, document symbols, find/replace, formatting, and static diagnostics backed by the shared language tooling. Diagnostics do not execute a program or prove that it is safe.
- An explicit Run action, output/errors, interactive input prompts, program arguments, Stop, and an execution time limit. The output panel is program I/O, not a general terminal.
- A command palette, keyboard shortcuts, resizable explorer/output areas, a Problems view, and a searchable builtin reference.
- Local editor preferences and bounded, best-effort session recovery.

There is no integrated PTY/shell terminal, step debugger/breakpoints, AI assistant, extension marketplace, cloud account/sync, or automatic application updater in this app. Language-level AI/network/system builtins in the reference do not imply those desktop features. Native packaging targets are candidates, not proof that installation or OS integration has been tested.

### Basic editing and running

1. Create a file, open a trusted `.plain` file/folder, or choose a bundled example. Opening an example makes an editable copy; it does not execute it.
2. Edit and save deliberately. Unsaved buffers can be run without writing them to disk. Save conflicts leave the editor buffer available; inspect the disk version or use Save As rather than assuming it was overwritten.
3. Use **Arguments** to enter one argument per line. Values are available through `args()`. Spaces within a line remain part of that argument; this field is not a shell command line.
4. Choose **Run** or F5. Answer `ask`/input prompts in the Output panel. Use **Stop** or Shift+F5 to request cancellation. Review runtime errors and Problems independently.

Open the command palette with Ctrl/Command+K, the title-bar button, or the native **View** menu (Ctrl/Command+Shift+P). Other common actions include Ctrl/Command+N, O, S, W, and comma for preferences; the native menus show their accelerators. Some keyboards/OS settings reserve function keys, so use the visible Run/Stop controls when necessary.

## Trust and execution boundaries

**Run only trusted code. A desktop run has the host capabilities of the current user account; it is not a security sandbox.** The interpreter can expose filesystem, environment, network, subprocess/shell, imports, and other registered host builtins. Selecting a workspace or restricting editor file access does not turn executed PLAIN into a confined program. Imported local modules execute too. Do not infer browser restrictions from the shared editor or language syntax.

The renderer is isolated from Node: native operations go through the preload bridge and validated IPC, not an unrestricted renderer `require`, arbitrary shell endpoint, or an exposed local HTTP code-execution server. File dialogs and scoped file grants limit what the editor bridge can read/write. Renderer isolation, file validation, a child-process boundary, and an execution timeout protect specific boundaries; none removes the authority of deliberately run host code.

Opening a file/folder, restoring a session, selecting an example, formatting, and static analysis must **not automatically execute user code**. The native Run path requires an explicit user action and asks for trust before running in an execution directory. Trust is remembered only for that directory in the current application session, not granted forever by a restored profile. Saved-file runs resolve imports relative to the file’s own directory; untitled buffers use the selected workspace or a scratch directory; an untitled buffer without a workspace uses a scratch directory under the app profile. Keep the no-automatic-execution invariant when adding shortcuts, opening file associations, or restoring a profile.

Execution plumbing must preserve the supplied argument array. If an integration provides an `onRun` callback, it must use its provided arguments, carry them through the run request, and expose those values to `args()`; it must not silently replace them with `[]` or interpolate them into a shell command. The desktop Arguments dialog and native bridge follow this same value-array contract.

Stop/timeouts terminate the managed run; they are not rollback. Files already changed, network requests already sent, or separately spawned host processes may outlive cancellation. A timeout/output limit is resource management, not an untrusted-code execution service. See [SECURITY.md](../SECURITY.md) for the project's trust boundaries and reporting process.

## Preferences and recovery

Settings are stored locally in Electron's application `userData` directory, together with recent paths and a versioned `desktop-state.json` recovery profile. The exact profile location depends on the OS and application name/build; source runs and packaged candidates may have different names. It is not stored in the project workspace and is not cloud-synced. Recovery contains source-buffer contents and local paths in plaintext, so treat the profile like your source files and do not upload it with bug reports.

The default theme is dark; light and follow-system modes are available. Preferences include editor font size, indentation width, word wrap, minimap, and the execution time limit (default 30 seconds; host-validated range 1–300 seconds).

Recovery is **bounded and best effort**, not a backup, durable autosave promise, or substitute for Save:

- At most 32 documents, 2 MiB of UTF-8 content per document, and 12 MiB of total recovered document content are accepted.
- The serialized profile is capped at 16 MiB; recent file/folder lists are each capped at 20 entries. Metadata/JSON overhead counts toward the profile cap.
- Session snapshots are debounced, so a crash/forced quit can lose the latest edits. Invalid, unsupported-schema, oversized, inaccessible, or damaged profiles may not restore. A rejected recovery write does not mean the open buffer was saved to disk.
- Restoring buffers does not execute them. Review recovered content and any external file changes before saving or running. Save important work explicitly and maintain independent backups.

The current host also bounds captured output (1 MiB over the run's lifetime, even after clearing the panel), program input (16 KiB per response and 1 MiB total), and program arguments (128 values and 32 KiB total UTF-8). Directory listings reject more than 2,000 entries. UI controls may impose stricter limits. The execution child has a 128 MiB V8 heap limit, 4 MiB stack limit, and periodic 256 MiB RSS checks; these are not hard OS limits on all descendant processes. None of these limits confines code that can use host builtins.

## Development checks and isolated startup

Keep the [core development checks](../CONTRIBUTING.md) as well as the desktop-specific ones:

```sh
npm run desktop:typecheck
npm run desktop:test
npm run desktop:build
npm run desktop:test:e2e
```

On a headless Linux host:

```sh
xvfb-run -a npm run desktop:test:e2e
```

`desktop:test` runs the desktop service/document tests. `desktop:test:e2e` rebuilds and runs the Electron Playwright specs. E2E must use temporary fixtures and an isolated profile, not a developer's real home/application data. Test-mode launches require an unpackaged app and the `--test-mode` flag. Set `PLAIN_DESKTOP_TEST_DIR` to a test-owned temporary directory when recovery must persist between launches; without it, test mode creates its own temporary profile. Chromium session/cache data is isolated too. This is not a user setting or a packaging feature. Do not set it to a real profile or workspace.

For a bounded native startup check:

```sh
npm --prefix desktop run test:smoke
```

`--smoke-test` creates its own isolated temporary profile, checks native startup, preload availability, and successful renderer initialization, prints `PLAIN_DESKTOP_SMOKE_OK` on that check's success, and exits without running a user program. It has a 30-second watchdog and must not touch the normal application profile. The marker is a narrow startup check, not proof that every renderer interaction passed; it is not a replacement for service tests, interactive E2E, or launching the packaged app.

Root aliases forward extra arguments after `--`, for example `npm run desktop:test:e2e -- --list`. Their direct equivalents are `npm --prefix desktop run dev`, `build`, `typecheck`, `test`, `test:e2e`, `preview`, `package`, `package:dir`, and `checksums` (one script name per invocation).

## Native candidate builds (no publication)

Build on the **native target OS** after installing both locked dependency sets and running the checks above. The configuration is [`desktop/electron-builder.yml`](../desktop/electron-builder.yml). Build output is `desktop/dist/`; native candidates and checksum manifests go to `desktop/release/`. These directories, Playwright results/reports, and local `.artifacts*.log` files are ignored. Do not overwrite or delete the repository's legacy native artifacts.

| Native host / architecture | Explicit candidate command from the repository root | Configured outputs |
| --- | --- | --- |
| Windows x64 | `npm run desktop:package -- --win nsis portable --x64` | NSIS installer and portable `.exe` |
| Linux x64 | `npm run desktop:package -- --linux AppImage deb --x64` | `.AppImage` and `.deb` |
| macOS Intel x64 | `npm run desktop:package -- --mac dmg zip --x64` | `.dmg` and `.zip` |
| macOS Apple Silicon arm64 | `npm run desktop:package -- --mac dmg zip --arm64` | `.dmg` and `.zip` |

The macOS config lists both architectures. Supply **both explicit target names and the architecture** as above: an architecture flag alone can still let electron-builder expand the configured target architectures. Do not describe a cross-built architecture as tested because another architecture launched. Do not use Linux or Windows packaging as evidence of a working macOS artifact.

For an unpacked local application directory rather than an installer/archive, use the same native platform/architecture flags with `desktop:package:dir`, for example:

```sh
npm run desktop:package:dir -- --win --x64
```

Both package scripts already force `--publish never`, and builder configuration has `publish: null`. Do not append a second `--publish` flag: some builder versions parse repeated flags as an array rather than the required scalar `never`. No signing/notarization credential is required or authorized. To avoid automatic discovery of local signing identities, set `CSC_IDENTITY_AUTO_DISCOVERY=false` in the packaging environment (PowerShell: `$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"`; POSIX: `export CSC_IDENTITY_AUTO_DISCOVERY=false`). macOS has `identity: null`. Treat all these outputs as unsigned, unnotarized development candidates; OS trust prompts or launch restrictions remain possible. Do not disable system protections to make a candidate pass review.

After creating distributable files:

```sh
npm run desktop:checksums
```

This hashes the current top-level `.exe`, `.AppImage`, `.deb`, `.dmg`, and `.zip` files into `desktop/release/SHA256SUMS`. It does not hash the unpacked directory or prove freshness; use a clean test checkout/output directory to avoid mixing old candidates. SHA-256 verifies bytes, not publisher identity, signing, notarization, or safety.

### Desktop CI

[`.github/workflows/desktop.yml`](../.github/workflows/desktop.yml) is a **nonpublishing validation/candidate workflow** with read-only repository contents permission. It is manually dispatchable and also runs on push/PR changes to desktop, shared `src` (including tooling/runtime), build/test/assets/examples inputs, root manifests/TypeScript config, and desktop integration docs. The existing core CI matrix is unchanged.

The desktop matrix uses Node 22 with native Linux x64 (`ubuntu-24.04`), Windows x64 (`windows-2022`), macOS Intel x64 (`macos-15-intel`), and macOS Apple Silicon arm64 (`macos-15`). It checks the actual runner platform/architecture, installs both lockfiles, checks core/desktop types, runs desktop service tests, builds, runs sandbox-enabled Electron E2E (Xvfb on Linux), packages explicit native architectures with `--publish never`, launches the unpacked native application in an isolated startup check, and generates checksums. The disposable Linux runner configures Chromium’s sandbox helper with root ownership/mode 4755, while the application itself runs as the ordinary runner user; the workflow does not disable sandboxing or global OS protections. Packaged-app startup is distinct from installer installation/upgrade/uninstall testing. These are configured jobs, not a report that they have passed.

Only successful manual `workflow_dispatch` jobs upload their candidate files and `SHA256SUMS` via `actions/upload-artifact`, with seven-day retention. Push/PR runs do not upload candidates. Uploads are ordinary Actions build artifacts governed by repository/Actions access, **not** GitHub release assets, guaranteed-private downloads, or an approved public release. The workflow does not publish npm packages, create tags/releases, deploy a site, sign/notarize, modify repository settings, or use publishing/signing secrets.

## Outstanding manual verification and release gates

Automated check configuration does not establish completed test results. Before approving distribution, record the exact commit, OS/architecture, Node/Electron versions, candidate filenames/hashes, and checks actually run. In particular, manual accessibility and clean/existing-profile testing remain outstanding unless separately recorded:

- Keyboard-only navigation, visible focus, menu accelerators, focus trapping/return in dialogs and palette, and Run/Stop/input without a mouse.
- Screen readers, editor announcements, Problems/error navigation, contrast in all themes, high contrast/reduced motion, OS scaling/zoom, and long labels/output.
- First launch with a clean profile; restart with saved/unsaved/recovered tabs; corrupt/oversized/unwritable profiles; missing/renamed files; recovery limits and interrupted writes. Use test-owned profiles and do not reset a real user's data as a test step.
- Native open/save dialogs, canceled actions, save conflicts, readonly paths, spaces/non-ASCII names, BOM/line endings, and file associations against the actual package.
- Argument fidelity (including spaces/empty values), interactive input, runtime errors, Stop/timeouts, and no execution on open/restore/example selection.
- Each Windows installer/portable candidate, Linux AppImage/deb, and macOS x64/arm64 dmg/zip on the corresponding clean machine/profile, including install, launch, upgrade, uninstall, and preserved user data.
- Bundled dependency/runtime licenses, candidate size/content, hashes, OS trust behavior, and any signing/notarization plan.

Signing, notarization, public downloads/releases, publication channels, version changes, and replacement/removal of legacy binaries require **separate approval** under the [release checklist](releasing.md). A successful CI build, a smoke launch, or an Actions artifact upload is not that approval.
