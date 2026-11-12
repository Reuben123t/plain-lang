# PLAIN — The Simple, English-Like Programming Language

> **Programming should be as simple as writing instructions in everyday English.**

**PLAIN** is a beginner-friendly interpreted programming language designed so that anyone can read and write code without memorizing strange punctuation, cryptic symbols, or confusing terminology.

It comes with its own `.plain` file extension, an interactive shell (REPL), an in-browser visual playground, full standard library, friendly error messages, and a Visual Studio Code extension.

---

## What Does PLAIN Look Like?

A complete, working program in PLAIN:

```plain
say "Hello, world!"

set name to "Alex"
set age to 16

say "Welcome, " plus name

if age is at least 18 then
    say "You are an adult."
otherwise
    say "You are under 18."
end

repeat 3 times
    say "Learning PLAIN is fun!"
end
```

No semicolons. No curly braces. Just clear English instructions.

---

## Quick Installation & Downloading

### 💻 Standalone Windows Executable (`plain.exe`) — No Setup Required!
You can download and run PLAIN as a standalone `.exe` without installing Node.js, npm, or any other tools:

1. **Direct Download**:
   - [**Download plain.exe (Direct)**](https://github.com/Reuben123t/plain-lang/releases/download/v1.0.0/plain.exe)
   - [**Download plain-windows-x64.zip**](https://github.com/Reuben123t/plain-lang/releases/download/v1.0.0/plain-windows-x64.zip)

2. **Or Download in Terminal (PowerShell)**:
   ```powershell
   curl.exe -fSLo plain.exe https://github.com/Reuben123t/plain-lang/releases/download/v1.0.0/plain.exe
   .\plain.exe
   ```

*Double-click `plain.exe` to launch the interactive English REPL, or run `plain.exe my_script.plain` from the command prompt!*

---

### 🚀 Automatic 1-Line Terminal Install (Recommended)

Paste this into your terminal to automatically download, build, and install PLAIN:

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Reuben123t/plain-lang/main/install.ps1 | iex
```

**macOS / Linux (Bash / Curl):**
```bash
curl -fsSL https://raw.githubusercontent.com/Reuben123t/plain-lang/main/install.sh | bash
```

**Universal via NPM:**
```bash
npm install -g https://github.com/Reuben123t/plain-lang/archive/refs/heads/main.tar.gz
```

---

### Manual Download and Install from GitHub
```bash
# Clone the repository
git clone https://github.com/Reuben123t/plain-lang.git

# Enter the directory
cd plain-lang

# Install dependencies and build
npm install
npm run build

# Link globally so you can use 'plain' anywhere
npm link
```

### Run Instantly with NPX (Zero Install)
```bash
npx plain-lang run my_program.plain
```

---

## How to Use the `plain` Command

| Command | What It Does |
|---|---|
| `plain <filename.plain>` | Run a `.plain` script |
| `plain run <filename.plain>` | Run a `.plain` script |
| `plain repl` (or just `plain`) | Start the interactive English shell |
| `plain playground` | Launch the visual web code playground in your browser |
| `plain check <filename.plain>` | Check syntax for errors without running |
| `plain help` | Open the quick reference manual |

---

## Web Playground (Code in Your Browser)

Don't want to use the terminal? Launch the built-in web playground:

```bash
plain playground
```

Open your browser at `http://localhost:3000`. You get a visual code editor with preset examples, a "Run Program" button, and an output console!

---

## Editor Extension (.plain Syntax Highlighting)

PLAIN comes with its own official VS Code extension located in `editors/vscode/`.

### Installing into Visual Studio Code:
1. Copy the `editors/vscode` folder into your VS Code extensions folder:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\plain-language-support`
   - **macOS / Linux**: `~/.vscode/extensions/plain-language-support`
2. Restart VS Code.
3. Every file ending in `.plain` will now have syntax highlighting, bracket matching, and auto-closing quotes!

---

## Language Features at a Glance

### 1. Variables
```plain
set player_name to "Sam"
set points to 100
set is_winner to true
```

### 2. Output & Input
```plain
say "Welcome to the game!"
ask "What is your guess?" and save as guess
say "You guessed: " plus guess
```

### 3. Math in Simple English
```plain
set total to 10 plus 5
set difference to 20 minus 8
set area to 4 times 6
set share to 20 divided by 4
set remainder to 17 remainder of 5
```

### 4. Decisions (If / Otherwise)
```plain
if score is at least 90 then
    say "Grade: A"
otherwise if score is at least 80 then
    say "Grade: B"
otherwise
    say "Keep practicing!"
end
```

Supported comparisons:
- `is equal to`
- `is not equal to`
- `is greater than`
- `is less than`
- `is at least`
- `is at most`

### 5. Repetition (Loops)
```plain
# Repeat N times
repeat 3 times
    say "Hip hip hooray!"
end

# Repeat while a condition is true
set countdown to 3
repeat while countdown is greater than 0
    say countdown
    set countdown to countdown minus 1
end

# For each item in a list
set colors to ["red", "green", "blue"]
for each color in colors
    say color
end
```

### 6. Lists with 1-Based Indexing
In everyday life, the first item is item 1. PLAIN respects that:

```plain
set scores to [80, 95, 72, 88]

say "First item: " plus first(scores)       # 80
say "Second item: " plus item 2 of scores    # 95
say "Total items: " plus count(scores)       # 4
say "Highest score: " plus highest(scores)   # 95
say "Average score: " plus average(scores)   # 83.75

add 100 to scores
remove 72 from scores
```

### 7. Custom Functions
```plain
to double number
    give back number times 2
end

to add first and second
    give back first plus second
end

say double 12
set result to add 4 and 6
say result
```

### 8. Text & Math Built-Ins
- **Text**: `uppercase("hello")`, `lowercase("WORLD")`, `length("text")`, `contains("hello", "ell")`, `replace("cat", "c", "b")`, `trim("  hi  ")`, `starts with("plain", "pl")`, `ends with("plain", "in")`
- **Math**: `round(4.6)`, `floor(4.9)`, `ceiling(4.1)`, `absolute(-8)`, `minimum(3, 8, 2)`, `maximum(3, 8, 2)`, `random between(1, 10)`, `to number("42")`, `to text(42)`
- **Date & Time**: `today()`, `current time()`, `days between("2026-01-01", "2026-01-10")`, `wait 2`
- **Safe File I/O**: `read file("notes.txt")`, `write file("output.txt", "hello")`, `file exists("notes.txt")`

---

## Beginner-Friendly Error Messages

PLAIN never confuses you with cryptic stack traces or strange compiler errors. When an issue occurs, PLAIN explains it like a teacher:

```text
Error at line 4, column 12:
   4 | set total to first divided by 0
                          ^

Cannot divide by zero.

Suggestion: Make sure the number you are dividing by is not 0.
```

If you misspell a variable name:
```text
Error at line 2, column 5:
   2 | say usename
           ^

I couldn't find a variable or function named 'usename'.

Suggestion: Did you mean 'username'?
```

---

## Example Programs

Check the `examples/` directory for ready-to-run scripts:
- `examples/01_hello.plain` — Hello World
- `examples/02_calculator.plain` — Calculator
- `examples/03_age_check.plain` — User input & conditionals
- `examples/04_custom_function.plain` — Functions
- `examples/05_list_average.plain` — Lists and averages
- `examples/06_guessing_game.plain` — Number guessing game
- `examples/07_todo_list.plain` — Task manager
- `examples/08_files_and_time.plain` — Working with files and dates

Run any of them with:
```bash
plain examples/01_hello.plain
```

---

## Running the Automated Test Suite

PLAIN comes with a complete unit test suite covering lexing, parsing, execution, built-in functions, and edge cases:

```bash
npm test
```

---

## Documentation

- [Getting Started Guide](docs/getting-started.md)
- [Language Reference & Keywords](docs/language-reference.md)
- [VS Code Extension Setup](editors/vscode/README.md)

---

## License

MIT License. Free for education, personal, and commercial use.

