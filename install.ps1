# Review this script before running it. It never replaces an existing installation.
param(
    [string]$InstallDir = $(if ($env:PLAIN_INSTALL_DIR) { $env:PLAIN_INSTALL_DIR } else { Join-Path $HOME ".plain" })
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-Checked {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command failed with exit code $LASTEXITCODE. No existing installation was replaced."
    }
}

Write-Host "PLAIN source installer" -ForegroundColor Cyan
foreach ($tool in @("node", "npm", "git")) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        throw "Required tool is missing: $tool. Install Node.js 22+ and Git, then restart the terminal."
    }
}
Invoke-Checked "node" @("-e", 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)')
if (Test-Path -LiteralPath $InstallDir) {
    throw "Destination already exists: $InstallDir. Nothing was changed. Choose -InstallDir with a new path or update your checkout manually."
}

Write-Host "Cloning into a new directory: $InstallDir"
Invoke-Checked "git" @("clone", "--depth", "1", "https://github.com/Reuben123t/plain-lang.git", $InstallDir)
Invoke-Checked "npm" @("--prefix", $InstallDir, "ci", "--ignore-scripts", "--no-audit", "--no-fund")
Invoke-Checked "npm" @("--prefix", $InstallDir, "run", "build")
Invoke-Checked "node" @((Join-Path $InstallDir "bin/plain.js"), "--version")

Write-Host "PLAIN is built. Run it with:" -ForegroundColor Green
Write-Host "  node `"$(Join-Path $InstallDir 'bin/plain.js')`" repl"
Write-Host "Optional global command setup (review permissions first):"
Write-Host "  npm --prefix `"$InstallDir`" link --ignore-scripts"
Write-Host "No existing files, shell profiles, global packages, or system settings were changed."
