# PLAIN Language Support for VS Code

Official Visual Studio Code extension for **PLAIN** (`.plain` files).

## Features
- **Syntax Highlighting**: Beautiful English keyword, operator, string, number, and function coloring.
- **Auto-Closing & Bracket Matching**: Automatically closes quotes (`"..."`), brackets (`[...]`), and parentheses (`(...)`).
- **Comment Support**: Toggle line comments using `#`.
- **Code Folding**: Fold `if ... end`, `repeat ... end`, `for each ... end`, and `to ... end` blocks.

## How to Install in VS Code

### Method 1: Direct Folder Copy (Easiest & Instant)
Copy the `editors/vscode` folder into your VS Code extensions folder:
- **Windows**: `%USERPROFILE%\.vscode\extensions\plain-language-support`
- **macOS / Linux**: `~/.vscode/extensions/plain-language-support`

Restart VS Code or run `Developer: Reload Window`. Open any `.plain` file!

### Method 2: Package with `vsce`
```bash
npm install -g @vscode/vsce
cd editors/vscode
vsce package
code --install-extension plain-language-support-1.0.0.vsix
```
