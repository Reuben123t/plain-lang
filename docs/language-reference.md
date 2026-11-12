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

### F. Mathematics & Algebra Built-Ins
- `square(x)`: $x^2$
- `cube(x)`: $x^3$
- `square_root(x)` / `sqrt(x)`: $\sqrt{x}$
- `cube_root(x)` / `cbrt(x)`: $\sqrt[3]{x}$
- `power(base, exp)` / `pow(base, exp)`: $base^{exp}$
- `factorial(n)` / `fact(n)`: $n!$
- `gcd(a, b)`: Greatest common divisor.
- `lcm(a, b)`: Least common multiple.
- `is_prime(n)`: Checks if $n$ is prime.
- `next_prime(n)`: Returns the smallest prime greater than $n$.
- `primes_up_to(n)`: Returns list of primes up to $n$ via sieve.
- `factors(n)`: Returns list of integer factors of $n$.
- `is_even(n)` / `is_odd(n)`: Parity check.
- `percentage(part, total)`: Returns $(part / total) \times 100$.
- `percent_change(old, new)`: Calculates percentage increase/decrease.
- `simple_interest(p, r, t)`: $P \times R \times T / 100$.
- `compound_interest(p, r, t, n)`: Compound interest total.
- `permutations(n, r)`: $P(n, r) = \frac{n!}{(n-r)!}$.
- `combinations(n, r)`: $C(n, r) = \frac{n!}{r!(n-r)!}$.
- `quadratic_roots(a, b, c)`: Solves $ax^2 + bx + c = 0$, returns list of real roots.
- `sine(x)`, `cosine(x)`, `tangent(x)`: Standard trigonometric functions.
- `arcsine(x)`, `arccosine(x)`, `arctangent(x)`: Inverse trigonometric functions.
- `to_degrees(rad)`, `to_radians(deg)`: Angle conversions.
- `log(x)`, `log10(x)`, `log2(x)`, `exp(x)`: Logarithms and exponentials.
- `pi()`, `euler_e()`: Mathematical constants $\pi$ and $e$.

### G. Geometry & 3D Shapes
- `hypotenuse(a, b)`: Calculates $\sqrt{a^2 + b^2}$.
- `distance_2d(x1, y1, x2, y2)`: Euclidean distance in 2D plane.
- `distance_3d(x1, y1, z1, x2, y2, z2)`: Distance in 3D space.
- `area_circle(r)`, `circumference_circle(r)`: Circle formulas.
- `area_triangle(b, h)`: $0.5 \times b \times h$.
- `area_rectangle(w, h)`, `perimeter_rectangle(w, h)`: Rectangle formulas.
- `area_trapezoid(a, b, h)`: Trapezoid area.
- `volume_cube(s)`: $s^3$.
- `volume_sphere(r)`, `surface_area_sphere(r)`: Sphere formulas.
- `volume_cylinder(r, h)`, `surface_area_cylinder(r, h)`: Cylinder formulas.
- `volume_cone(r, h)`: Cone volume $\frac{1}{3}\pi r^2 h$.

### H. Statistics & Data Analysis
- `mean(list)` / `average(list)`: Arithmetic mean.
- `median(list)`: Middle value.
- `mode(list)`: Most common value.
- `range_of(list)`: Difference between max and min.
- `variance(list)`: Sample variance.
- `standard_deviation(list)` / `stdev(list)`: Sample standard deviation.
- `z_score(val, mean, stdev)`: Standard score.
- `percentile(list, p)`: $p$-th percentile value.
- `quartiles(list)`: Returns `[Q1, Q2, Q3]`.
- `iqr(list)`: Interquartile range ($Q3 - Q1$).
- `frequency_table(list)`: Count of each unique value.
- `covariance(x, y)`: Sample covariance.
- `correlation(x, y)`: Pearson correlation coefficient $r$.
- `linear_regression(x, y)`: Computes best-fit line `[slope, intercept]`.
- `cumulative_sum(list)`: Running totals.
- `product_of(list)`: Multiplies all numbers.

### I. Science & Physics
- `atomic_mass(element)`: Standard atomic weight (e.g. "Au" -> 196.97).
- `atomic_number(element)`: Atomic number (e.g. "Fe" -> 26).
- `element_name(element)`: Full chemical name (e.g. "O" -> "Oxygen").
- `density(mass, volume)`: Density $\rho = m / V$.
- `speed(distance, time)`: $v = d / t$.
- `acceleration(v1, v2, time)`: $a = \Delta v / t$.
- `force(mass, acceleration)`: $F = m \times a$.
- `momentum(mass, velocity)`: $p = m \times v$.
- `kinetic_energy(mass, velocity)`: $KE = \frac{1}{2} m v^2$.
- `potential_energy(mass, height, g)`: $PE = m g h$.
- `work_done(force, distance)`: $W = F \times d$.
- `power_watts(work, time)`: $P = W / t$.
- `ohms_voltage(i, r)`: $V = I \times R$.
- `ohms_current(v, r)`: $I = V / R$.
- `ohms_resistance(v, i)`: $R = V / I$.
- `electrical_power(v, i)`: $P = V \times I$.
- `free_fall_time(height, g)`: $t = \sqrt{2h/g}$.
- `projectile_range(v, angle_deg, g)`: Horizontal projectile range.

