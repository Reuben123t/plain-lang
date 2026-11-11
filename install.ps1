# PLAIN Programming Language - Automatic Installer for Windows
# Run with: irm https://raw.githubusercontent.com/Reuben123t/plain-lang/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "        PLAIN Programming Language Installer              " -ForegroundColor Cyan
Write-Host "  The English-like language that's simple and powerful    " -ForegroundColor Gray
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check for Node.js
Write-Host "[1/4] Checking for Node.js runtime..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) {
    Write-Host "Node.js is not found on your system." -ForegroundColor Red
    Write-Host "Attempting to install Node.js via winget..." -ForegroundColor Yellow
    try {
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        Write-Host "Node.js installed. Please restart your terminal after this installation." -ForegroundColor Green
    } catch {
        Write-Host "Please download and install Node.js from https://nodejs.org/ and re-run this script." -ForegroundColor Red
        exit 1
    }
} else {
    $nodeVer = & node --version
    Write-Host "  Node.js found ($nodeVer)" -ForegroundColor Green
}

# 2. Determine installation directory
$installDir = Join-Path $HOME ".plain"
Write-Host "[2/4] Downloading PLAIN into $installDir..." -ForegroundColor Yellow

if (Test-Path $installDir) {
    Write-Host "  Existing installation detected. Updating..." -ForegroundColor Gray
    try {
        Push-Location $installDir
        git pull origin main 2>$null
        Pop-Location
    } catch {
        Remove-Item -Recurse -Force $installDir -ErrorAction SilentlyContinue
    }
}

if (-not (Test-Path $installDir)) {
    $gitCmd = Get-Command git -ErrorAction SilentlyContinue
    if ($gitCmd) {
        & git clone https://github.com/Reuben123t/plain-lang.git $installDir --depth 1
    } else {
        # Fallback to downloading ZIP from GitHub
        $zipUrl = "https://github.com/Reuben123t/plain-lang/archive/refs/heads/main.zip"
        $zipPath = Join-Path $env:TEMP "plain-lang.zip"
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
        Expand-Archive -Path $zipPath -DestinationPath $env:TEMP -Force
        Move-Item -Path (Join-Path $env:TEMP "plain-lang-main") -Destination $installDir -Force
        Remove-Item -Force $zipPath -ErrorAction SilentlyContinue
    }
}

# 3. Build PLAIN
Write-Host "[3/4] Building PLAIN language package..." -ForegroundColor Yellow
Push-Location $installDir
& npm install --silent
& npm run build
& npm link
Pop-Location

# 4. Verify installation
Write-Host "[4/4] Verifying installation..." -ForegroundColor Yellow
$plainCmd = Get-Command plain -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  PLAIN was installed successfully!                       " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Quick commands to try right now:" -ForegroundColor White
Write-Host "  plain repl            # Start interactive English shell" -ForegroundColor Cyan
Write-Host "  plain playground      # Open visual code editor in browser" -ForegroundColor Cyan
Write-Host "  plain examples        # View and run built-in examples" -ForegroundColor Cyan
Write-Host "  plain <file.plain>    # Run any .plain program" -ForegroundColor Cyan
Write-Host ""

