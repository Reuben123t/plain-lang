#!/usr/bin/env bash
# PLAIN Programming Language - Automatic Installer for Linux / macOS
# Run with: curl -fsSL https://raw.githubusercontent.com/Reuben123t/plain-lang/main/install.sh | bash

set -e

echo ""
echo "=========================================================="
echo "        PLAIN Programming Language Installer              "
echo "  The English-like language that's simple and powerful    "
echo "=========================================================="
echo ""

# 1. Check for Node.js
echo "[1/4] Checking for Node.js runtime..."
if ! command -v node >/dev/null 2>&1; then
    echo "Node.js is not found on your system."
    echo "Please install Node.js from https://nodejs.org or via your package manager:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  macOS:         brew install node"
    exit 1
fi
echo "  Node.js found ($(node --version))"

# 2. Destination directory
INSTALL_DIR="$HOME/.plain"
echo "[2/4] Downloading PLAIN into $INSTALL_DIR..."

if [ -d "$INSTALL_DIR" ]; then
    echo "  Existing installation detected. Updating..."
    rm -rf "$INSTALL_DIR"
fi

if command -v git >/dev/null 2>&1; then
    git clone https://github.com/Reuben123t/plain-lang.git "$INSTALL_DIR" --depth 1
else
    mkdir -p "$INSTALL_DIR"
    curl -fsSL https://github.com/Reuben123t/plain-lang/archive/refs/heads/main.tar.gz | tar -xz -C "$INSTALL_DIR" --strip-components=1
fi

# 3. Build PLAIN
echo "[3/4] Building PLAIN language package..."
cd "$INSTALL_DIR"
npm install --silent
npm run build
npm link >/dev/null 2>&1 || sudo npm link

# 4. Verify installation
echo "[4/4] Verifying installation..."

echo ""
echo "=========================================================="
echo "  PLAIN was installed successfully!                       "
echo "=========================================================="
echo ""
echo "Quick commands to try right now:"
echo "  plain repl            # Start interactive English shell"
echo "  plain playground      # Open visual code editor in browser"
echo "  plain examples        # View and run built-in examples"
echo "  plain <file.plain>    # Run any .plain program"
echo ""