### J. Student Grades & Unit Conversions
- `letter_grade(percentage)`: Converts 0-100 to letter grade ("A+", "A", "B", ...).
- `gpa_from_percentage(percentage)`: 4.0 scale GPA conversion.
- `gpa_from_grades(grades_list)`: Calculates GPA from list of letter grades.
- `weighted_score(scores, weights)`: Computes weighted average.
- `celsius_to_fahrenheit(c)` / `fahrenheit_to_celsius(f)`: Temperature conversions.
- `celsius_to_kelvin(c)` / `kelvin_to_celsius(k)`: Kelvin conversions.
- `km_to_miles(km)` / `miles_to_km(mi)`: Distance conversions.
- `meters_to_feet(m)` / `feet_to_meters(ft)`: Height conversions.
- `cm_to_inches(cm)` / `inches_to_cm(in)`: Small length conversions.
- `kg_to_pounds(kg)` / `pounds_to_kg(lbs)`: Weight conversions.
- `grams_to_ounces(g)` / `ounces_to_grams(oz)`: Mass conversions.
- `liters_to_gallons(l)` / `gallons_to_liters(gal)`: Volume conversions.
- `hours_to_minutes(h)` / `minutes_to_seconds(m)`: Time unit conversions.

### K. Text & Cryptography
- `title_case(s)`, `camel_case(s)`, `snake_case(s)`, `kebab_case(s)`: Formats.
- `word_count(s)`, `line_count(s)`, `char_count(s)`: Counts.
- `count_vowels(s)`, `count_consonants(s)`: Phonetic counts.
- `is_palindrome(s)`: Checks for forward/backward identity.
- `caesar_cipher(s, shift)`: Classical substitution cipher.
- `base64_encode(s)`, `base64_decode(s)`: Base64 encoding.
- `slugify(s)`: Converts text to URL-friendly slug.

### L. Advanced List Algorithms
- `unique(list)`: Removes duplicate entries.
- `shuffle(list)`: Fisher-Yates random shuffle.
- `sample(list, n)`: Random subset selection without replacement.
- `chunk(list, size)`: Splits list into batches of given size.
- `intersection(a, b)`: Elements present in both lists.
- `union(a, b)`: Combined elements without duplicates.
- `difference(a, b)`: Elements in list `a` not in `b`.
- `zip(a, b)`: Pairs elements from two lists.
- `find_index(list, item)`: 1-based index of item.
- `is_sorted(list)`: Checks if list is sorted in ascending order.
- `range_list(start, end, step)`: Generates range list.

### M. System, Utilities & Offline Dictionary
- `define_word(word)`: Offline student dictionary definition.
- `roll_dice(sides, count)`: Simulates dice rolls.
- `flip_coin()`: Returns "heads" or "tails".
- `pick_card()`: Picks random card from a standard 52-card deck.
- `flashcard()`: Returns student study questions and answers.
- `hash_text(text, algo)`: Computes SHA256 or MD5 hash.
- `to_json(val)` / `from_json(str)`: JSON serialization.
- `os_platform()`, `os_arch()`, `cpu_count()`, `memory_usage()`.

### N. File Functions (Safe & Sandboxed)
- `read_file(PATH)`: Reads UTF-8 file inside the project workspace.
- `write_file(PATH, TEXT)`: Writes text to file inside project workspace.
- `append_file(PATH, TEXT)`: Appends text to existing file.
- `file_exists(PATH)`: Returns true if file exists, false otherwise.
- `delete_file(PATH)`: Safely deletes file within project workspace.
- `list_files(DIR)`: Returns list of filenames in directory.
- `file_size(PATH)`: Size of file in bytes.
- `create_folder(DIR)`: Creates a new directory.
- `folder_exists(DIR)`: Checks if directory exists.

### O. Network & Web
- `fetch_text(url)`: Fetches raw text content from HTTP/HTTPS URL.
- `fetch_json(url)`: Fetches and parses JSON from web API.
- `url_encode(text)`, `url_decode(text)`: URL percent encoding.
- `is_valid_url(text)`: Validates web URLs.


