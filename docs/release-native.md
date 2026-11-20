# Windows native release staging

The optional Windows launcher is `scripts/build-exe.cs`. It launches an embedded Node runtime and CLI bundle. The normal source build is the supported starting point; a new `.exe` is **not** produced by `npm run build` or by staging assets.

Existing `dist` executables/archives/VSIX files and `build_assets` contents are legacy artifacts. Do not overwrite or delete them as part of a source/docs cleanup. A larger executable is not evidence of more functionality.

## Prepare genuine assets

Use a Windows machine with Node.js **22 or newer**, and run from the repository root:

```powershell
npm ci
npm run build:bundle
node scripts/prepare-exe-assets.js
```

This stages into `build_assets/native`. The directory must be new or empty. For another candidate, choose another empty path:

```powershell
node scripts/prepare-exe-assets.js --output .artifacts/native-candidate-assets
```

`--bundle <path>` selects a deliberately built alternative bundle. The default is `dist/bundle.js`. A missing or empty bundle is an error; an ordinary TypeScript compile is not enough to produce this standalone entry point. The script cannot establish bundle freshness for you, so build it from the source being released immediately before staging.

The staging script:

- Runs only on Windows; it cannot rename a Linux/macOS Node runtime into a valid Windows executable.
- Copies the current `process.execPath` as `node.exe`, the bundle as `bundle.js`, project license/documentation, and a genuine icon if present.
- Records the runtime manifest version, Node version, platform, architecture, actual byte sizes, and SHA-256 of each copied asset in `manifest.json`.
- Reports `totalAssetBytes` as the sum of the copied payload files, excluding `manifest.json` itself. This is a staging total, not a finished executable size.
- Refuses nonempty outputs and uses exclusive file creation. It never deletes old assets or overwrites an existing artifact. A failed run can leave a partial staging directory for inspection; choose a fresh output afterward.
- Does not compile, sign, install, download dependencies/runtimes, or publish anything.

There is no `student_data.dat` generation and no target-size padding. The old file contained synthetic repeated bytes, not a substantive knowledge bank or trained model. It remains untouched on disk; it is deliberately excluded from new staging and must not be picked up by a wildcard resource command.

## Review the manifest

Inspect `manifest.json` and verify each file against its size and SHA-256 before compilation. For example, in PowerShell:

```powershell
$stage = "build_assets/native"
$manifest = Get-Content "$stage/manifest.json" -Raw | ConvertFrom-Json
$total = 0
foreach ($asset in $manifest.assets) {
    $file = Join-Path $stage $asset.path
    if ((Get-Item $file).Length -ne $asset.sizeBytes) { throw "Size mismatch: $file" }
    if ((Get-FileHash $file -Algorithm SHA256).Hash.ToLowerInvariant() -ne $asset.sha256) {
        throw "Checksum mismatch: $file"
    }
    $total += $asset.sizeBytes
}
if ($total -ne $manifest.totalAssetBytes) { throw "Manifest total mismatch" }
```

These checks detect file changes; they do not prove provenance, perform signing, or satisfy third-party license requirements. Obtain and include the applicable Node/runtime dependency license notices before redistributing a candidate.

## C# launcher resource mapping

The current launcher reads embedded resources named **`node.exe`**, **`bundle.js`**, and optionally **`plain.ico`**. It does not read `student_data.dat`. Keep those logical resource names while changing the input paths to the new staging directory.

There is no automated, signed native release pipeline assumed here. On a configured Windows C# developer command prompt where `csc` is available, a manual candidate build can use explicit resources. First choose a **new** output directory and filename; do not use the existing `dist/plain.exe`:

```powershell
New-Item -ItemType Directory -Path .artifacts/native-candidate -ErrorAction Stop
csc /nologo /target:exe /out:.artifacts/native-candidate/plain.exe /resource:build_assets/native/node.exe,node.exe /resource:build_assets/native/bundle.js,bundle.js scripts/build-exe.cs
```

If an icon is deliberately included, add `/resource:build_assets/native/plain.ico,plain.ico` and an appropriate `/win32icon:` argument. Do not embed every file in `build_assets` by wildcard. Documentation and license files are staged alongside the payload; the current launcher does not extract them from assembly resources.

This command is an example for a configured compiler, not evidence that a candidate has been built or verified. Review launcher assembly metadata/version and compiler/runtime architecture compatibility. Staging uses the architecture of the current Node executable; do not label an ARM64 staging set as x64.

## Native release gates

Before approving any new native download:

- Test on a clean Windows user profile and a representative upgrade profile, not just a developer machine with an old installed runtime.
- Review the launcher's cached-runtime extraction/update behavior, resource failure handling, quoting of script arguments, exit status, and paths containing spaces/non-ASCII text.
- Ensure bundled runtime and CLI versions match the reviewed sources and that license notices are distributed.
- Test ordinary scripts, `--` arguments, syntax failures, and intentional process termination against the actual `.exe`.
- Verify the desktop IDE separately; staging this CLI does not compile or install `plain-ide.exe`.
- Record actual candidate hashes/sizes and platform/architecture. Signing and installation/upgrade/uninstall checks are separate requirements.
- Do not silently update, remove, or relabel old downloads. Release uploads and replacement decisions require separate approval under the [launch checklist](releasing.md).
