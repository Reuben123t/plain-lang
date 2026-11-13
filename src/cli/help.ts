export function getHelp(topic?: string): string {
  const t = (topic || "").trim().toLowerCase();

  if (t === "variables" || t === "set") {
    return `
=== PLAIN: Variables ===
To create or update a variable, use standard symbols:
    Set ABC = Main
    x = 100
    score = score + 5

Examples:
    Set ABC = Main
    name = "Alex"
    age = 15
    is_ready = true
    scores = [85, 92, 78]
    total = 10 * 5 + 2

Rules:
- Names can use letters, numbers, and underscores (e.g. total_score).
- Use '=' for assignment, with '+', '-', '*', '/' for math operations.
`;
  }

  if (t === "conditions" || t === "if") {
    return `
=== PLAIN: Conditions (If Statements) ===
Make decisions using standard symbols:

    if score >= 90 then
        say "A"
    otherwise if score >= 80 then
        say "B"
    otherwise
        say "Pass"
    end

Comparisons (Standard Symbols):
    ==   Equal to
    !=   Not equal to
    >    Greater than
    <    Less than
    >=   At least / Greater or equal
    <=   At most / Less or equal

Logical operators:
    and, or, not
`;
  }

  if (t === "loops" || t === "repeat" || t === "for" || t === "while") {
    return `
=== PLAIN: Loops (Repeating Actions) ===

1. While loop with symbols:
    count = 3
    while count > 0
        say count
        count = count - 1
    end

2. Repeat a set number of times:
    repeat 3 times
        say "Hello!"
    end

3. For each item in a list:
    for each fruit in ["apple", "banana", "cherry"]
        say fruit
    end
`;
  }

  if (t === "functions" || t === "def" || t === "to") {
    return `
=== PLAIN: Functions ===
Define custom actions with Pythonic or English syntax:

    def greet(person):
        say "Hello " + person
    end

    greet("Alex")

Functions that return a value:
    def add(a, b):
        return a + b
    end

    result = add(4, 6)
    say result
`;
  }

  if (t === "cyber" || t === "security" || t === "cybersecurity") {
    return `
=== PLAIN: Cybersecurity & Penetration Testing ===
PLAIN includes built-in reconnaissance, cryptanalysis, and threat intelligence:

Network Recon:
    info = port_scan("127.0.0.1", [80, 443, 8080])
    is_open = is_port_open("127.0.0.1", 80)
    banner = banner_grab("scanme.nmap.org", 22)
    dns = dns_resolve("google.com", "A")
    sub = subnet_calculator("192.168.1.0/24")

Web Security & Pentesting:
    report = audit_security_headers("https://example.com")
    sqli = detect_sql_injection(user_input)
    xss = detect_xss(user_input)
    pwd = check_password_strength("MyP@ssw0rd123!")

Threat Intelligence & Forensics:
    cve = cve_lookup("CVE-2021-44228")
    entropy = calculate_entropy(file_bytes)
    sig = detect_file_signature("4D5A")
`;
  }

  if (t === "lists" || t === "list") {
    return `
=== PLAIN: Lists ===
Lists hold multiple items:

    colors = ["red", "green", "blue"]

Accessing items (PLAIN uses 1-based indexing):
    say first(colors)          # "red"
    say last(colors)           # "blue"
    say colors[1]              # 1-based or 0-based supported
    say item 2 of colors       # "green"

Modifying lists:
    add "yellow" to colors
    remove "green" from colors

Math with lists:
    scores = [80, 95, 70, 100]
    say count(scores)          # 4
    say average(scores)        # 86.25
    say highest(scores)        # 100
    say lowest(scores)         # 70
    say sum(scores)            # 345
`;
  }

  // General overview
  return `
========================================================================
                      PLAIN Programming Language
           Pythonic • Cybersecurity • Built-In AI & IDE
                         Author: Reuben
========================================================================
PLAIN is designed to be the simplest, most powerful programming language.
Supports symbols (+, -, *, /, =), 1,250+ functions, AI, and Cybersecurity.

COMMANDS:
  plain <file.plain>         Run a .plain script
  plain run <file.plain>     Run a .plain script
  plain ide [file.plain]     Launch the PLAIN IDE (Python IDLE Equivalent)
  plain scan <host> [ports]  Run fast multi-port scanner for network recon
  plain audit <url>          Audit website security headers (CSP, HSTS, etc.)
  plain hash <file>          Print MD5, SHA-1, SHA-256 of any file
  plain cve <cve_id>         Inspect CVE threat database vulnerability info
  plain setup                Interactive setup wizard & permissions configurator
  plain doctor               Run diagnostics and auto-repair any errors
  plain update               Check for software updates and upgrade
  plain deploy [port]        Deploy a live network web server accessible via IP
  plain repl                 Start the interactive shell
  plain uninstall            Cleanly uninstall PLAIN and remove shortcuts
  plain check <file.plain>   Check syntax without executing
  plain help <topic>         Detailed help (topics: variables, conditions,
                             loops, functions, cyber, lists)

SYNTAX STYLES:
  Set ABC = Main                       Variable assignment
  x = 100                              Direct symbol assignment
  x += 5,  x -= 2,  x *= 3,  x /= 2    Compound operator symbols
  x ** 2,  10 // 3,  17 % 5            Power, floor division, modulo
  x = (10 + 5) * 2 - 4 / 2             Standard arithmetic with symbols
  def greet(name): return "Hi " + name end  Function definition
  import "math_tools.plain" as math    Import local or virtual packages
  user = { "name": "Reuben", "age": 20 } Dictionary syntax
  deploy_server(8080)                  Deploy web server on 0.0.0.0
  train_neural_network(net, data)      AI deep neural network training
  port_scan("127.0.0.1")               Cybersecurity TCP port reconnaissance
  audit_security_headers(url)          HTTP security header vulnerability check

FILE EXTENSION:
  Save your code in files ending with .plain
========================================================================
`;
}

