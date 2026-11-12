# Getting Started with PLAIN

Welcome to **PLAIN**, a programming language designed to read and feel like clear, everyday English instructions.

Whether you have never written a line of code in your life or you want a language that anyone on your team can read at a glance, this guide will get you up and running in under five minutes.

---

## 1. Installation

### Option 1: Standalone Windows Executable (`plain.exe`) — No Setup Required!
Download and run directly without installing Node.js or npm:
- [**Download plain.exe**](https://github.com/Reuben123t/plain-lang/releases/download/v1.0.0/plain.exe)
- [**Download plain-windows-x64.zip**](https://github.com/Reuben123t/plain-lang/releases/download/v1.0.0/plain-windows-x64.zip)

Or download via terminal:
```powershell
curl.exe -fSLo plain.exe https://github.com/Reuben123t/plain-lang/releases/download/v1.0.0/plain.exe
.\plain.exe
```

### Option 2: Automatic 1-Line Terminal Install (Recommended)

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/Reuben123t/plain-lang/main/install.ps1 | iex
```

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/Reuben123t/plain-lang/main/install.sh | bash
```

**Universal via NPM:**
```bash
npm install -g https://github.com/Reuben123t/plain-lang/archive/refs/heads/main.tar.gz
```

### Option 3: Clone & Build Manually from GitHub
```bash
git clone https://github.com/Reuben123t/plain-lang.git
cd plain-lang
npm install
npm run build
npm link
```
Now the `plain` command is available everywhere in your terminal!

### Option C: Run Directly with NPX (No installation required)
```bash
npx plain-lang run my_program.plain
```

---

## 2. Your Very First Program

1. Create a file named `hello.plain`:
```plain
say "Hello, world!"
```

2. Run it in your terminal:
```bash
plain hello.plain
```

You should see:
```text
Hello, world!
```

---

## 3. Interactive REPL

Want to try instructions one line at a time? Start the interactive shell:
```bash
plain repl
```
Or simply:
```bash
plain
```

You will see:
```text
plain> set name to "Alex"
plain> say "Welcome, " plus name
Welcome, Alex
plain> 10 plus 25 times 2
=> 60
plain> exit
```

---

## 4. Visual Web Playground

If you prefer a visual code editor with a built-in terminal:
```bash
plain playground
```
This starts a local web server at `http://localhost:3000` where you can write code, select preset examples, and run programs in your web browser.

---

## 5. Core Concepts in 3 Minutes

### Variables
Store information using `set <name> to <value>`:
```plain
set username to "Sam"
set score to 100
set is_active to true
```

### Asking the User for Input
```plain
ask "What is your name?" and save as name
say "Nice to meet you, " plus name
```

### Conditions (Making Decisions)
```plain
set age to 16

if age is at least 18 then
    say "You are an adult."
otherwise if age is at least 13 then
    say "You are a teenager."
otherwise
    say "You are a child."
end
```

### Repeating Things (Loops)
```plain
# Repeat a set number of times
repeat 3 times
    say "Hip hip hooray!"
end

# Repeat while something is true
set countdown to 3
repeat while countdown is greater than 0
    say countdown
    set countdown to countdown minus 1
end
say "Blast off!"
```

### Lists of Items
```plain
set fruits to ["apple", "banana", "cherry"]

# 1-based indexing: item 1 is the first item
say "First fruit: " plus first(fruits)
say "Second fruit: " plus item 2 of fruits

add "date" to fruits
remove "banana" from fruits

for each fruit in fruits
    say "- " plus fruit
end
```

### Custom Functions
```plain
to double number
    give back number times 2
end

to add first and second
    give back first plus second
end

say double 10
say add 4 and 6
```

---

## 6. Helpful Error Messages

When something goes wrong, PLAIN does not give you cryptic computer jargon. It points out what happened and tells you how to fix it:

```text
Error at line 4, column 12:
   4 | set total to first divided by 0
                          ^

Cannot divide by zero.

Suggestion: Make sure the number you are dividing by is not 0.
```

---

## 7. VS Code Extension

For colorful syntax highlighting in Visual Studio Code, check the `editors/vscode` directory. Copy the folder to `~/.vscode/extensions/plain-language-support` and enjoy beautiful syntax highlighting for all `.plain` files!

