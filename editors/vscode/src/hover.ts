import * as vscode from 'vscode';
import { BUILTINS_DOCS } from './completions';

export class PlainHoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position, /[A-Za-z0-9_.]+/);
    if (!range) return null;

    const word = document.getText(range);

    // Look for exact match or cyber.* match
    const found = BUILTINS_DOCS.find(b => b.name === word || b.name.toLowerCase() === word.toLowerCase());
    if (found) {
      const md = new vscode.MarkdownString();
      md.appendCodeblock(found.detail, 'plain');
      md.appendMarkdown('\n\n' + found.doc);
      return new vscode.Hover(md, range);
    }

    // Check Set ABC statement
    const lineText = document.lineAt(position.line).text;
    if (/^\s*Set\s+ABC\s*=\s*Main\b/i.test(lineText)) {
      const md = new vscode.MarkdownString();
      md.appendCodeblock('Set ABC = Main', 'plain');
      md.appendMarkdown('\n\n**PLAIN Entry Declaration**: Designates this script as the primary execution unit.');
      return new vscode.Hover(md, range);
    }

    return null;
  }
}
