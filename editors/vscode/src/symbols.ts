import * as vscode from 'vscode';

export class PlainDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
  provideDocumentSymbols(
    document: vscode.TextDocument,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const symbols: vscode.DocumentSymbol[] = [];

    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text;

      // Match 'Set ABC = Main'
      const setMatch = text.match(/^\s*(Set\s+[A-Za-z0-9_]+\s*=\s*[A-Za-z0-9_]+)/i);
      if (setMatch) {
        const symbol = new vscode.DocumentSymbol(
          setMatch[1],
          'Entry Statement',
          vscode.SymbolKind.Event,
          line.range,
          line.range
        );
        symbols.push(symbol);
        continue;
      }

      // Match 'def func_name(...):' or 'function func_name(...)'
      const fnMatch = text.match(/^\s*(?:def|function|to)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\((.*?)\)/);
      if (fnMatch) {
        const fnName = fnMatch[1];
        const params = fnMatch[2];
        const symbol = new vscode.DocumentSymbol(
          fnName,
          `(${params})`,
          vscode.SymbolKind.Function,
          line.range,
          line.range
        );
        symbols.push(symbol);
        continue;
      }

      // Match variable assignment 'x = ...'
      const varMatch = text.match(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=(?!=)\s*(.+)$/);
      if (varMatch && !/^\s*(Set|if|while|for|def)\b/i.test(text)) {
        const varName = varMatch[1];
        const symbol = new vscode.DocumentSymbol(
          varName,
          varMatch[2].trim(),
          vscode.SymbolKind.Variable,
          line.range,
          line.range
        );
        symbols.push(symbol);
      }
    }

    return symbols;
  }
}
