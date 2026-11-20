# A short language tour

Build the checkout as described in [Getting started](getting-started.md), save a snippet as a `.plain` file, and run it with `node bin/plain.js run your-file.plain`. Examples in this tour use canonical APIs. Features added in this checkout are tracked under [Unreleased](../CHANGELOG.md).

## 1. English and familiar expressions

```plain
set visitor to "Ada"
set points to 10
points += 5
say "Hello, " plus visitor
say "Points: " + points
```

Output:

```text
Hello, Ada
Points: 15
```

`set points to 10` and `points = 10` both assign a value. Keywords and variable/function names are case-insensitive; `Points` would refer to the same variable. Quote text instead of relying on legacy unquoted-value behavior. `#` begins a comment outside a string.

## 2. Decisions and explicit blocks

```plain
score = 85
if score is at least 80 then
    say "Passed"
otherwise
    say "Try again"
end
```

Output: `Passed`.

You can write `if score >= 80:` and `else:` instead. Both styles still require `end`. PLAIN does not infer the end of a block from indentation.

## 3. Lists and dictionaries

```plain
scores = [80, 90, 100]
say item 1 of scores
say scores[0]
say scores[-1]

scores[0] = 85
scores[-1] -= 5
student = {"name": "Ada", "score": 0}
student.score = average(scores)
student["active"] = true
say student.name + ": " + student.score
```

Output:

```text
80
80
100
Ada: 90
```

English item access is **1-based**; brackets are **0-based**. Negative bracket indices count back from the end. Dictionary keys are case-sensitive, unlike variable names. Use `student["display name"]` for a key with a space, and use brackets for keyword-shaped keys.

`add 110 to scores` appends an item, while `remove 90 from scores` removes the first matching value. Indexed assignment updates an existing element, rather than extending a list with gaps. See [example 17](../examples/17_collections.plain).

## 4. Loops, break, and continue

```plain
total = 0
for each number in [1, 2, 3, 4, 5]
    if number == 2 then
        continue
    end
    if number == 5 then
        break
    end
    total += number
end
say total
```

Output: `8`.

`continue` skips the rest of the current iteration; `break` leaves the nearest enclosing loop. These statements must be inside a loop in the current function. `for number in values:` is the Python-style spelling of list iteration.

Counted and conditional loops also use `end`:

```plain
repeat 2 times
    say "Hello"
end

remaining = 2
while remaining > 0:
    remaining -= 1
end
say remaining
```

Output: two `Hello` lines, then `0`. Do not name a loop variable `item`: that is a keyword. Use `entry`, `number`, or a domain-specific name.

## 5. Functions

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

Output:

```text
12
9
```

Both definitions create PLAIN functions. Parenthesized calls are useful when mixing syntax styles. `add_values` is a valid name; `add` is a reserved statement keyword.

## 6. Arithmetic and data helpers

```plain
value = 17
value %= 5
value **= 3
value //= 3
say value

csv_text = "name,score\nAda,80\nLin,100"
table = parse_csv(csv_text)
say average(table_column(table, "score"))
```

Output:

```text
2
90
```

Use `**` for powers and `//` for floor division. Parenthesize mixed operations when porting Python code rather than assuming all Python precedence rules. `parse_csv` works on text in memory; `read_csv` requires filesystem access. The [standard-library catalog](standard-library.md) distinguishes actual names and capabilities.

## 7. Arguments and assertions

Script arguments go after `--`:

```sh
node bin/plain.js run examples/18_script_args.plain -- Ada blue
```

Inside a script, `args()` returns `['Ada', 'blue']` as a list of text values. It does not include the executable or filename.

Use assertions for small repeatable checks:

```plain
assert(2 + 2 == 4)
assert_equal(average([2, 4, 6]), 4)
assert_not_equal("red", "blue")
say "Assertions passed"
```

Save this as `sample.test.plain`, then run:

```sh
node bin/plain.js test sample.test.plain
node bin/plain.js check sample.test.plain --json
node bin/plain.js fmt --check sample.test.plain
```

Testing executes the program. Syntax checking does not execute it, and format checking does not rewrite it. See [example 19](../examples/19_assertions.test.plain) for an existing test file.

## 8. Local modules and capability boundaries

Built-in namespaces can be imported, for example:

```plain
import math
say math.square_root(81)
```

Output: `9`.

For a local module, use `import "./helpers.plain" as helpers` once that file exists. Importing executes its top-level code. This is module loading, not a dependency installer or a promise of Python package compatibility.

Start with the pure examples in the [example guide](../examples/README.md). Interactive input, file writes, subprocesses, and servers need a trusted Node environment and deliberate opt-in. The static browser Worker profile has no Node filesystem, process, environment, or network access.

For neural networks, follow the [dataset and API contract](PLAIN_AI_SPECIFICATION.md): `train_neural_network` needs targets as well as inputs. For changes from older snippets and builds, read the [compatibility notes](compatibility.md).
