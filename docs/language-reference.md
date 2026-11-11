# PLAIN Language Specification & Function Reference

A comprehensive reference for keywords, grammar, operators, and built-in functions in the PLAIN programming language.

---

## 1. Syntax & Keywords

| Keyword / Phrase | Purpose | Example |
|---|---|---|
| `set <var> to <val>` | Declare or update a variable | `set points to 100` |
| `say <val>` | Print value with a newline | `say "Hello"` |
| `show <val>` | Display a value | `show total` |
| `ask <prompt> and save as <var>` | Prompt user for text input | `ask "Name?" and save as name` |
| `clear screen` | Clear the terminal display | `clear screen` |
| `if <cond> then ... end` | Conditional branching | `if x > 5 then say "yes" end` |
| `otherwise if <cond> then` | Alternative branch | `otherwise if x == 5 then ...` |
| `otherwise` | Default fallback branch | `otherwise say "no"` |
| `repeat <N> times ... end` | Counted repetition loop | `repeat 5 times say "hi" end` |
| `repeat while <cond> ... end` | Conditional while loop | `repeat while lives > 0 ... end` |
| `for each <item> in <list> ... end` | List iteration loop | `for each x in [1, 2, 3] say x end` |
| `to <name> ... end` | Define a function | `to double x give back x * 2 end` |
| `give back <val>` | Return a value from a function | `give back result` |
| `add <val> to <list>` | Append item to a list | `add 90 to scores` |
| `remove <val> from <list>` | Remove first match from list | `remove "red" from colors` |
| `item <N> of <list>` | 1-based item access | `say item 2 of colors` |
| `wait <sec>` | Pause execution | `wait 2` |
| `# <comment>` | Single-line comment | `# This is ignored` |

---

## 2. Types

PLAIN features five intuitive data types:

1. **Number**: Integers and decimals (`42`, `3.14`, `-10`).
2. **Text**: Strings enclosed in double or single quotes (`"Hello"`, `'world'`).
3. **Boolean**: `true` or `false`.
4. **List**: Ordered collection enclosed in brackets (`[80, 95, 72]`). 1-based indexing in plain English (`item 1 of list`).
5. **Nothing**: Empty/null value (`nothing` or `null`).

---

## 3. Operators & English Equivalents

### Arithmetic
| Operation | Operator | English Word | Example |
|---|---|---|---|
| Addition / Concat | `+` | `plus` | `10 plus 5` or `"Hello " plus name` |
| Subtraction | `-` | `minus` | `20 minus 8` |
| Multiplication | `*` | `times` | `4 times 6` |
| Division | `/` | `divided by` | `20 divided by 4` |
| Remainder (Modulo) | `%` | `remainder of` | `17 remainder of 5` |

### Comparisons
| Comparison | Symbol | English Phrase |
|---|---|---|
| Equal to | `==` | `is equal to` or `is` |
| Not equal to | `!=` | `is not equal to` or `is not` |
| Greater than | `>` | `is greater than` |
| Less than | `<` | `is less than` |
| Greater than or equal | `>=` | `is at least` |
| Less than or equal | `<=` | `is at most` |

### Logic
- `and`: Logical conjunction (`a and b`)
- `or`: Logical disjunction (`a or b`)
- `not`: Logical negation (`not is_ready`)

---

## 4. Built-in Function Reference

### A. Output & Input
- `say(VALUE)`: Print value with newline.
- `show(VALUE)`: Display value.
- `ask(PROMPT)`: Ask user for text input.
- `clear_screen()`: Clear terminal.

### B. Text Functions
- `join(A, B, ...)`: Joins multiple text items into one string.
- `uppercase(TEXT)`: Converts text to uppercase (`uppercase("hi")` → `"HI"`).
- `lowercase(TEXT)`: Converts text to lowercase (`lowercase("HI")` → `"hi"`).
- `length(VALUE)`: Number of characters in text or items in a list.
- `contains(TEXT, PART)`: Check if text contains a substring (or list contains item).
- `replace(TEXT, OLD, NEW)`: Replaces occurrences of `OLD` with `NEW`.
- `trim(TEXT)`: Removes whitespace at start and end.
- `starts_with(TEXT, PART)` / `starts with(A, B)`: Checks beginning.
- `ends_with(TEXT, PART)` / `ends with(A, B)`: Checks end.

### C. Number Functions
- `to_number(VALUE)` / `to number(VALUE)`: Converts text or boolean to number.
- `to_text(VALUE)` / `to text(VALUE)`: Converts value to text.
- `round(NUMBER)`: Rounds to nearest integer (`round(4.6)` → `5`).
- `floor(NUMBER)`: Rounds down (`floor(4.9)` → `4`).
- `ceiling(NUMBER)`: Rounds up (`ceiling(4.1)` → `5`).
- `absolute(NUMBER)`: Magnitude (`absolute(-8)` → `8`).
- `minimum(A, B, ...)`: Smallest number.
- `maximum(A, B, ...)`: Largest number.
- `random_between(A, B)` / `random between(A, B)`: Random whole number between A and B inclusive.

### D. List Functions
- `count(LIST)`: Number of items in list.
- `first(LIST)`: Returns first item.
- `last(LIST)`: Returns last item.
- `item_of(INDEX, LIST)` / `item N of LIST`: Returns item at 1-based index N.
- `sort(LIST)`: Returns ascending sorted list.
- `reverse(LIST)`: Returns reversed list.
- `sum(LIST)`: Sum of all numbers in list.
- `average(LIST)`: Arithmetic mean.
- `highest(LIST)`: Largest numeric item.
- `lowest(LIST)`: Smallest numeric item.

### E. Date & Time Functions
- `today()`: Returns current date as `"YYYY-MM-DD"`.
- `current_time()`: Returns current time as `"HH:MM:SS"`.
- `days_between(DATE1, DATE2)`: Number of days between two dates.
- `wait(SECONDS)`: Pauses execution for given seconds.

### F. File Functions (Safe & Sandboxed)
- `read_file(PATH)`: Reads UTF-8 file inside the project workspace.
- `write_file(PATH, TEXT)`: Writes text to file inside project workspace.
- `file_exists(PATH)`: Returns true if file exists, false otherwise.
