import * as vscode from 'vscode';

export class PlainDiagnosticProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor(context: vscode.ExtensionContext) {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('plain');
    context.subscriptions.push(this.diagnosticCollection);
  }

  public updateDiagnostics(document: vscode.TextDocument): void {
    if (document.languageId !== 'plain') return;

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    // 1. Check for UTF-8 BOM
    if (text.charCodeAt(0) === 0xFEFF) {
      const range = new vscode.Range(0, 0, 0, 1);
      const diag = new vscode.Diagnostic(
        range,
        'UTF-8 Byte Order Mark (BOM) detected. PLAIN scripts should be saved without BOM.',
        vscode.DiagnosticSeverity.Warning
      );
      diagnostics.push(diag);
    }

    // 2. Line by line linting
    for (let i = 0; i < document.lineCount; i++) {
      const line = document.lineAt(i);
      const lineText = line.text;

      // Ignore comments
      const commentIdx = lineText.indexOf('#');
      const codePart = commentIdx !== -1 ? lineText.substring(0, commentIdx) : lineText;

      // Unclosed string quotes check
      let inDouble = false;
      let inSingle = false;
      for (let c = 0; c < codePart.length; c++) {
        const ch = codePart[c];
        if (ch === '"' && (c === 0 || codePart[c - 1] !== '\\')) {
          inDouble = !inDouble;
        } else if (ch === "'" && (c === 0 || codePart[c - 1] !== '\\')) {
          inSingle = !inSingle;
        }
      }

      if (inDouble) {
        const range = new vscode.Range(i, 0, i, lineText.length);
        diagnostics.push(new vscode.Diagnostic(
          range,
          'Unclosed double quote (") in string literal.',
          vscode.DiagnosticSeverity.Error
        ));
      }
      if (inSingle) {
        const range = new vscode.Range(i, 0, i, lineText.length);
        diagnostics.push(new vscode.Diagnostic(
          range,
          "Unclosed single quote (') in string literal.",
          vscode.DiagnosticSeverity.Error
        ));
      }

      // Check for typo in Set ABC
      if (/^\s*set\s+abc\s*=/i.test(codePart) && !/^\s*Set\s+ABC\s*=/i.test(codePart)) {
        const range = new vscode.Range(i, 0, i, lineText.length);
        diagnostics.push(new vscode.Diagnostic(
          range,
          "Recommended casing is 'Set ABC = Main'.",
          vscode.DiagnosticSeverity.Information
        ));
      }
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  public clear(document: vscode.TextDocument): void {
    this.diagnosticCollection.delete(document.uri);
  }
}
