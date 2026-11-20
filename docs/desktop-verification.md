# Plain Studio candidate verification — 2026-11-20

This is a local verification record for the Unreleased desktop source, not a public release announcement or a cross-platform certification.

## Environment

- Windows x64, build 10.0.26300
- Node.js 24.13.1, npm 10.2.0
- Electron 45.4.1, Monaco 0.57.0
- Desktop source and dependencies live separately under `desktop/`.

## Checks completed

- Core typechecking and test suite: **146 passed, 0 failed, 1 skipped**. The skipped check concerns legacy native artifacts. The existing optional/home-installed extension behavior was not changed, and no extension was installed for this work.
- Core/browser/VS Code build, example verification (**20 parsed, 13 deterministic examples executed**), npm package smoke test, and catalog verification passed during the baseline check.
- Desktop strict typechecking and **44 service/editor/runtime tests** passed.
- **3 native Electron end-to-end tests** passed: welcome/examples/palette/preferences/renderer boundary; Unicode file + interactive input + save + infinite-loop Stop; canceled save + dirty recovery without execution.
- The welcome screen passed the automated axe WCAG 2 A/AA rule scan. This is not a full accessibility certification, screen-reader test, or exhaustive editor/theme scan.
- An isolated source startup smoke test passed and exited successfully after checking renderer initialization. The runner cleans up its temporary profile after the process exits, avoiding live Chromium-cache locks on Windows.
- A fresh unpacked Windows candidate passed the same startup check.
- The actual packaged Electron executable ran the bundled `app.asar/dist/execution-child.cjs` interpreter successfully with the expected output. This does not use a globally installed Plain executable or an external Node executable for the run.
- Windows process fixtures verified that completion, Stop, and timeout terminate a managed child and grandchild. Deliberately detached/reparented processes and already-completed side effects are outside a rollback guarantee.
- Packaged resources were inspected: application/runtime/editor assets and notices are included; development dependencies, source maps, and legacy `build_assets`/executables are not included in the app archive.
- Final desktop `npm audit --audit-level=moderate`: **0 known vulnerabilities reported**. This is a point-in-time registry advisory check, not proof of absence of vulnerabilities. Locked overrides patch DOMPurify and the packaging glob dependencies; rerun packaging and tests when changing them.
- Electron-builder produced unsigned Windows NSIS and portable candidate formats. Current final-candidate files are local build outputs under `desktop/release-final/`, not committed binaries or published downloads.

## Not established here

- Linux AppImage/Debian installation, launch, or process-group behavior on a native Linux host.
- macOS Intel or Apple Silicon app/DMG/ZIP launch, file associations, or native behavior.
- Native CI results: `.github/workflows/desktop.yml` is configured, but was not pushed or run as part of this work.
- Windows installer installation/upgrade/uninstallation or file-association registration on a clean profile. Building an installer is not the same as installing and verifying it.
- The NSIS portable wrapper returned exit code 0 during a startup-check attempt but did not forward the renderer’s smoke marker to stdout. That wrapper check is **inconclusive**; the successful startup and bundled-runtime checks above apply to the actual unpacked packaged executable, not proof of portable extraction/launch behavior.
- Code signing, notarization, store acceptance, or public release approval. All local candidates are unsigned.
- Manual Narrator/VoiceOver/Linux screen-reader, IME, high-contrast, reduced-motion, or full DPI matrix checks.

The [desktop guide](desktop.md) contains reproducible development/build commands, trust boundaries, recovery limits, and the remaining release checklist. No commit, push, release upload, signing, deployment, or replacement of legacy downloads was performed.
