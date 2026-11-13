"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelp = getHelp;
function getHelp(topic) {
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
                 Super Simple • 1,200+ Functions • Pythonic
                         Author: Reuben
========================================================================
PLAIN is designed to be the simplest, most powerful programming language.
Supports both English and Pythonic syntax with 1,200+ built-in functions.

COMMANDS:
  plain <file.plain>         Run a .plain script
  plain run <file.plain>     Run a .plain script
  plain deploy [port]        Deploy a live network web server accessible via IP
  plain update               Check for software updates and upgrade
  plain check <file.plain>   Check syntax without executing
  plain repl                 Start the interactive shell
  plain playground           Launch the visual web playground
  plain help <topic>         Detailed help (topics: variables, conditions,
                             loops, functions, lists)

SYNTAX STYLES:
  x = 100                              Python-style assignment
  set x to 100                         English assignment
  x += 5                               Compound assignment (+=, -=, *=, /=)
  x ** 2,  10 // 3                     Power and floor division
  def greet(name): say "Hi " + name end  Function definition
  import "math_tools.plain" as math    Import local or virtual packages
  user = { "name": "Reuben", "age": 20 } Dictionary syntax
  deploy_server(8080)                  Deploy web server on 0.0.0.0
  train_neural_network(net, data)      AI deep neural network training

FILE EXTENSION:
  Save your code in files ending with .plain
========================================================================
`;
}
//# sourceMappingURL=help.js.map