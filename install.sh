#!/usr/bin/env bash
# Review this script before running it. It never replaces an existing installation.
set -euo pipefail

INSTALL_DIR="${PLAIN_INSTALL_DIR:-$HOME/.plain}"
printf '\nPLAIN source installer\n\n'
for tool in node npm git; do
    if ! command -v "$tool" >/dev/null 2>&1; then
        printf 'Required tool is missing: %s. Install Node.js 22+ and Git first.\n' "$tool" >&2
        exit 1
    fi
done
if ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)'; then
    printf 'PLAIN requires Node.js 22 or newer.\n' >&2
    exit 1
fi
if [ -e "$INSTALL_DIR" ] || [ -L "$INSTALL_DIR" ]; then
    printf 'Destination already exists: %s\nNothing was changed. Choose a new PLAIN_INSTALL_DIR or update your checkout manually.\n' "$INSTALL_DIR" >&2
    exit 1
fi

printf 'Cloning into a new directory: %s\n' "$INSTALL_DIR"
git clone --depth 1 https://github.com/Reuben123t/plain-lang.git "$INSTALL_DIR"
printf 'Installing locked development dependencies without lifecycle hooks...\n'
npm --prefix "$INSTALL_DIR" ci --ignore-scripts --no-audit --no-fund
npm --prefix "$INSTALL_DIR" run build
node "$INSTALL_DIR/bin/plain.js" --version

printf '\nPLAIN is built. Run it with:\n  node "%s/bin/plain.js" repl\n' "$INSTALL_DIR"
printf 'Optional global command setup (review permissions first):\n  npm --prefix "%s" link --ignore-scripts\n' "$INSTALL_DIR"
printf 'No existing files, shell profiles, global packages, or system settings were changed.\n'
