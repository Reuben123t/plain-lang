import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PlainCompletionProvider } from './completions';
import { PlainHoverProvider } from './hover';
import { PlainDocumentSymbolProvider } from './symbols';
import { PlainDiagnosticProvider } from './diagnostics';

let plainTerminal: vscode.Terminal | undefined;

function getPlainTerminal(): vscode.Terminal {
  if (plainTerminal && !plainTerminal.exitStatus) {
    return plainTerminal;
  }
  plainTerminal = vscode.window.createTerminal({
    name: 'PLAIN Shell',
    iconPath: new vscode.ThemeIcon('terminal')
  });
  return plainTerminal;
}

export function activate(context: vscode.ExtensionContext) {
  // 1. Language Providers
  const plainSelector: vscode.DocumentSelector = { language: 'plain', scheme: 'file' };

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      plainSelector,
      new PlainCompletionProvider(),
      '.', ' ', '('
    )
  );

  context.subscriptions.push(
    vscode.languages.registerHoverProvider(plainSelector, new PlainHoverProvider())
  );

  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(plainSelector, new PlainDocumentSymbolProvider())
  );

  // 2. Diagnostics (Linter)
  const diagProvider = new PlainDiagnosticProvider(context);
  if (vscode.window.activeTextEditor) {
    diagProvider.updateDiagnostics(vscode.window.activeTextEditor.document);
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => diagProvider.updateDiagnostics(e.document)),
    vscode.workspace.onDidOpenTextDocument(doc => diagProvider.updateDiagnostics(doc)),
    vscode.workspace.onDidCloseTextDocument(doc => diagProvider.clear(doc))
  );

  // 3. Document Formatter
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(plainSelector, {
      provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
        const edits: vscode.TextEdit[] = [];
        let indentLevel = 0;
        const indentStr = '    ';

        for (let i = 0; i < document.lineCount; i++) {
          const line = document.lineAt(i);
          let trimmed = line.text.trim();
          if (trimmed.length === 0) continue;

          // Decrease indent for closing constructs
          if (/^(end\b|otherwise\b|else\b)/i.test(trimmed)) {
            indentLevel = Math.max(0, indentLevel - 1);
          }

          const newText = indentStr.repeat(indentLevel) + trimmed;
          if (newText !== line.text) {
            edits.push(vscode.TextEdit.replace(line.range, newText));
          }

          // Increase indent for opening constructs
          if (/^(def\b.*:|while\b.*:|if\b.*|function\b.*|repeat\b.*|for\s+each\b.*|to\b.*|otherwise\b|else\b)/i.test(trimmed)) {
            indentLevel++;
          }
        }

        return edits;
      }
    })
  );

  // 4. Command: Run File in Terminal
  const runFileCmd = vscode.commands.registerCommand('plain.runFile', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active PLAIN file to run.');
      return;
    }

    // Save before running
    editor.document.save().then(() => {
      const filePath = editor.document.fileName;
      const term = getPlainTerminal();
      term.show();
      term.sendText(`plain "${filePath}"`);
    });
  });

  // 5. Command: Start REPL
  const startReplCmd = vscode.commands.registerCommand('plain.startRepl', () => {
    const term = getPlainTerminal();
    term.show();
    term.sendText('plain');
  });

  // 6. Command: Open in PLAIN Code Studio (Native IDE)
  const openInIdeCmd = vscode.commands.registerCommand('plain.openInIde', () => {
    const editor = vscode.window.activeTextEditor;
    const filePath = editor ? `"${editor.document.fileName}"` : '';

    // Locate plain-ide.exe
    const localAppData = process.env.LOCALAPPDATA || '';
    const idePath = path.join(localAppData, 'PLAIN', 'bin', 'plain-ide.exe');

    const cp = require('child_process');
    if (fs.existsSync(idePath)) {
      cp.spawn(idePath, filePath ? [editor!.document.fileName] : [], { detached: true, stdio: 'ignore' }).unref();
      vscode.window.showInformationMessage('Opened in PLAIN Code Studio Desktop IDE.');
    } else {
      cp.spawn('plain-ide', filePath ? [editor!.document.fileName] : [], { detached: true, stdio: 'ignore', shell: true }).unref();
    }
  });

  // 7. Command: Cybersecurity Scan
  const cyberScanCmd = vscode.commands.registerCommand('plain.runCyberScan', async () => {
    const host = await vscode.window.showInputBox({
      prompt: 'Enter target host/IP or URL to run PLAIN cybersecurity audit',
      value: '127.0.0.1'
    });

    if (!host) return;

    const term = getPlainTerminal();
    term.show();
    const script = `
import cyber
say "=== PLAIN Cybersecurity Audit ==="
ports = [21, 22, 80, 443, 8080]
open_ports = cyber.port_scan("${host}", ports)
say "Open Ports: " + str(open_ports)
say "Scan completed successfully!"
`;
    // Create temporary file and run
    const tmpFile = path.join(process.env.TEMP || '.', `audit_${Date.now()}.plain`);
    fs.writeFileSync(tmpFile, script.trim(), 'utf-8');
    term.sendText(`plain "${tmpFile}"`);
  });

  // 8. Command: Show Documentation
  const showDocsCmd = vscode.commands.registerCommand('plain.showDocs', () => {
    vscode.env.openExternal(vscode.Uri.parse('https://reuben123t.github.io/plain-lang/'));
  });

  // 9. Status Bar Item
  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = '$(rocket) PLAIN v1.3.0';
  statusBar.tooltip = 'Click to open PLAIN quick actions';
  statusBar.command = 'plain.showMenu';
  statusBar.show();

  const showMenuCmd = vscode.commands.registerCommand('plain.showMenu', async () => {
    const choice = await vscode.window.showQuickPick([
      { label: '$(play) Run Current File', description: 'Execute active .plain file with plain CLI', action: 'plain.runFile' },
      { label: '$(terminal) Launch PLAIN Interactive REPL', description: 'Start interactive terminal shell', action: 'plain.startRepl' },
      { label: '$(shield) Run Cybersecurity Audit', description: 'Scan ports and analyze host security', action: 'plain.runCyberScan' },
      { label: '$(window) Open in PLAIN Code Studio (Native IDE)', description: 'Launch standalone desktop IDE', action: 'plain.openInIde' },
      { label: '$(book) View Language Documentation', description: 'Open online standard library docs', action: 'plain.showDocs' }
    ], {
      placeHolder: 'PLAIN Language Tools & Actions'
    });

    if (choice && choice.action) {
      vscode.commands.executeCommand(choice.action);
    }
  });

  context.subscriptions.push(
    runFileCmd,
    startReplCmd,
    openInIdeCmd,
    cyberScanCmd,
    showDocsCmd,
    showMenuCmd,
    statusBar
  );
}

export function deactivate() {
  if (plainTerminal) {
    plainTerminal.dispose();
  }
}
