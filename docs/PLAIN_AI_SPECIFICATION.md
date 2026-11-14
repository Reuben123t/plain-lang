# PLAIN Language Specification & Context for AI Models

## Overview
**PLAIN** (`.plain`) is a modern, clean, expressive programming language designed for clarity, rapid scripting, AI deep learning workflows, cybersecurity, network servers, and data science. It supports both Pythonic indentation/colon syntax and classic readable English keyword blocks.

---

## 1. Core Syntax & Statements

### Entry Declaration
Every standard PLAIN application or main module starts with:
```plain
Set ABC = Main
```
* Assigns the entry symbol `Main` to variable `ABC`.
* Establishes the primary runtime context.

### Variables & Assignment
Standard assignments support standard math operators and Python-style shorthand:
```plain
x = 100
y = 25
total = (x + y) * 2 - 5 / 2
power = 2 ** 8
floor_div = 17 // 3
mod = 10 % 3
x += 5
```

### Printing / Output
```plain
say "Hello from PLAIN!"
say "Result: " + str((x + y) * 2)
```

---

## 2. Type System & Built-in Conversions
PLAIN provides standard Python-compatible type wrappers:
* `str(val)`: Converts any type (number, boolean, list, dict) to string.
* `int(val)`: Converts float or string to integer.
* `float(val)`: Converts integer or string to float.
* `bool(val)`: Converts value to boolean (`true` / `false`).
* `type(val)`: Returns the type name (`"int"`, `"float"`, `"string"`, `"list"`, `"dict"`, `"boolean"`).
* `len(val)`: Returns length of string, list, or dict.

---

## 3. Control Flow & Loops

### If-Else Statements
```plain
if score >= 90
    say "Grade: A"
otherwise
    say "Grade: Needs improvement"
end
```
*Python-style syntax with colons is also supported:*
```plain
if score >= 90:
    say "Grade: A"
else:
    say "Grade: B"
```

### Loops
**Repeat N times:**
```plain
repeat 5 times
    say "Counting..."
end
```

**For Each Loop:**
```plain
numbers = [10, 20, 30]
for each item in numbers
    say "Item: " + str(item)
end
```

**While Loop:**
```plain
count = 0
while count < 5:
    say "Step: " + str(count)
    count += 1
```

---

## 4. Functions & Procedures

### Python Style (`def`):
```plain
def calculate_area(width, height):
    return width * height

area = calculate_area(10, 20)
say "Area: " + str(area)
```

### Classic PLAIN Style (`function` / `end`):
```plain
function add_numbers(a, b)
    give back a + b
end
```

---

## 5. Cybersecurity Engine (`import cyber`)
PLAIN has an extensive offline security audit & threat intelligence engine:

```plain
import cyber

# 1. Port Scanning
open_ports = cyber.port_scan("127.0.0.1", [21, 22, 80, 443, 8080])
say "Open Ports: " + str(open_ports)

# 2. Security Headers Audit
audit = cyber.audit_security_headers("https://google.com")
say "Score: " + str(audit.score) + "/100 (Grade: " + audit.grade + ")"

# 3. CVE Threat Intelligence
cve = cyber.cve_lookup("CVE-2021-44228")
say "Threat: " + cve.id + " -> " + cve.severity

# 4. Web Application Security
has_sqli = cyber.detect_sqli("SELECT * FROM users WHERE '1'='1'")
has_xss = cyber.detect_xss("<script>alert(1)</script>")
clean_html = cyber.sanitize_html("<img src=x onerror=alert(1)>")

# 5. Cryptography & Entropy Analysis
entropy = cyber.shannon_entropy("random_packed_data_here")
file_type = cyber.file_signature(buffer)
subnet = cyber.ipv4_subnet("192.168.1.15/24")
```

---

## 6. Artificial Intelligence & Neural Networks
PLAIN includes a built-in multi-layer perceptron neural network library with backpropagation:

```plain
# Initialize Neural Network: 2 input neurons, 4 hidden neurons, 1 output neuron
nn = neural_network([2, 4, 1])

# Training Data (XOR Problem)
inputs = [[0, 0], [0, 1], [1, 0], [1, 1]]
targets = [[0], [1], [1], [0]]

# Train Model for 500 epochs
train_ai(nn, inputs, targets, 500)

# Inference
prediction = predict_ai(nn, [1, 0])
say "AI Prediction: " + str(prediction)
```

---

## 7. Web Servers & Network Deployment
```plain
# Instant HTTP Web Server on port 8080
server = web_server(8080)
say "PLAIN Web Server active on port 8080"
```

---

## 8. File I/O & Diagnostics
* All files are encoded strictly as **UTF-8 without BOM**.
* Lexer automatically ignores any stray `\uFEFF` BOM.
* Read / write functions:
```plain
content = read_file("dataset.csv")
write_file("output.txt", "Processed data")
exists = file_exists("output.txt")
```

---

## 9. Tooling Ecosystem
1. **CLI**: `plain <file.plain>`, `plain doctor`, `plain ide`.
2. **Desktop IDE**: `plain-ide.exe` (VS Code-style Dark Modern editor, multi-tab, line gutter, docked terminal, IntelliSense autocomplete).
3. **VS Code Extension**: `plain-lang.plain-language-support` (`.vsix`) with syntax grammar, snippets, diagnostics, and title bar run button.
