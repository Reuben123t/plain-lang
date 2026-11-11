export function getHelp(topic?: string): string {
  const t = (topic || "").trim().toLowerCase();

  if (t === "variables" || t === "set") {
    return `
=== PLAIN: Variables ===
To create or update a variable, use:
    set <name> to <value>

Examples:
    set name to "Alex"
    set age to 15
    set is_ready to true
    set scores to [85, 92, 78]

Rules:
- Names can use letters, numbers, and underscores (e.g. total_score).
- Names cannot start with a number.
`;
  }

  if (t === "conditions" || t === "if") {
    return `
=== PLAIN: Conditions (If Statements) ===
Make decisions in your code:

    if <condition> then
        ...
    otherwise if <another_condition> then
        ...
    otherwise
        ...
    end

Comparisons:
    is equal to      (or ==)
    is not equal to  (or !=)
    is greater than  (or >)
    is less than     (or <)
    is at least      (or >=)
    is at most       (or <=)

Logical words:
    and, or, not
`;
  }

  if (t === "loops" || t === "repeat" || t === "for") {
    return `
=== PLAIN: Loops (Repeating Actions) ===

1. Repeat a set number of times:
    repeat 3 times
        say "Hello!"
    end

2. Repeat while a condition is true:
    set count to 3
    repeat while count is greater than 0
        say count
        set count to count minus 1
    end

3. For each item in a list:
    for each fruit in ["apple", "banana", "cherry"]
        say fruit
    end
`;
  }

  if (t === "functions" || t === "to") {
    return `
=== PLAIN: Functions ===
Define custom actions:

    to greet person
        say "Hello " plus person
    end

    greet "Alex"

Functions that return a value:
    to add first and second
        give back first plus second
    end

    set result to add 4 and 6
    say result
`;
  }

  if (t === "lists" || t === "list") {
    return `
=== PLAIN: Lists ===
Lists hold multiple items:

    set colors to ["red", "green", "blue"]

Accessing items (PLAIN uses 1-based indexing):
    say first(colors)          # "red"
    say last(colors)           # "blue"
    say item 2 of colors       # "green"

Modifying lists:
    add "yellow" to colors
    remove "green" from colors

Math with lists:
    set scores to [80, 95, 70, 100]
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
========================================================================
PLAIN is designed to be the simplest, most readable programming language.
Code reads like everyday English instructions.

COMMANDS:
  plain <file.plain>         Run a .plain script
  plain run <file.plain>     Run a .plain script
  plain check <file.plain>   Check syntax without executing
  plain repl                 Start the interactive shell
  plain playground           Launch the visual web playground
  plain help <topic>         Detailed help (topics: variables, conditions,
                             loops, functions, lists)

BASIC SYNTAX:
  say "Hello, world!"                  Output text
  set score to 100                     Save a variable
  ask "Name?" and save as user         Get input from user
  10 plus 5 times 2                    Math (+, -, *, /, remainder of)
  item 1 of scores                     1-based list access
  repeat 3 times ... end               Repeat loop
  if age is at least 18 then ... end   Conditionals
  to greet person ... end              Custom functions

FILE EXTENSION:
  Save your code in files ending with .plain
========================================================================
`;
}
