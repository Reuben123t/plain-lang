import * as vscode from 'vscode';

export interface BuiltinDoc {
  name: string;
  kind: vscode.CompletionItemKind;
  detail: string;
  doc: string;
  snippet?: string;
}

export const BUILTINS_DOCS: BuiltinDoc[] = [
  {
    name: 'Set ABC = Main',
    kind: vscode.CompletionItemKind.Keyword,
    detail: 'PLAIN Entry Declaration',
    doc: 'Initializes the main execution block in PLAIN.',
    snippet: 'Set ABC = Main\n'
  },
  {
    name: 'say',
    kind: vscode.CompletionItemKind.Keyword,
    detail: 'say <expression>',
    doc: 'Outputs text or expressions directly to the terminal or screen.\n\nExample:\n```plain\nsay "Hello, world!"\n```',
    snippet: 'say "$1"$0'
  },
  {
    name: 'str',
    kind: vscode.CompletionItemKind.Function,
    detail: 'str(value) -> string',
    doc: 'Converts any value (number, boolean, list, dict) to a string.\n\nExample:\n```plain\nmsg = "Result: " + str(42)\n```',
    snippet: 'str($1)$0'
  },
  {
    name: 'int',
    kind: vscode.CompletionItemKind.Function,
    detail: 'int(value) -> integer',
    doc: 'Converts a number or string to an integer.\n\nExample:\n```plain\nx = int("123")\n```',
    snippet: 'int($1)$0'
  },
  {
    name: 'float',
    kind: vscode.CompletionItemKind.Function,
    detail: 'float(value) -> float',
    doc: 'Converts a number or string to a floating point number.\n\nExample:\n```plain\npi = float("3.14159")\n```',
    snippet: 'float($1)$0'
  },
  {
    name: 'bool',
    kind: vscode.CompletionItemKind.Function,
    detail: 'bool(value) -> boolean',
    doc: 'Converts a value to true or false.',
    snippet: 'bool($1)$0'
  },
  {
    name: 'type',
    kind: vscode.CompletionItemKind.Function,
    detail: 'type(value) -> string',
    doc: 'Returns the type name of the value ("int", "float", "string", "list", "dict", "boolean").',
    snippet: 'type($1)$0'
  },
  {
    name: 'len',
    kind: vscode.CompletionItemKind.Function,
    detail: 'len(collection) -> integer',
    doc: 'Returns the count of items in a list, characters in a string, or keys in a dictionary.',
    snippet: 'len($1)$0'
  },
  {
    name: 'cyber.port_scan',
    kind: vscode.CompletionItemKind.Function,
    detail: 'cyber.port_scan(host, ports) -> list',
    doc: 'Scans target host for open TCP ports.\n\nExample:\n```plain\nimport cyber\nopen_ports = cyber.port_scan("127.0.0.1", [22, 80, 443])\n```',
    snippet: 'cyber.port_scan("${1:127.0.0.1}", [${2:80, 443}])$0'
  },
  {
    name: 'cyber.audit_security_headers',
    kind: vscode.CompletionItemKind.Function,
    detail: 'cyber.audit_security_headers(url) -> dict',
    doc: 'Audits HTTP response headers for security best practices (CSP, HSTS, X-Frame-Options).\n\nReturns an audit dictionary with score and grade.',
    snippet: 'cyber.audit_security_headers("${1:https://example.com}")$0'
  },
  {
    name: 'cyber.cve_lookup',
    kind: vscode.CompletionItemKind.Function,
    detail: 'cyber.cve_lookup(cve_id) -> dict',
    doc: 'Looks up vulnerability details and severity score from offline CVE database.',
    snippet: 'cyber.cve_lookup("${1:CVE-2021-44228}")$0'
  },
  {
    name: 'cyber.detect_sqli',
    kind: vscode.CompletionItemKind.Function,
    detail: 'cyber.detect_sqli(payload) -> boolean',
    doc: 'Checks if input string contains SQL injection attack signatures.',
    snippet: 'cyber.detect_sqli($1)$0'
  },
  {
    name: 'cyber.detect_xss',
    kind: vscode.CompletionItemKind.Function,
    detail: 'cyber.detect_xss(payload) -> boolean',
    doc: 'Checks if input string contains Cross-Site Scripting (XSS) payload signatures.',
    snippet: 'cyber.detect_xss($1)$0'
  },
  {
    name: 'cyber.sanitize_html',
    kind: vscode.CompletionItemKind.Function,
    detail: 'cyber.sanitize_html(raw_html) -> string',
    doc: 'Sanitizes and escapes raw HTML to prevent injection vulnerabilities.',
    snippet: 'cyber.sanitize_html($1)$0'
  },
  {
    name: 'cyber.shannon_entropy',
    kind: vscode.CompletionItemKind.Function,
    detail: 'cyber.shannon_entropy(data) -> float',
    doc: 'Calculates Shannon entropy score (0 to 8) to detect encrypted/packed/obfuscated malware payloads.',
    snippet: 'cyber.shannon_entropy($1)$0'
  },
  {
    name: 'neural_network',
    kind: vscode.CompletionItemKind.Function,
    detail: 'neural_network(layer_sizes) -> model',
    doc: 'Constructs an Artificial Intelligence multi-layer neural network with specified layer dimensions.',
    snippet: 'neural_network([${1:2, 4, 1}])$0'
  },
  {
    name: 'train_ai',
    kind: vscode.CompletionItemKind.Function,
    detail: 'train_ai(model, inputs, targets, epochs)',
    doc: 'Trains a neural network model using forward and backward propagation.',
    snippet: 'train_ai(${1:nn}, ${2:inputs}, ${3:targets}, ${4:100})$0'
  },
  {
    name: 'predict_ai',
    kind: vscode.CompletionItemKind.Function,
    detail: 'predict_ai(model, input_vector) -> list',
    doc: 'Generates inference prediction from a trained neural network model.',
    snippet: 'predict_ai(${1:nn}, ${2:input_vector})$0'
  },
  {
    name: 'web_server',
    kind: vscode.CompletionItemKind.Function,
    detail: 'web_server(port) -> server',
    doc: 'Deploys an instant HTTP web server listening on the specified port.\n\nExample:\n```plain\nsrv = web_server(8080)\n```',
    snippet: 'web_server(${1:8080})$0'
  },
  {
    name: 'read_file',
    kind: vscode.CompletionItemKind.Function,
    detail: 'read_file(path) -> string',
    doc: 'Reads the entire contents of a UTF-8 text file.',
    snippet: 'read_file("${1:path}")$0'
  },
  {
    name: 'write_file',
    kind: vscode.CompletionItemKind.Function,
    detail: 'write_file(path, text)',
    doc: 'Writes text to a file using clean UTF-8 encoding.',
    snippet: 'write_file("${1:path}", "${2:content}")$0'
  },
  {
    name: 'file_exists',
    kind: vscode.CompletionItemKind.Function,
    detail: 'file_exists(path) -> boolean',
    doc: 'Returns true if the given file path exists on disk.',
    snippet: 'file_exists("${1:path}")$0'
  },
  {
    name: 'sum',
    kind: vscode.CompletionItemKind.Function,
    detail: 'sum(list_of_numbers) -> number',
    doc: 'Returns the sum of all numerical values in a list.',
    snippet: 'sum($1)$0'
  },
  {
    name: 'average',
    kind: vscode.CompletionItemKind.Function,
    detail: 'average(list_of_numbers) -> number',
    doc: 'Calculates the arithmetic mean of a list of numbers.',
    snippet: 'average($1)$0'
  },
  {
    name: 'highest',
    kind: vscode.CompletionItemKind.Function,
    detail: 'highest(list_of_numbers) -> number',
    doc: 'Returns the maximum number in a list.',
    snippet: 'highest($1)$0'
  },
  {
    name: 'lowest',
    kind: vscode.CompletionItemKind.Function,
    detail: 'lowest(list_of_numbers) -> number',
    doc: 'Returns the minimum number in a list.',
    snippet: 'lowest($1)$0'
  },
  {
    name: 'round',
    kind: vscode.CompletionItemKind.Function,
    detail: 'round(number, [decimals]) -> number',
    doc: 'Rounds a number to the specified number of decimal places (default 0).',
    snippet: 'round($1)$0'
  },
  {
    name: 'random_between',
    kind: vscode.CompletionItemKind.Function,
    detail: 'random_between(min, max) -> integer',
    doc: 'Generates a random integer between min and max inclusive.',
    snippet: 'random_between(${1:1}, ${2:100})$0'
  }
];

export class PlainCompletionProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {
    const items: vscode.CompletionItem[] = [];

    // 1. Built-in functions, keywords & methods
    for (const doc of BUILTINS_DOCS) {
      const item = new vscode.CompletionItem(doc.name, doc.kind);
      item.detail = doc.detail;
      item.documentation = new vscode.MarkdownString(doc.doc);
      if (doc.snippet) {
        item.insertText = new vscode.SnippetString(doc.snippet);
      }
      items.push(item);
    }

    // 2. Scan active document for user-defined variables and function names
    const text = document.getText();
    const wordPattern = /\b[A-Za-z_][A-Za-z0-9_]*\b/g;
    const seen = new Set<string>();
    BUILTINS_DOCS.forEach(b => seen.add(b.name));

    let match: RegExpExecArray | null;
    while ((match = wordPattern.exec(text)) !== null) {
      const word = match[0];
      if (word.length > 1 && !seen.has(word)) {
        seen.add(word);
        const userItem = new vscode.CompletionItem(word, vscode.CompletionItemKind.Variable);
        userItem.detail = 'Local Symbol';
        items.push(userItem);
      }
    }

    return items;
  }
}
