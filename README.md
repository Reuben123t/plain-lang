# PLAIN — The Simple, Python-Like Programming Language

> **Created by Author: Reuben**  
> **Programming should be as simple as Python, but even easier, with 1,200+ built-in functions, AI training, network web server deployment, and package management.**

**PLAIN** is a powerful yet super simple interpreted programming language designed for students, developers, and AI researchers. It supports both Pythonic syntax (`x = 10`, `x += 5`, `def func: ... end`, `while`, `for`, `**`, `//`, `{}`) and everyday English instructions (`set x to 10`, `say "Hello"`).

It comes with its own `.plain` file extension, a standalone 530MB+ Windows executable, an interactive shell (REPL), package imports, deep learning AI training, a live network web server deployer, and 1,235 built-in functions!

---

## What Does PLAIN Look Like?

### 🐍 Pythonic Simplicity (Variables, Loops, Functions & Math)
```plain
# Simple and familiar math operators (+, -, *, /, **, //)
x = 10
x += 5
power_val = 2 ** 8       # 256
floor_val = 17 // 3      # 5

# Python-style functions with return
def calculate_area(width, height):
    return width * height
end

say "Calculated area: " + calculate_area(12, 5)

# Python-style dictionaries
student = { "name": "Reuben", "role": "Creator", "level": 10 }
say "Student Name: " + student.name
say "Student Role: " + student["role"]
```

### 🧠 AI Deep Neural Network Training (Built-in)
```plain
# Load benchmark dataset and build an MLP neural network
dataset = load_dataset("iris")
net = create_neural_network([4, 8, 3], "sigmoid")

# Train with backpropagation and loss optimization
training_result = train_neural_network(net, dataset.inputs, 100, 0.1)
say "Training finished with MSE loss: " + training_result.final_loss

# Predict classes directly
prediction = predict_neural_network(net, [5.1, 3.5, 1.4, 0.2])
say "Model prediction: " + prediction
```

### 🌐 Live Network Web Server Deployment
```plain
# Deploy a web server accessible across Wi-Fi, LAN, and public IP!
def handle_web(req):
    if req.path == "/api/status":
        return json_response({ "status": "online", "author": "Reuben", "version": "1.1.0" })
    end
    return html_response("<h1>PLAIN Web Server is Live!</h1><p>Created by Reuben</p>")
end

# Binds to 0.0.0.0 on port 8080 and displays active IP connection banner
deploy_server(8080, handle_web, "0.0.0.0")
```

---

## Quick Installation & Downloading

### 💻 Standalone Windows Executable (`plain.exe`) — Author: Reuben
Download and run PLAIN as a standalone 530MB+ executable without needing Node.js, Python, or npm:

