# Language reference

This reference describes the current source checkout, including changes listed under [Unreleased](../CHANGELOG.md). For canonical builtin names and aliases, use the generated [standard-library catalog](standard-library.md). PLAIN resembles Python in places but is a distinct language.

## Source, names, and blocks

- Source files normally end in `.plain` and use UTF-8. A leading UTF-8 BOM is tolerated; new files should be saved without one.
- `#` starts a line comment outside a quoted string.
- Use one statement per line. Lists and parenthesized calls can span lines.
- Keywords and variable/function names are case-insensitive: `score` and `Score` name the same variable.
- Text and dictionary keys retain their case. `record["Name"]` and `record["name"]` are different keys.
- Indentation improves readability but does not define scope. `if`, `repeat`, `while`, `for`, and function blocks require `end`, with or without a colon.
- An initial `Set ABC = Main` is not required. It is a legacy assignment convention, not an entry-point declaration. Write string literals with quotes.

Reserved words include `set`, `to`, `say`, `show`, `ask`, `and`, `save`, `as`, `clear`, `screen`, `if`, `then`, `otherwise`, `else`, `repeat`, `times`, `while`, `for`, `each`, `in`, `end`, `give`, `back`, `item`, `of`, `add`, `remove`, `from`, `wait`, `is`, `equal`, `equals`, `not`, `greater`, `less`, `than`, `at`, `least`, `most`, `plus`, `minus`, `divided`, `by`, `remainder`, `or`, `import`, `def`, `fn`, `function`, `return`, `break`, and `continue`. Literal words such as `true`, `false`, `nothing`, and `null` are not variable names either. Prefer `entry` over `item` and `add_values` over `add`.

## Values and assignment

Values include numbers, text, booleans, lists, dictionaries, `nothing`/`null`, and functions. Numbers use the host's floating-point number representation; arbitrary-precision integers are not implied.

```plain
set greeting to "Hello"
score = 12
score += 3
record = {"name": "Ada", "score": score}
scores = [10, 20, 30]
```

Both `set name to expression` and `name = expression` assign values. Compound assignments are `+=`, `-=`, `*=`, `/=`, `%=`, `**=`, and `//=`.

List elements and dictionary entries can be updated:

```plain
scores[0] = 11
scores[-1] += 2
record.score = 16
record["active"] = true
```

Use valid existing list indices; indexed assignment is not an instruction to create sparse arrays. `add value to list` appends a value. `remove value from list` removes the first matching value. Assignment changes the referenced collection; use care when sharing it between variables/functions.

## Indexing

| Form | Meaning |
| --- | --- |
| `item 1 of scores` | First list element, 1-based English access |
| `item_of(1, scores)` | Canonical function form of English access |
| `scores[0]` | First list element, 0-based bracket access |
| `scores[-1]` | Last list element; negative indices count backward |
| `record.name` | Dictionary property named `name` |
| `record["display name"]` | Dictionary key containing spaces |

Do not apply the English 1-based rule to brackets. Do not assume every builtin that accepts an index uses the same convention; consult its catalog entry. Use brackets for dictionary keys that are keywords or contain punctuation.

## Operators

| Operation | Symbol | English spelling |
| --- | --- | --- |
| Addition / text concatenation | `+` | `plus` |
| Subtraction | `-` | `minus` |
| Multiplication | `*` | `times` |
| Division | `/` | `divided by` |
| Remainder | `%` | `remainder of` |
| Power | `**` | Use the symbol or `power(base, exponent)` |
| Floor division | `//` | Use the symbol |
| Equality | `==` | `is equal to`, `is` |
| Inequality | `!=` | `is not equal to`, `is not` |
| Greater / less | `>`, `<` | `is greater than`, `is less than` |
| At least / at most | `>=`, `<=` | `is at least`, `is at most` |
| Boolean logic | `and`, `or`, `not` | Same spelling |

Use parentheses to make mixed arithmetic unambiguous, especially when porting Python expressions involving powers or unary minus. Python's complete precedence and coercion behavior is not a compatibility promise. `=` assigns; use `==` for comparison in new code.

## Statements and control flow

```plain
say "A line of output"
show "Another value"

set score to 85
if score is at least 90 then
    say "A"
otherwise if score >= 80:
    say "B"
otherwise
    say "Keep practicing"
end
```

`else` is a spelling of `otherwise`. A colon or `then` is optional where the grammar accepts a block header, but never replaces its closing `end`.

```plain
repeat 2 times
    say "Hello"
end

remaining = 3
while remaining > 0:
    remaining -= 1
end

for each entry in [1, 2, 3, 4]
    if entry == 2 then
        continue
    end
    if entry == 4 then
        break
    end
    say entry
end
```

`repeat while condition` is another while-loop form. `for entry in values:` is the Python-style form of `for each`. `break` exits the nearest enclosing loop; `continue` skips to its next iteration. They are not valid outside a loop or a way to escape a loop in a caller's function.

Interactive Node programs can ask for input:

```plain
ask "Your name?" and save as visitor
say "Hello, " plus visitor
```

Input is text; use `to_number` when a numeric value is required. `clear screen` clears terminal output; `wait seconds` pauses execution. Interactive and timing operations are not suitable for deterministic smoke examples.

## Functions

```plain
to double_value number
    give back number times 2
end

def add_values(left, right):
    return left + right
end

say double_value(6)
say add_values(4, 5)
```

`function` and `fn` are aliases of `def`. Parenthesized calls with comma-separated arguments are the clearest form for new examples. `give back` and `return` return from the current function. A `def` block still requires `end`.

## Imports

Node supports selected built-in namespaces and local `.plain` source modules:

```plain
import math
say math.square_root(81)
```

For a local module, use a quoted path and, when needed, an alias: `import "./helpers.plain" as helpers`. The file must exist; importing it executes its top-level code. Module loading is not package installation. PLAIN does not promise Python package compatibility or a hosted registry. Browser-profile imports are limited to the modules/capabilities it exposes, not local filesystem paths.

## Script arguments and tests

`args()` returns the arguments supplied after the CLI's `--` separator, as a list of text values. It does not include the interpreter or script path.

```plain
script_args = args()
say count(script_args)
assert(2 + 2 == 4)
assert_equal(average([2, 4, 6]), 4)
assert_not_equal("red", "blue")
```

Use `plain test file.test.plain` to run a test script. Assertions raise an error on failure. `plain check file.plain --json` only parses; unresolved runtime names, I/O errors, and failed assertions require execution to discover.

## Builtins and capability profiles

Canonical examples include `uppercase(text)`, `to_number(value)`, `average(values)`, `parse_csv(text)`, `table_column(table, name)`, and `create_neural_network(layers, activation)`. Use [standard-library.md](standard-library.md) for actual registrations rather than inferring APIs from Python or old marketing pages.

The Node profile includes host-capable APIs such as filesystem, shell, network, and updater functions. The static browser Worker exposes only its pure profile. A builtin existing in Node does not imply it is available in the browser. Read [SECURITY.md](../SECURITY.md) and the [compatibility notes](compatibility.md) before moving programs between profiles.