1. **Direct Download**:
   - [**Download plain.exe v1.1.0 (Direct)**](https://github.com/Reuben123t/plain-lang/releases/download/v1.1.0/plain.exe)
   - [**Download plain-windows-x64.zip**](https://github.com/Reuben123t/plain-lang/releases/download/v1.1.0/plain-windows-x64.zip)

2. **Terminal Quick Download (PowerShell)**:
   ```powershell
   curl.exe -fSLo plain.exe https://github.com/Reuben123t/plain-lang/releases/download/v1.1.0/plain.exe
   .\plain.exe
   ```

3. **Install as a Global Application via npm**:
   ```bash
   npm install -g plain-lang
   plain
   ```

4. **Terminal Software Updater**:
   ```bash
   plain update
   ```
   PLAIN will check GitHub releases and notify you if an update is available!

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

### 8. 🚀 350+ Built-In Functions: Web, Data Science, AI & Automation

PLAIN is a complete ecosystem out-of-the-box with **350+ functions and English aliases** covering:

#### 🌐 1. Web Development (HTTP Servers & Templates)
- **HTTP Server**: `start_server(port, handler_fn)` — creates a live web server handling GET/POST requests and JSON/HTML responses.
- **Static File Hosting**: `serve_static_files(port, folder)` — serves `.html`, `.css`, `.js`, and media files with one command.
- **HTML Document Builder**: `html_page(title, body)` — generates responsive, modern HTML5 pages with clean CSS.
- **HTML Markup**: `html_tag(tag, content, attrs)` (e.g. `<button>`), `html_table(headers, rows)` (auto-styles table).
- **Templates**: `render_template(template, data_dict)` — replaces `{{variable}}` with data.
- **HTTP Client**: `http_get(url, headers)`, `http_post(url, json_data, headers)`, `send_webhook(url, payload)`.

#### 📊 2. Data Science (CSV, DataFrames & Visualizations)
- **CSV Data Pipelines**: `read_csv(filepath)`, `write_csv(filepath, rows)`, `parse_csv(text)`, `to_csv(table)`.
- **Table Operations**: `table_column(table, name_or_idx)`, `table_headers(table)`, `table_rows(table)`.
- **Filtering & Sorting**: `filter_table(table, column, op, value)` (supports `==`, `>`, `<`, `contains`), `sort_table(table, col, asc)`.
- **Aggregation**: `group_by_count(table, col)`, `group_by_sum(table, group_col, sum_col)`.
- **Feature Scaling**: `normalize_data(numbers)` (Min-Max 0-1), `standardize_data(numbers)` (Z-score).
- **Terminal ASCII Charts**: `ascii_bar_chart(labels, values, width)`, `ascii_histogram(data, bins)`.
- **Interactive Web Charts**: `export_html_chart(title, type, labels, data, filepath)` — exports standalone HTML/JS charts!

#### 🤖 3. Artificial Intelligence & Machine Learning
- **K-Nearest Neighbors**: `knn_classify(train_x, train_y, test_point, k)` (classification), `knn_predict(...)` (regression).
- **Clustering**: `kmeans_cluster(data, k, max_iters)` — Lloyd's K-Means clustering algorithm with centroid discovery.
- **Sentiment Analysis**: `sentiment_analyze(text)` — detects positive/negative sentiment, negation, and intensity.
- **Text Classification**: `train_text_classifier(docs, labels)` and `classify_text(model, text)` — Naive Bayes text classifier!
- **Vector Embeddings**: `vector_dot(v1, v2)`, `vector_magnitude(v)`, `cosine_similarity(v1, v2)` (semantic similarity $-1$ to $1$), `vector_distance(v1, v2)`.
- **Neural Networks**: `sigmoid(x)`, `relu(x)`, `softmax(list)`, `neural_forward(weights, biases, inputs, activation)`.
- **Linear & Polynomial ML**: `predict_linear(x_vals, y_vals, target_x)`.
- **LLM Prompting & API**: `ai_prompt(template, variables)`, `ai_chat(prompt, system_prompt, api_key, model)`.

#### ⚙️ 4. Task Automation (Shell, File Workflows & Logging)
- **Shell Commands**: `run_command(cmd)` (or `shell`) — executes system commands and captures stdout/stderr.
- **Recursive File Search**: `find_files(directory, pattern)`, `walk_directory(directory)`.
- **File Management**: `copy_file(src, dest)`, `move_file(src, dest)`, `batch_rename(dir, find, replace)`, `batch_delete(dir, pattern)`.
- **Integrity**: `checksum_file(path, "sha256")`, `checksum_file(path, "md5")`.
- **Structured Logging**: `log_info(msg)`, `log_warn(msg)`, `log_error(msg)` with ISO timestamps.
- **Environment & Clipboard**: `parse_env_file(".env")`, `get_clipboard()`, `set_clipboard(text)`.

#### 📐 5. Mathematics & Algebra (46 Functions)
- **Powers & Roots**: `square(x)`, `cube(x)`, `square_root(x)` (or `sqrt`), `cube_root(x)`, `power(base, exp)`
- **Number Theory**: `factorial(n)`, `gcd(a, b)`, `lcm(a, b)`, `is_prime(n)`, `next_prime(n)`, `primes_up_to(n)`, `factors(n)`, `is_even(n)`, `is_odd(n)`
- **Algebra & Finance**: `percentage(part, total)`, `percent_change(old, new)`, `simple_interest(p, r, t)`, `compound_interest(p, r, t, n)`, `permutations(n, r)`, `combinations(n, r)`, `quadratic_roots(a, b, c)`
- **Trigonometry & Calculus**: `sine(rad)`, `cosine(rad)`, `tangent(rad)`, `arcsine(x)`, `arccosine(x)`, `arctangent(x)`, `to_degrees(rad)`, `to_radians(deg)`, `log(x)`, `log10(x)`, `log2(x)`, `exp(x)`, `pi()`, `euler_e()`
- **Basic & Clamping**: `round(x, dec)`, `floor(x)`, `ceiling(x)`, `absolute(x)`, `minimum(...)`, `maximum(...)`, `sign(x)`, `clamp(val, min, max)`, `random_between(min, max)`

#### 📏 6. Geometry & 3D Shapes (15 Functions)
- **Distance & 2D**: `hypotenuse(a, b)`, `distance_2d(x1, y1, x2, y2)`, `distance_3d(...)`
- **Areas & Perimeters**: `area_circle(r)`, `circumference_circle(r)`, `area_triangle(b, h)`, `area_rectangle(w, h)`, `perimeter_rectangle(w, h)`, `area_trapezoid(a, b, h)`
- **3D Volumes & Surface Areas**: `volume_cube(s)`, `volume_sphere(r)`, `surface_area_sphere(r)`, `volume_cylinder(r, h)`, `surface_area_cylinder(r, h)`, `volume_cone(r, h)`

#### 📊 7. Statistics (16 Functions)
- `mean(list)`, `median(list)`, `mode(list)`, `range_of(list)`, `variance(list)`, `standard_deviation(list)` (or `stdev`), `z_score(...)`, `percentile(list, p)`, `quartiles(list)`, `iqr(list)`, `frequency_table(list)`, `covariance(x, y)`, `correlation(x, y)`, `linear_regression(x, y)`, `cumulative_sum(list)`, `product_of(list)`

#### ⚛️ 8. Science, Physics & Chemistry (18 Functions)
- **Chemistry**: `atomic_mass("Au")`, `atomic_number("C")`, `element_name("Fe")`, `density(m, v)`
- **Mechanics**: `speed(d, t)`, `acceleration(v1, v2, t)`, `force(m, a)`, `momentum(m, v)`, `kinetic_energy(m, v)`, `potential_energy(m, h, g)`, `work_done(f, d)`, `power_watts(w, t)`
- **Electricity & Gravity**: `ohms_voltage(i, r)`, `ohms_current(v, r)`, `ohms_resistance(v, i)`, `electrical_power(v, i)`, `free_fall_time(h, g)`, `projectile_range(v, angle, g)`

#### 🎒 9. Student Grades, GPA & Unit Conversions (22 Functions)
- `letter_grade(pct)`, `gpa_from_percentage(pct)`, `gpa_from_grades(list)`, `weighted_score(scores, weights)`
- `celsius_to_fahrenheit`, `fahrenheit_to_celsius`, `celsius_to_kelvin`, `kelvin_to_celsius`
- `km_to_miles`, `miles_to_km`, `meters_to_feet`, `feet_to_meters`, `cm_to_inches`, `inches_to_cm`
- `kg_to_pounds`, `pounds_to_kg`, `grams_to_ounces`, `ounces_to_grams`, `liters_to_gallons`, `gallons_to_liters`

#### 📝 10. Text & String Processing (36 Functions)
- `uppercase`, `lowercase`, `title_case`, `camel_case`, `snake_case`, `kebab_case`, `length`, `word_count`, `line_count`, `char_count`, `is_palindrome`, `caesar_cipher`, `base64_encode`, `base64_decode`, `slugify`, `split_text`, `slice_text`, `trim`, `pad_start`, `pad_end`

#### 📋 11. Lists & Arrays (28 Functions)
- `count`, `first`, `last`, `item_of`, `sort`, `reverse`, `sum`, `average`, `highest`, `lowest`, `unique`, `shuffle`, `sample`, `chunk`, `intersection`, `union`, `difference`, `zip`, `find_index`, `slice_list`, `is_sorted`, `range_list`

#### 📅 12. Date & Time (17 Functions)
- `today()`, `current_time()`, `current_year()`, `current_month()`, `day_of_week()`, `is_leap_year(y)`, `days_in_month(y, m)`, `days_between(d1, d2)`, `add_days(d, n)`, `format_date(d, fmt)`, `sleep(sec)`

#### 🎲 13. System, Games & Offline Reference (18 Functions)
- `define_word(word)` (offline dictionary), `roll_dice(sides, count)`, `flip_coin()`, `pick_card()`, `deck_of_cards()`, `flashcard()`, `banner("trophy")`, `beep()`, `os_platform()`, `os_arch()`, `cpu_count()`, `memory_usage()`, `random_id(len)`, `generate_password(len)`, `hash_text(s)`

#### 📁 14. Sandboxed Safe File I/O (9 Functions)
- `read_file(path)`, `write_file(path, text)`, `append_file(path, text)`, `file_exists(path)`, `delete_file(path)`, `list_files(dir)`, `file_size(path)`, `create_folder(dir)`, `folder_exists(dir)`

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

