# PLAIN standard library

Generated from the checked-in function signatures. Run `npm run generate:catalog` after changing the library.

517 module-qualified function definitions; aliases are listed separately and are not counted as additional implementations.

Function names are case-insensitive. Use canonical snake_case names or listed identifier aliases. Space-separated aliases remain compatibility names; not every space spelling is supported by the parser.

**Browser** entries run in the browser profile. **Node** entries require trusted local execution; filesystem helpers stay within the project, but shell/network APIs are not an OS security sandbox.

## ai

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `ai_chat(prompt, systemPrompt?, apiKey?, model?)` | Node | ai chat — ai standard library. | `aiChat` |
| `ai_prompt(template, vars)` | Node | ai prompt — ai standard library. | `aiPrompt` |
| `classify_text(model, text)` | Node | classify text — ai standard library. | `classifyText` |
| `cosine_similarity(v1, v2)` | Node | cosine similarity — ai standard library. | `cosineSimilarity` |
| `kmeans_cluster(data, k?, maxIters?)` | Node | kmeans cluster — ai standard library. | `kmeansCluster`, `kmeans` |
| `knn_classify(trainX, trainY, testPoint, k?)` | Node | knn classify — ai standard library. | `knnClassify`, `knn` |
| `knn_predict(trainX, trainY, testPoint, k?)` | Node | knn predict — ai standard library. | `knnPredict` |
| `neural_forward(weights, biases, inputs, activation?)` | Node | neural forward — ai standard library. | `neuralForward` |
| `predict_linear(xList, yList, targetX)` | Node | predict linear — ai standard library. | `predictLinear` |
| `relu(x)` | Node | relu — ai standard library. | — |
| `sentiment_analyze(text)` | Node | sentiment analyze — ai standard library. | `sentimentAnalyze` |
| `sigmoid(x)` | Node | sigmoid — ai standard library. | — |
| `softmax(list)` | Node | softmax — ai standard library. | — |
| `train_text_classifier(docs, labels?)` | Node | train text classifier — ai standard library. | `trainTextClassifier` |
| `vector_distance(v1, v2)` | Node | vector distance — ai standard library. | `vectorDistance` |
| `vector_dot(v1, v2)` | Node | vector dot — ai standard library. | `vectorDot` |
| `vector_magnitude(v)` | Node | vector magnitude — ai standard library. | `vectorMagnitude` |

## ai_training

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `accuracy_score(yTrue, yPred)` | Browser / Node | accuracy score — ai training standard library. | `accuracyScore` |
| `binary_cross_entropy_loss(yTrue, yPred)` | Browser / Node | binary cross entropy loss — ai training standard library. | `binaryCrossEntropyLoss`, `cross_entropy` |
| `categorical_cross_entropy_loss(yTrue, yPred)` | Browser / Node | categorical cross entropy loss — ai training standard library. | `categoricalCrossEntropyLoss` |
| `confusion_matrix(yTrue, yPred)` | Browser / Node | confusion matrix — ai training standard library. | `confusionMatrix` |
| `cosine_similarity_text(doc1, doc2)` | Browser / Node | cosine similarity text — ai training standard library. | `cosineSimilarityText` |
| `create_neural_network(layers, activation?)` | Browser / Node | Create a small fully connected neural network from layer widths and an activation name. | `createNeuralNetwork`, `nn_create` |
| `gelu(x)` | Browser / Node | gelu — ai training standard library. | — |
| `get_network_biases(net)` | Browser / Node | get network biases — ai training standard library. | `getNetworkBiases` |
| `get_network_weights(net)` | Browser / Node | get network weights — ai training standard library. | `getNetworkWeights` |
| `label_encode(labels)` | Browser / Node | label encode — ai training standard library. | `labelEncode` |
| `leaky_relu(x, alpha?)` | Browser / Node | leaky relu — ai training standard library. | `leakyRelu` |
| `levenshtein_distance(a, b)` | Browser / Node | levenshtein distance — ai training standard library. | `levenshteinDistance` |
| `load_ai_dataset(name)` | Browser / Node | Load an independent copy of a small bundled learning dataset. | `loadAiDataset`, `load_dataset` |
| `mean_absolute_error_loss(yTrue, yPred)` | Browser / Node | mean absolute error loss — ai training standard library. | `meanAbsoluteErrorLoss`, `mae` |
| `mean_squared_error_loss(yTrue, yPred)` | Browser / Node | mean squared error loss — ai training standard library. | `meanSquaredErrorLoss`, `mse` |
| `min_max_scale(matrix, min?, max?)` | Browser / Node | min max scale — ai training standard library. | `minMaxScale` |
| `one_hot_encode(labels)` | Browser / Node | one hot encode — ai training standard library. | `oneHotEncode` |
| `predict_decision_tree_stump(model, sample)` | Browser / Node | predict decision tree stump — ai training standard library. | `predictDecisionTreeStump` |
| `predict_logistic_regression(model, sample)` | Browser / Node | predict logistic regression — ai training standard library. | `predictLogisticRegression` |
| `predict_neural_network(net, input)` | Browser / Node | Run a network on one input vector and return its prediction vector. | `predictNeuralNetwork`, `nn_predict` |
| `r2_score(yTrue, yPred)` | Browser / Node | r2 score — ai training standard library. | `r2Score` |
| `relu(x)` | Browser / Node | relu — ai training standard library. | — |
| `relu_derivative(x)` | Browser / Node | relu derivative — ai training standard library. | `reluDerivative` |
| `remove_stopwords(words)` | Browser / Node | remove stopwords — ai training standard library. | `removeStopwords` |
| `sigmoid(x)` | Browser / Node | sigmoid — ai training standard library. | — |
| `sigmoid_derivative(y)` | Browser / Node | sigmoid derivative — ai training standard library. | `sigmoidDerivative` |
| `softmax(vec)` | Browser / Node | softmax — ai training standard library. | — |
| `standard_scale(matrix)` | Browser / Node | standard scale — ai training standard library. | `standardScale` |
| `swish(x)` | Browser / Node | swish — ai training standard library. | — |
| `tanh_activation(x)` | Browser / Node | tanh activation — ai training standard library. | `tanhActivation` |
| `tanh_derivative(y)` | Browser / Node | tanh derivative — ai training standard library. | `tanhDerivative` |
| `tokenize_sentences(text)` | Browser / Node | tokenize sentences — ai training standard library. | `tokenizeSentences` |
| `tokenize_words(text)` | Browser / Node | tokenize words — ai training standard library. | `tokenizeWords` |
| `train_decision_tree_stump(features, labels)` | Browser / Node | train decision tree stump — ai training standard library. | `trainDecisionTreeStump` |
| `train_logistic_regression(features, labels, epochs?, lr?)` | Browser / Node | train logistic regression — ai training standard library. | `trainLogisticRegression`, `log_reg` |
| `train_neural_network(net, dataset, epochs?, lr?)` | Browser / Node | Train using a dataset with inputs/targets or records with input/output; return loss history. | `trainNeuralNetwork`, `nn_train` |
| `train_test_split(inputs, targets, testRatio?)` | Browser / Node | train test split — ai training standard library. | `trainTestSplit` |

## algorithms

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `binary_search(sortedList, target)` | Browser / Node | binary search — algorithms standard library. | `binarySearch` |
| `bubble_sort(list)` | Browser / Node | bubble sort — algorithms standard library. | `bubbleSort` |
| `combinations_count(n, k)` | Browser / Node | combinations count — algorithms standard library. | `combinationsCount` |
| `fibonacci_nth(n)` | Browser / Node | fibonacci nth — algorithms standard library. | `fibonacciNth`, `fib` |
| `graph_add_edge(graph, from, to, weight?)` | Browser / Node | graph add edge — algorithms standard library. | `graphAddEdge` |
| `graph_bfs(graph, startNode)` | Browser / Node | graph bfs — algorithms standard library. | `graphBfs` |
| `graph_create()` | Browser / Node | graph create — algorithms standard library. | `graphCreate` |
| `graph_dfs(graph, startNode)` | Browser / Node | graph dfs — algorithms standard library. | `graphDfs` |
| `graph_dijkstra(graph, startNode)` | Browser / Node | graph dijkstra — algorithms standard library. | `graphDijkstra` |
| `insertion_sort(list)` | Browser / Node | insertion sort — algorithms standard library. | `insertionSort` |
| `knapsack_01(weights, values, capacity)` | Browser / Node | knapsack 01 — algorithms standard library. | `knapsack01` |
| `linear_search(list, target)` | Browser / Node | linear search — algorithms standard library. | `linearSearch` |
| `longest_common_subsequence(s1, s2)` | Browser / Node | longest common subsequence — algorithms standard library. | `longestCommonSubsequence` |
| `merge_sort(list)` | Browser / Node | merge sort — algorithms standard library. | `mergeSort` |
| `permutations_count(n, k)` | Browser / Node | permutations count — algorithms standard library. | `permutationsCount` |
| `quick_sort(list)` | Browser / Node | quick sort — algorithms standard library. | `quickSort` |

## automation

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `batch_delete(dir, pattern)` | Node | batch delete — automation standard library. | `batchDelete` |
| `batch_rename(dir, find, replace)` | Node | batch rename — automation standard library. | `batchRename` |
| `checksum_file(filePath, algo?)` | Node | Hash the bytes of a project file; defaults to SHA-256. | `checksumFile` |
| `copy_file(src, dest)` | Node | copy file — automation standard library. | `copyFile` |
| `delay(seconds)` | Node | delay — automation standard library. | — |
| `find_files(dir, pattern)` | Node | find files — automation standard library. | `findFiles` |
| `get_clipboard()` | Node | get clipboard — automation standard library. | `getClipboard` |
| `log_error(msg)` | Node | log error — automation standard library. | `logError` |
| `log_info(msg)` | Node | log info — automation standard library. | `logInfo` |
| `log_warn(msg)` | Node | log warn — automation standard library. | `logWarn` |
| `move_file(src, dest)` | Node | move file — automation standard library. | `moveFile` |
| `parse_env_file(filePath)` | Node | parse env file — automation standard library. | `parseEnvFile` |
| `run_command(cmd)` | Node | run command — automation standard library. | `runCommand`, `exec_shell`, `shell` |
| `set_clipboard(text)` | Node | set clipboard — automation standard library. | `setClipboard` |
| `walk_directory(dir?)` | Node | walk directory — automation standard library. | `walkDirectory` |

## crypto

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `aes_decrypt(encryptedPayload, secretKey)` | Node | aes decrypt — crypto standard library. | `aesDecrypt` |
| `aes_encrypt(plainText, secretKey)` | Node | aes encrypt — crypto standard library. | `aesEncrypt` |
| `base64_decode(encoded)` | Node | Decode Base64 into UTF-8 text. | `base64Decode` |
| `base64_encode(text)` | Node | Encode UTF-8 text as Base64. | `base64Encode` |
| `caesar_cipher(text, shift?)` | Node | caesar cipher — crypto standard library. | `caesarCipher` |
| `create_jwt(payload, secretKey, expiresInSeconds?)` | Node | create jwt — crypto standard library. | `createJwt`, `jwt_sign` |
| `generate_api_key(prefix?)` | Node | generate api key — crypto standard library. | `generateApiKey` |
| `generate_password(length?, includeSymbols?)` | Node | generate password — crypto standard library. | `generatePassword` |
| `generate_random_token(byteLength?)` | Node | generate random token — crypto standard library. | `generateRandomToken` |
| `generate_uuid()` | Node | generate uuid — crypto standard library. | `generateUuid`, `uuid` |
| `hex_decode(hex)` | Node | hex decode — crypto standard library. | `hexDecode` |
| `hex_encode(text)` | Node | hex encode — crypto standard library. | `hexEncode` |
| `hmac_sha256(text, secretKey)` | Node | hmac sha256 — crypto standard library. | `hmacSha256` |
| `hmac_sha512(text, secretKey)` | Node | hmac sha512 — crypto standard library. | `hmacSha512` |
| `md5(text)` | Node | md5 — crypto standard library. | `hash_md5` |
| `rot13(text)` | Node | rot13 — crypto standard library. | — |
| `secure_compare(a, b)` | Node | secure compare — crypto standard library. | `secureCompare` |
| `sha1(text)` | Node | sha1 — crypto standard library. | — |
| `sha256(text)` | Node | sha256 — crypto standard library. | `hash_sha256` |
| `sha512(text)` | Node | sha512 — crypto standard library. | — |
| `verify_jwt(token, secretKey)` | Node | verify jwt — crypto standard library. | `verifyJwt`, `jwt_verify` |

## cyber

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `audit_security_headers(targetUrl)` | Node | Inspect response headers for a URL you are authorized to assess (local runtime only). | `auditSecurityHeaders`, `audit` |
| `banner_grab(targetHost, portNumber?, timeoutMs?)` | Node | banner grab — cyber standard library. | `bannerGrab`, `banner_grab_host` |
| `calculate_entropy(data)` | Node | calculate entropy — cyber standard library. | `calculateEntropy`, `entropy` |
| `check_password_strength(passwordText)` | Node | check password strength — cyber standard library. | `checkPasswordStrength`, `pwd_strength` |
| `crc32(data)` | Node | crc32 — cyber standard library. | — |
| `cve_lookup(cveId)` | Node | cve lookup — cyber standard library. | `cveLookup`, `cve` |
| `detect_file_signature(hexOrData)` | Node | detect file signature — cyber standard library. | `detectFileSignature`, `magic_bytes` |
| `detect_path_traversal(filePath)` | Node | detect path traversal — cyber standard library. | `detectPathTraversal` |
| `detect_sql_injection(inputString)` | Node | detect sql injection — cyber standard library. | `detectSqlInjection`, `sqli_check` |
| `detect_xss(inputString)` | Node | detect xss — cyber standard library. | `detectXss`, `xss_check` |
| `dns_resolve(hostname, recordType?)` | Node | dns resolve — cyber standard library. | `dnsResolve` |
| `extract_strings(data, minLength?)` | Node | extract strings — cyber standard library. | `extractStrings` |
| `is_port_open(targetHost, portNumber, timeoutMs?)` | Node | is port open — cyber standard library. | `isPortOpen` |
| `ping_host(targetHost, timeoutMs?)` | Node | ping host — cyber standard library. | `pingHost`, `ping` |
| `port_lookup(portNumber)` | Node | port lookup — cyber standard library. | `portLookup` |
| `port_scan(targetHost?, customPorts?, timeoutMs?)` | Node | Check selected TCP ports on a host you own or have permission to test (local runtime only). | `portScan`, `scan` |
| `rate_limit_check(clientKey, maxRequests?, windowSeconds?)` | Node | rate limit check — cyber standard library. | `rateLimitCheck` |
| `reverse_dns(ipAddress)` | Node | reverse dns — cyber standard library. | `reverseDns` |
| `sanitize_html(htmlString)` | Node | sanitize html — cyber standard library. | `sanitizeHtml` |
| `sanitize_sql_param(paramString)` | Node | sanitize sql param — cyber standard library. | `sanitizeSqlParam` |
| `subnet_calculator(cidrOrIp, netmaskStr?)` | Node | subnet calculator — cyber standard library. | `subnetCalculator`, `subnet` |
| `xor_cipher(plainText, keyText)` | Node | xor cipher — cyber standard library. | `xorCipher` |

## data

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `ascii_bar_chart(labels, values, maxWidth?)` | Node | ascii bar chart — data standard library. | `asciiBarChart`, `bar_chart` |
| `ascii_histogram(list, bins?)` | Node | ascii histogram — data standard library. | `asciiHistogram`, `histogram` |
| `describe_column(col)` | Node | describe column — data standard library. | `describeColumn` |
| `export_html_chart(title, type, labels, data, filePath)` | Node | export html chart — data standard library. | `exportHtmlChart` |
| `filter_table(table, col, op, target)` | Node | filter table — data standard library. | `filterTable` |
| `group_by_count(table, col)` | Node | group by count — data standard library. | `groupByCount` |
| `group_by_sum(table, groupCol, sumCol)` | Node | group by sum — data standard library. | `groupBySum` |
| `normalize_data(list)` | Node | normalize data — data standard library. | `normalizeData` |
| `parse_csv(text)` | Node | parse csv — data standard library. | `parseCsv` |
| `read_csv(filePath)` | Node | read csv — data standard library. | `readCsv` |
| `sort_table(table, col, ascending?)` | Node | sort table — data standard library. | `sortTable` |
| `standardize_data(list)` | Node | standardize data — data standard library. | `standardizeData` |
| `table_column(table, col)` | Node | table column — data standard library. | `tableColumn` |
| `table_headers(table)` | Node | table headers — data standard library. | `tableHeaders` |
| `table_rows(table)` | Node | table rows — data standard library. | `tableRows` |
| `to_csv(table)` | Node | to csv — data standard library. | `toCsv` |
| `train_test_split(data, testRatio?)` | Node | train test split — data standard library. | `trainTestSplit` |
| `write_csv(filePath, table)` | Node | write csv — data standard library. | `writeCsv` |

## file

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `append_file(path, content)` | Node | append file inside the project directory. | `appendFile` |
| `create_folder(directory)` | Node | create folder inside the project directory. | `createFolder` |
| `delete_file(path)` | Node | delete file inside the project directory. | `deleteFile` |
| `file_exists(path)` | Node | file exists inside the project directory. | `fileExists` |
| `file_size(path)` | Node | file size inside the project directory. | `fileSize` |
| `folder_exists(directory)` | Node | folder exists inside the project directory. | `folderExists` |
| `list_files(directory?)` | Node | list files inside the project directory. | `listFiles` |
| `read_file(path)` | Node | Read UTF-8 text from a file inside the project directory. | `readFile` |
| `write_file(path, content)` | Node | Write UTF-8 text inside the project directory, creating parent directories as needed. | `writeFile` |

## geometry

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `area_circle(radius)` | Browser / Node | area circle — geometry standard library. | `areaCircle` |
| `area_rectangle(length, width)` | Browser / Node | area rectangle — geometry standard library. | `areaRectangle` |
| `area_trapezoid(base1, base2, height)` | Browser / Node | area trapezoid — geometry standard library. | `areaTrapezoid` |
| `area_triangle(base, height)` | Browser / Node | area triangle — geometry standard library. | `areaTriangle` |
| `circumference_circle(radius)` | Browser / Node | circumference circle — geometry standard library. | `circumferenceCircle` |
| `distance_2d(x1, y1, x2, y2)` | Browser / Node | distance 2d — geometry standard library. | `distance2d` |
| `distance_3d(x1, y1, z1, x2, y2, z2)` | Browser / Node | distance 3d — geometry standard library. | `distance3d` |
| `hypotenuse(a, b)` | Browser / Node | hypotenuse — geometry standard library. | — |
| `perimeter_rectangle(length, width)` | Browser / Node | perimeter rectangle — geometry standard library. | `perimeterRectangle` |
| `surface_area_cylinder(radius, height)` | Browser / Node | surface area cylinder — geometry standard library. | `surfaceAreaCylinder` |
| `surface_area_sphere(radius)` | Browser / Node | surface area sphere — geometry standard library. | `surfaceAreaSphere` |
| `volume_cone(radius, height)` | Browser / Node | volume cone — geometry standard library. | `volumeCone` |
| `volume_cube(side)` | Browser / Node | volume cube — geometry standard library. | `volumeCube` |
| `volume_cylinder(radius, height)` | Browser / Node | volume cylinder — geometry standard library. | `volumeCylinder` |
| `volume_sphere(radius)` | Browser / Node | volume sphere — geometry standard library. | `volumeSphere` |

## io

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `args()` | Browser / Node | Return a copy of the script arguments supplied after --. | — |
| `print(value)` | Browser / Node | Write a value using the host's output callback. | — |

## linear_algebra

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `matrix_add(a, b)` | Browser / Node | matrix add — linear algebra standard library. | `matrixAdd` |
| `matrix_create(rows, cols, fill?)` | Browser / Node | matrix create — linear algebra standard library. | `matrixCreate` |
| `matrix_determinant(matrix)` | Browser / Node | matrix determinant — linear algebra standard library. | `matrixDeterminant`, `det` |
| `matrix_elementwise_mult(a, b)` | Browser / Node | matrix elementwise mult — linear algebra standard library. | `matrixElementwiseMult` |
| `matrix_eye(size)` | Browser / Node | matrix eye — linear algebra standard library. | `matrixEye`, `np_eye`, `eye` |
| `matrix_inverse_2x2(matrix)` | Browser / Node | matrix inverse 2x2 — linear algebra standard library. | `matrixInverse2x2`, `inv` |
| `matrix_mult(a, b)` | Browser / Node | matrix mult — linear algebra standard library. | `matrixMult`, `matmul`, `np_matmul` |
| `matrix_ones(rows, cols)` | Browser / Node | matrix ones — linear algebra standard library. | `matrixOnes`, `np_ones`, `ones` |
| `matrix_random(rows, cols, min?, max?)` | Browser / Node | matrix random — linear algebra standard library. | `matrixRandom` |
| `matrix_reshape(matrix, newRows, newCols)` | Browser / Node | matrix reshape — linear algebra standard library. | `matrixReshape`, `reshape` |
| `matrix_scale(matrix, scalar)` | Browser / Node | matrix scale — linear algebra standard library. | `matrixScale` |
| `matrix_shape(matrix)` | Browser / Node | matrix shape — linear algebra standard library. | `matrixShape`, `shape` |
| `matrix_sub(a, b)` | Browser / Node | matrix sub — linear algebra standard library. | `matrixSub` |
| `matrix_trace(matrix)` | Browser / Node | matrix trace — linear algebra standard library. | `matrixTrace` |
| `matrix_transpose(matrix)` | Browser / Node | matrix transpose — linear algebra standard library. | `matrixTranspose`, `transpose` |
| `matrix_vector_mult(matrix, vector)` | Browser / Node | matrix vector mult — linear algebra standard library. | `matrixVectorMult` |
| `matrix_zeros(rows, cols)` | Browser / Node | matrix zeros — linear algebra standard library. | `matrixZeros`, `np_zeros`, `zeros` |
| `solve_system_2x2(a, b, e, c, d, f)` | Browser / Node | solve system 2x2 — linear algebra standard library. | `solveSystem2x2` |
| `vector_angle_deg(a, b)` | Browser / Node | vector angle deg — linear algebra standard library. | `vectorAngleDeg` |
| `vector_angle_rad(a, b)` | Browser / Node | vector angle rad — linear algebra standard library. | `vectorAngleRad` |
| `vector_cross_3d(a, b)` | Browser / Node | vector cross 3d — linear algebra standard library. | `vectorCross3d` |
| `vector_distance(a, b)` | Browser / Node | vector distance — linear algebra standard library. | `vectorDistance` |
| `vector_dot(a, b)` | Browser / Node | vector dot — linear algebra standard library. | `vectorDot`, `np_dot`, `dot` |
| `vector_lerp(a, b, t)` | Browser / Node | vector lerp — linear algebra standard library. | `vectorLerp` |
| `vector_magnitude(v)` | Browser / Node | vector magnitude — linear algebra standard library. | `vectorMagnitude` |
| `vector_normalize(v)` | Browser / Node | vector normalize — linear algebra standard library. | `vectorNormalize` |

## list

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `adjacent_pairs(val)` | Browser / Node | adjacent pairs — list standard library. | `adjacentPairs` |
| `average(val)` | Browser / Node | average — list standard library. | `avg`, `mean` |
| `chunk(val, size)` | Browser / Node | chunk — list standard library. | — |
| `count(val)` | Browser / Node | Count the elements of a list. | `size` |
| `difference(listA, listB)` | Browser / Node | difference — list standard library. | — |
| `drop(val, count)` | Browser / Node | drop — list standard library. | — |
| `enumerate(val)` | Browser / Node | enumerate — list standard library. | — |
| `fill_list(val, count)` | Browser / Node | fill list — list standard library. | `fillList` |
| `find_index(list, item)` | Browser / Node | find index — list standard library. | `findIndex` |
| `first(val)` | Browser / Node | first — list standard library. | — |
| `flatten(val)` | Browser / Node | flatten — list standard library. | — |
| `group_by(val, key)` | Browser / Node | group by — list standard library. | `groupBy` |
| `highest(val)` | Browser / Node | highest — list standard library. | — |
| `insert_at(list, index, item)` | Browser / Node | insert at — list standard library. | `insertAt` |
| `interleave(left, right)` | Browser / Node | interleave — list standard library. | — |
| `intersection(listA, listB)` | Browser / Node | intersection — list standard library. | — |
| `is_empty(val)` | Browser / Node | is empty — list standard library. | `isEmpty` |
| `is_sorted(val)` | Browser / Node | is sorted — list standard library. | `isSorted` |
| `item_of(index, list)` | Browser / Node | Read a list item using PLAIN's English-style one-based indexing. | `itemOf` |
| `last(val)` | Browser / Node | last — list standard library. | — |
| `lowest(val)` | Browser / Node | lowest — list standard library. | — |
| `range_list(start, end, step?)` | Browser / Node | Create an inclusive numeric range with an optional step. | `rangeList` |
| `reverse(val)` | Browser / Node | reverse — list standard library. | — |
| `rotate(val, places?)` | Browser / Node | rotate — list standard library. | — |
| `sample(val)` | Browser / Node | sample — list standard library. | — |
| `shuffle(val)` | Browser / Node | shuffle — list standard library. | — |
| `slice_list(list, start, end?)` | Browser / Node | slice list — list standard library. | `sliceList` |
| `sort(val)` | Browser / Node | sort — list standard library. | — |
| `sum(val)` | Browser / Node | sum — list standard library. | — |
| `take(val, count)` | Browser / Node | take — list standard library. | — |
| `union(listA, listB)` | Browser / Node | union — list standard library. | — |
| `unique(val)` | Browser / Node | unique — list standard library. | — |
| `zip(listA, listB)` | Browser / Node | zip — list standard library. | — |

## math

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `absolute(num)` | Browser / Node | absolute — math standard library. | `abs` |
| `arccosine(val)` | Browser / Node | arccosine — math standard library. | — |
| `arcsine(val)` | Browser / Node | arcsine — math standard library. | — |
| `arctangent(val)` | Browser / Node | arctangent — math standard library. | — |
| `ceiling(num)` | Browser / Node | ceiling — math standard library. | — |
| `clamp(val, min, max)` | Browser / Node | clamp — math standard library. | — |
| `combinations(n, r)` | Browser / Node | combinations — math standard library. | — |
| `compound_interest(p, r, t, n?)` | Browser / Node | compound interest — math standard library. | `compoundInterest` |
| `cosine(deg)` | Browser / Node | Return the cosine of an angle in degrees. | — |
| `cube(n)` | Browser / Node | cube — math standard library. | — |
| `cube_root(n)` | Browser / Node | cube root — math standard library. | `cubeRoot`, `cbrt` |
| `euler_e()` | Browser / Node | euler e — math standard library. | `eulerE` |
| `exp(n)` | Browser / Node | exp — math standard library. | — |
| `factorial(n)` | Browser / Node | factorial — math standard library. | `fact` |
| `factors(n)` | Browser / Node | factors — math standard library. | — |
| `floor(num)` | Browser / Node | floor — math standard library. | — |
| `gcd(a, b)` | Browser / Node | gcd — math standard library. | — |
| `is_even(n)` | Browser / Node | is even — math standard library. | `isEven` |
| `is_odd(n)` | Browser / Node | is odd — math standard library. | `isOdd` |
| `is_prime(n)` | Browser / Node | is prime — math standard library. | `isPrime` |
| `lcm(a, b)` | Browser / Node | lcm — math standard library. | — |
| `log(n)` | Browser / Node | log — math standard library. | — |
| `log10(n)` | Browser / Node | log10 — math standard library. | — |
| `log2(n)` | Browser / Node | log2 — math standard library. | — |
| `maximum(...args)` | Browser / Node | maximum — math standard library. | `max` |
| `minimum(...args)` | Browser / Node | minimum — math standard library. | `min` |
| `next_prime(n)` | Browser / Node | next prime — math standard library. | `nextPrime` |
| `percent_change(old, new)` | Browser / Node | percent change — math standard library. | `percentChange` |
| `percentage(part, total)` | Browser / Node | percentage — math standard library. | — |
| `permutations(n, r)` | Browser / Node | permutations — math standard library. | — |
| `pi()` | Browser / Node | pi — math standard library. | — |
| `power(base, exp)` | Browser / Node | power — math standard library. | `pow` |
| `primes_up_to(limit)` | Browser / Node | primes up to — math standard library. | `primesUpTo` |
| `quadratic_roots(a, b, c)` | Browser / Node | quadratic roots — math standard library. | `quadraticRoots` |
| `random_between(min, max)` | Browser / Node | random between — math standard library. | `randomBetween` |
| `round(num)` | Browser / Node | round — math standard library. | — |
| `sign(n)` | Browser / Node | sign — math standard library. | — |
| `simple_interest(principal, ratePercent, timeYears)` | Browser / Node | simple interest — math standard library. | `simpleInterest` |
| `sine(deg)` | Browser / Node | Return the sine of an angle in degrees. | — |
| `square(n)` | Browser / Node | square — math standard library. | — |
| `square_root(n)` | Browser / Node | Return the nonnegative square root of a number. | `squareRoot`, `sqrt` |
| `tangent(deg)` | Browser / Node | Return the tangent of an angle in degrees. | — |
| `to_degrees(rad)` | Browser / Node | to degrees — math standard library. | `toDegrees` |
| `to_number(val)` | Browser / Node | Convert a number or numeric text to a number; reject nonnumeric input. | `toNumber` |
| `to_radians(deg)` | Browser / Node | to radians — math standard library. | `toRadians` |
| `to_text(val)` | Browser / Node | to text — math standard library. | `toText` |

## network

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `fetch_json(url)` | Node | fetch json — network standard library. | `fetchJson` |
| `fetch_text(url)` | Node | fetch text — network standard library. | `fetchText` |
| `is_valid_url(url)` | Node | is valid url — network standard library. | `isValidUrl` |
| `url_decode(text)` | Node | url decode — network standard library. | `urlDecode` |
| `url_encode(text)` | Node | url encode — network standard library. | `urlEncode` |

## physics

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `capacitors_parallel(capacitors)` | Browser / Node | capacitors parallel — physics standard library. | `capacitorsParallel` |
| `capacitors_series(capacitors)` | Browser / Node | capacitors series — physics standard library. | `capacitorsSeries` |
| `carnot_efficiency(tempColdKelvin, tempHotKelvin)` | Browser / Node | carnot efficiency — physics standard library. | `carnotEfficiency` |
| `centripetal_acceleration(velocity, radius)` | Browser / Node | centripetal acceleration — physics standard library. | `centripetalAcceleration` |
| `centripetal_force(mass, velocity, radius)` | Browser / Node | centripetal force — physics standard library. | `centripetalForce` |
| `coulombs_law(q1, q2, distance)` | Browser / Node | coulombs law — physics standard library. | `coulombsLaw` |
| `de_broglie_wavelength(mass, velocity)` | Browser / Node | de broglie wavelength — physics standard library. | `deBroglieWavelength` |
| `electric_field(charge, distance)` | Browser / Node | electric field — physics standard library. | `electricField` |
| `escape_velocity(planetMass, planetRadius)` | Browser / Node | escape velocity — physics standard library. | `escapeVelocity` |
| `gravitational_force(m1, m2, distance)` | Browser / Node | gravitational force — physics standard library. | `gravitationalForce` |
| `gravitational_potential_energy(mass, height, g?)` | Browser / Node | gravitational potential energy — physics standard library. | `gravitationalPotentialEnergy` |
| `heat_transfer_conduction(thermalCond, area, tempDiff, thickness)` | Browser / Node | heat transfer conduction — physics standard library. | `heatTransferConduction` |
| `hookes_law_force(springConstant, displacement)` | Browser / Node | hookes law force — physics standard library. | `hookesLawForce` |
| `ideal_gas_pressure(moles, kelvin, volumeCubicMeters)` | Browser / Node | ideal gas pressure — physics standard library. | `idealGasPressure` |
| `kinetic_energy(mass, velocity)` | Browser / Node | kinetic energy — physics standard library. | `kineticEnergy` |
| `length_contraction(properLength, velocity)` | Browser / Node | length contraction — physics standard library. | `lengthContraction` |
| `lorentz_factor(velocity)` | Browser / Node | lorentz factor — physics standard library. | `lorentzFactor` |
| `momentum(mass, velocity)` | Browser / Node | momentum — physics standard library. | — |
| `ohms_law_current(voltageVolts, resistanceOhms)` | Browser / Node | ohms law current — physics standard library. | `ohmsLawCurrent` |
| `ohms_law_resistance(voltageVolts, currentAmps)` | Browser / Node | ohms law resistance — physics standard library. | `ohmsLawResistance` |
| `ohms_law_voltage(currentAmps, resistanceOhms)` | Browser / Node | ohms law voltage — physics standard library. | `ohmsLawVoltage` |
| `orbital_period_kepler(planetMass, orbitRadius)` | Browser / Node | orbital period kepler — physics standard library. | `orbitalPeriodKepler` |
| `orbital_velocity(planetMass, orbitRadius)` | Browser / Node | orbital velocity — physics standard library. | `orbitalVelocity` |
| `pendulum_period(lengthMeters, g?)` | Browser / Node | pendulum period — physics standard library. | `pendulumPeriod` |
| `photon_energy(frequencyHz)` | Browser / Node | photon energy — physics standard library. | `photonEnergy` |
| `power_watts(work, timeSeconds)` | Browser / Node | power watts — physics standard library. | `powerWatts` |
| `relativistic_energy(restMass, velocity?)` | Browser / Node | relativistic energy — physics standard library. | `relativisticEnergy` |
| `resistors_parallel(resistors)` | Browser / Node | resistors parallel — physics standard library. | `resistorsParallel` |
| `resistors_series(resistors)` | Browser / Node | resistors series — physics standard library. | `resistorsSeries` |
| `reynolds_number(density, velocity, charLength, dynamicViscosity)` | Browser / Node | reynolds number — physics standard library. | `reynoldsNumber` |
| `rlc_resonant_frequency(inductanceHenries, capacitanceFarads)` | Browser / Node | rlc resonant frequency — physics standard library. | `rlcResonantFrequency` |
| `schwarzschild_radius(mass)` | Browser / Node | schwarzschild radius — physics standard library. | `schwarzschildRadius` |
| `spring_potential_energy(springConstant, displacement)` | Browser / Node | spring potential energy — physics standard library. | `springPotentialEnergy` |
| `stefan_boltzmann_radiation(emissivity, area, tempKelvin)` | Browser / Node | stefan boltzmann radiation — physics standard library. | `stefanBoltzmannRadiation` |
| `time_dilation(properTime, velocity)` | Browser / Node | time dilation — physics standard library. | `timeDilation` |
| `work_done(force, distance, angleDeg?)` | Browser / Node | work done — physics standard library. | `workDone` |

## science

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `acceleration(vInit, vFinal, time)` | Browser / Node | acceleration — science standard library. | — |
| `atomic_mass(query)` | Browser / Node | atomic mass — science standard library. | `atomicMass` |
| `atomic_number(query)` | Browser / Node | atomic number — science standard library. | `atomicNumber` |
| `density(mass, volume)` | Browser / Node | density — science standard library. | — |
| `electrical_power(voltage, current)` | Browser / Node | electrical power — science standard library. | `electricalPower` |
| `element_name(query)` | Browser / Node | element name — science standard library. | `elementName` |
| `force(mass, accel)` | Browser / Node | force — science standard library. | — |
| `free_fall_time(height, g?)` | Browser / Node | free fall time — science standard library. | `freeFallTime` |
| `kinetic_energy(mass, velocity)` | Browser / Node | kinetic energy — science standard library. | `kineticEnergy` |
| `momentum(mass, velocity)` | Browser / Node | momentum — science standard library. | — |
| `ohms_current(voltage, resistance)` | Browser / Node | ohms current — science standard library. | `ohmsCurrent` |
| `ohms_resistance(voltage, current)` | Browser / Node | ohms resistance — science standard library. | `ohmsResistance` |
| `ohms_voltage(current, resistance)` | Browser / Node | ohms voltage — science standard library. | `ohmsVoltage` |
| `potential_energy(mass, height, g?)` | Browser / Node | potential energy — science standard library. | `potentialEnergy` |
| `power_watts(work, time)` | Browser / Node | power watts — science standard library. | `powerWatts` |
| `projectile_range(v0, angleDeg, g?)` | Browser / Node | projectile range — science standard library. | `projectileRange` |
| `speed(distance, time)` | Browser / Node | speed — science standard library. | — |
| `work_done(force, distance)` | Browser / Node | work done — science standard library. | `workDone` |

## server

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `cors_headers(origin?)` | Node | cors headers — server standard library. | `corsHeaders` |
| `deploy_server(port, handlerOrRouter?, host?)` | Node | Start a local HTTP server; pass an explicit bind address for LAN access. | `deployServer`, `deploy` |
| `get_all_ips()` | Node | get all ips — server standard library. | `getAllIps` |
| `get_hostname()` | Node | get hostname — server standard library. | `getHostname` |
| `get_local_ip()` | Node | get local ip — server standard library. | `getLocalIp`, `local_ip` |
| `get_public_ip()` | Node | get public ip — server standard library. | `getPublicIp`, `public_ip` |
| `html_response(html, status?)` | Node | html response — server standard library. | `htmlResponse` |
| `json_response(data, status?)` | Node | json response — server standard library. | `jsonResponse` |
| `parse_cookies(cookieHeader)` | Node | parse cookies — server standard library. | `parseCookies` |
| `parse_query_string(query)` | Node | parse query string — server standard library. | `parseQueryString` |
| `redirect_response(url, status?)` | Node | redirect response — server standard library. | `redirectResponse` |
| `server_memory_usage()` | Node | server memory usage — server standard library. | `serverMemoryUsage` |
| `server_uptime()` | Node | server uptime — server standard library. | `serverUptime` |
| `status_code_text(code)` | Node | status code text — server standard library. | `statusCodeText` |
| `stop_deployed_server()` | Node | stop deployed server — server standard library. | `stopDeployedServer` |
| `text_response(text, status?)` | Node | text response — server standard library. | `textResponse` |

## stats

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `correlation(listA, listB)` | Browser / Node | correlation — stats standard library. | — |
| `covariance(listA, listB)` | Browser / Node | covariance — stats standard library. | — |
| `cumulative_sum(list)` | Browser / Node | cumulative sum — stats standard library. | `cumulativeSum` |
| `frequency_table(list)` | Browser / Node | frequency table — stats standard library. | `frequencyTable` |
| `iqr(list)` | Browser / Node | iqr — stats standard library. | — |
| `linear_regression(xList, yList)` | Browser / Node | linear regression — stats standard library. | `linearRegression` |
| `mean(list)` | Browser / Node | mean — stats standard library. | — |
| `median(list)` | Browser / Node | median — stats standard library. | — |
| `mode(list)` | Browser / Node | mode — stats standard library. | — |
| `percentile(list, p)` | Browser / Node | percentile — stats standard library. | — |
| `product_of(list)` | Browser / Node | product of — stats standard library. | `productOf` |
| `quartiles(list)` | Browser / Node | quartiles — stats standard library. | — |
| `range_of(list)` | Browser / Node | range of — stats standard library. | `rangeOf` |
| `standard_deviation(list)` | Browser / Node | standard deviation — stats standard library. | `standardDeviation`, `stdev` |
| `variance(list)` | Browser / Node | variance — stats standard library. | — |
| `z_score(value, mean, stdev)` | Browser / Node | z score — stats standard library. | `zScore` |

## student

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `celsius_to_fahrenheit(c)` | Browser / Node | celsius to fahrenheit — student standard library. | `celsiusToFahrenheit` |
| `celsius_to_kelvin(c)` | Browser / Node | celsius to kelvin — student standard library. | `celsiusToKelvin` |
| `cm_to_inches(cm)` | Browser / Node | cm to inches — student standard library. | `cmToInches` |
| `fahrenheit_to_celsius(f)` | Browser / Node | fahrenheit to celsius — student standard library. | `fahrenheitToCelsius` |
| `feet_to_meters(ft)` | Browser / Node | feet to meters — student standard library. | `feetToMeters` |
| `gallons_to_liters(gal)` | Browser / Node | gallons to liters — student standard library. | `gallonsToLiters` |
| `gpa_from_grades(gradesList, creditsList)` | Browser / Node | gpa from grades — student standard library. | `gpaFromGrades` |
| `gpa_from_percentage(percentage)` | Browser / Node | gpa from percentage — student standard library. | `gpaFromPercentage` |
| `grams_to_ounces(g)` | Browser / Node | grams to ounces — student standard library. | `gramsToOunces` |
| `hours_to_minutes(h)` | Browser / Node | hours to minutes — student standard library. | `hoursToMinutes` |
| `inches_to_cm(in)` | Browser / Node | inches to cm — student standard library. | `inchesToCm` |
| `kelvin_to_celsius(k)` | Browser / Node | kelvin to celsius — student standard library. | `kelvinToCelsius` |
| `kg_to_pounds(kg)` | Browser / Node | kg to pounds — student standard library. | `kgToPounds` |
| `km_to_miles(km)` | Browser / Node | km to miles — student standard library. | `kmToMiles` |
| `letter_grade(percentage)` | Browser / Node | letter grade — student standard library. | `letterGrade` |
| `liters_to_gallons(l)` | Browser / Node | liters to gallons — student standard library. | `litersToGallons` |
| `meters_to_feet(m)` | Browser / Node | meters to feet — student standard library. | `metersToFeet` |
| `miles_to_km(miles)` | Browser / Node | miles to km — student standard library. | `milesToKm` |
| `minutes_to_seconds(m)` | Browser / Node | minutes to seconds — student standard library. | `minutesToSeconds` |
| `ounces_to_grams(oz)` | Browser / Node | ounces to grams — student standard library. | `ouncesToGrams` |
| `pounds_to_kg(lbs)` | Browser / Node | pounds to kg — student standard library. | `poundsToKg` |
| `weighted_score(scoresList, weightsList)` | Browser / Node | weighted score — student standard library. | `weightedScore` |

## system

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `banner(style?)` | Node | banner — system standard library. | — |
| `beep()` | Node | beep — system standard library. | — |
| `cpu_count()` | Node | cpu count — system standard library. | `cpuCount` |
| `deck_of_cards()` | Node | deck of cards — system standard library. | `deckOfCards` |
| `define_word(word)` | Node | define word — system standard library. | `defineWord` |
| `flashcard()` | Node | flashcard — system standard library. | — |
| `flip_coin()` | Node | flip coin — system standard library. | `flipCoin` |
| `from_json(json)` | Node | from json — system standard library. | `fromJson` |
| `generate_password(length?)` | Node | generate password — system standard library. | `generatePassword` |
| `get_env(key)` | Node | get env — system standard library. | `getEnv` |
| `hash_text(text, algo?)` | Node | hash text — system standard library. | `hashText` |
| `memory_usage()` | Node | memory usage — system standard library. | `memoryUsage` |
| `os_arch()` | Node | os arch — system standard library. | `osArch` |
| `os_platform()` | Node | os platform — system standard library. | `osPlatform` |
| `pick_card()` | Node | pick card — system standard library. | `pickCard` |
| `random_id(length?)` | Node | random id — system standard library. | `randomId` |
| `roll_dice(sides?, count?)` | Node | roll dice — system standard library. | `rollDice` |
| `to_json(value)` | Node | to json — system standard library. | `toJson` |
| `uuid()` | Node | uuid — system standard library. | — |

## tables

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `pearson_correlation(x, y)` | Browser / Node | pearson correlation — tables standard library. | `pearsonCorrelation` |
| `series_cumulative_sum(series)` | Browser / Node | series cumulative sum — tables standard library. | `seriesCumulativeSum` |
| `series_pct_change(series)` | Browser / Node | series pct change — tables standard library. | `seriesPctChange` |
| `series_rolling_mean(series, windowSize?)` | Browser / Node | series rolling mean — tables standard library. | `seriesRollingMean` |
| `series_rolling_sum(series, windowSize?)` | Browser / Node | series rolling sum — tables standard library. | `seriesRollingSum` |
| `series_z_score(series)` | Browser / Node | series z score — tables standard library. | `seriesZScore` |
| `student_t_test_one_sample(sample, mu?)` | Browser / Node | student t test one sample — tables standard library. | `studentTTestOneSample` |
| `table_add_column(table, colName, values)` | Browser / Node | table add column — tables standard library. | `tableAddColumn` |
| `table_column_names(table)` | Browser / Node | table column names — tables standard library. | `tableColumnNames`, `columns` |
| `table_deduplicate(table)` | Browser / Node | table deduplicate — tables standard library. | `tableDeduplicate` |
| `table_drop_column(table, colName)` | Browser / Node | table drop column — tables standard library. | `tableDropColumn` |
| `table_drop_nulls(table)` | Browser / Node | table drop nulls — tables standard library. | `tableDropNulls`, `drop_nulls` |
| `table_fill_nulls(table, fallback?)` | Browser / Node | table fill nulls — tables standard library. | `tableFillNulls`, `fill_nulls` |
| `table_group_by_count(table, groupCol)` | Browser / Node | table group by count — tables standard library. | `tableGroupByCount` |
| `table_group_by_sum(table, groupCol, sumCol)` | Browser / Node | table group by sum — tables standard library. | `tableGroupBySum` |
| `table_head(table, n?)` | Browser / Node | table head — tables standard library. | `tableHead`, `head` |
| `table_join_inner(tableA, tableB, keyCol)` | Browser / Node | table join inner — tables standard library. | `tableJoinInner`, `inner_join` |
| `table_select_columns(table, colNames)` | Browser / Node | table select columns — tables standard library. | `tableSelectColumns` |
| `table_tail(table, n?)` | Browser / Node | table tail — tables standard library. | `tableTail`, `tail` |

## testing

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `assert(condition, message?)` | Browser / Node | Fail the current program when the condition is false. | — |
| `assert_equal(actual, expected, message?)` | Browser / Node | Require two values to be deeply equal, including lists and dictionaries. | `assertEqual` |
| `assert_not_equal(actual, expected, message?)` | Browser / Node | Require two values to differ. | `assertNotEqual` |

## text

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `base64_decode(target)` | Browser / Node | Decode Base64 into UTF-8 text. | `base64Decode` |
| `base64_encode(target)` | Browser / Node | Encode UTF-8 text as Base64. | `base64Encode` |
| `bool(val)` | Browser / Node | bool — text standard library. | — |
| `caesar_cipher(target, shift)` | Browser / Node | caesar cipher — text standard library. | `caesarCipher` |
| `camel_case(target)` | Browser / Node | camel case — text standard library. | `camelCase` |
| `char_count(target, char)` | Browser / Node | char count — text standard library. | `charCount` |
| `contains(target, part)` | Browser / Node | contains — text standard library. | — |
| `count_consonants(target)` | Browser / Node | count consonants — text standard library. | `countConsonants` |
| `count_substring(target, needle)` | Browser / Node | count substring — text standard library. | `countSubstring` |
| `count_vowels(target)` | Browser / Node | count vowels — text standard library. | `countVowels` |
| `ends_with(target, part)` | Browser / Node | ends with — text standard library. | `endsWith` |
| `escape_html(target)` | Browser / Node | escape html — text standard library. | `escapeHtml` |
| `float(val)` | Browser / Node | float — text standard library. | — |
| `int(val)` | Browser / Node | int — text standard library. | — |
| `is_alpha(target)` | Browser / Node | is alpha — text standard library. | `isAlpha` |
| `is_alphanumeric(target)` | Browser / Node | is alphanumeric — text standard library. | `isAlphanumeric` |
| `is_digit(target)` | Browser / Node | is digit — text standard library. | `isDigit` |
| `is_lowercase(target)` | Browser / Node | is lowercase — text standard library. | `isLowercase` |
| `is_palindrome(target)` | Browser / Node | is palindrome — text standard library. | `isPalindrome` |
| `is_uppercase(target)` | Browser / Node | is uppercase — text standard library. | `isUppercase` |
| `join(...args)` | Browser / Node | join — text standard library. | — |
| `kebab_case(target)` | Browser / Node | kebab case — text standard library. | `kebabCase` |
| `length(val)` | Browser / Node | Count characters in text or elements in a list. | `len` |
| `line_count(target)` | Browser / Node | line count — text standard library. | `lineCount` |
| `lines(target)` | Browser / Node | lines — text standard library. | — |
| `lowercase(val)` | Browser / Node | lowercase — text standard library. | `lower` |
| `normalize_whitespace(target)` | Browser / Node | normalize whitespace — text standard library. | `normalizeWhitespace` |
| `pad_end(target, len, pad?)` | Browser / Node | pad end — text standard library. | `padEnd` |
| `pad_start(target, len, pad?)` | Browser / Node | pad start — text standard library. | `padStart` |
| `remove_punctuation(target)` | Browser / Node | remove punctuation — text standard library. | `removePunctuation` |
| `repeat_text(target, times)` | Browser / Node | repeat text — text standard library. | `repeatText` |
| `replace(target, oldPart, newPart)` | Browser / Node | replace — text standard library. | — |
| `reverse_text(target)` | Browser / Node | reverse text — text standard library. | `reverseText` |
| `slice_text(target, start, end?)` | Browser / Node | slice text — text standard library. | `sliceText` |
| `slugify(target)` | Browser / Node | slugify — text standard library. | — |
| `snake_case(target)` | Browser / Node | snake case — text standard library. | `snakeCase` |
| `split_text(target, delimiter)` | Browser / Node | split text — text standard library. | `splitText` |
| `starts_with(target, part)` | Browser / Node | starts with — text standard library. | `startsWith` |
| `str(val)` | Browser / Node | Convert a PLAIN value to readable text. | — |
| `string(val)` | Browser / Node | string — text standard library. | — |
| `strip_prefix(target, prefix)` | Browser / Node | strip prefix — text standard library. | `stripPrefix` |
| `strip_suffix(target, suffix)` | Browser / Node | strip suffix — text standard library. | `stripSuffix` |
| `title_case(target)` | Browser / Node | title case — text standard library. | `titleCase`, `capitalize` |
| `to_bool(val)` | Browser / Node | to bool — text standard library. | `toBool` |
| `to_float(val)` | Browser / Node | to float — text standard library. | `toFloat` |
| `to_int(val)` | Browser / Node | to int — text standard library. | `toInt` |
| `to_string(val)` | Browser / Node | to string — text standard library. | `toString` |
| `trim(target)` | Browser / Node | trim — text standard library. | — |
| `truncate_text(target, length, suffix?)` | Browser / Node | truncate text — text standard library. | `truncateText` |
| `type(val)` | Browser / Node | Return a value's runtime type name. | — |
| `unescape_html(target)` | Browser / Node | unescape html — text standard library. | `unescapeHtml` |
| `uppercase(val)` | Browser / Node | uppercase — text standard library. | `upper` |
| `word_count(target)` | Browser / Node | word count — text standard library. | `wordCount` |
| `words(target)` | Browser / Node | words — text standard library. | — |

## time

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `add_days(date, days)` | Browser / Node | add days — time standard library. | `addDays` |
| `current_day()` | Browser / Node | current day — time standard library. | `currentDay` |
| `current_hour()` | Browser / Node | current hour — time standard library. | `currentHour` |
| `current_minute()` | Browser / Node | current minute — time standard library. | `currentMinute` |
| `current_month()` | Browser / Node | current month — time standard library. | `currentMonth` |
| `current_month_name()` | Browser / Node | current month name — time standard library. | `currentMonthName` |
| `current_second()` | Browser / Node | current second — time standard library. | `currentSecond` |
| `current_time()` | Browser / Node | current time — time standard library. | `currentTime`, `now` |
| `current_year()` | Browser / Node | current year — time standard library. | `currentYear` |
| `day_of_week(date?)` | Browser / Node | day of week — time standard library. | `dayOfWeek` |
| `days_between(d1, d2)` | Browser / Node | days between — time standard library. | `daysBetween` |
| `days_in_month(year, month)` | Browser / Node | days in month — time standard library. | `daysInMonth` |
| `format_date(date, format)` | Browser / Node | format date — time standard library. | `formatDate` |
| `is_leap_year(year?)` | Browser / Node | is leap year — time standard library. | `isLeapYear` |
| `sleep(seconds)` | Browser / Node | Pause execution for a number of seconds. | `wait` |
| `timestamp()` | Browser / Node | timestamp — time standard library. | — |
| `today()` | Browser / Node | today — time standard library. | — |

## updater

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `author_name()` | Node | author name — updater standard library. | `authorName` |
| `check_for_updates()` | Node | check for updates — updater standard library. | `checkForUpdates` |
| `plain_version()` | Node | plain version — updater standard library. | `plainVersion`, `version` |
| `update_software()` | Node | update software — updater standard library. | `updateSoftware`, `update`, `upgrade` |

## web

| Function | Host | Description | Aliases |
| --- | --- | --- | --- |
| `html_page(title, body)` | Node | html page — web standard library. | `htmlPage` |
| `html_table(headers, rows)` | Node | html table — web standard library. | `htmlTable` |
| `html_tag(tag, content?, attrs?)` | Node | html tag — web standard library. | `htmlTag` |
| `http_get(url, headers?)` | Node | http get — web standard library. | `httpGet` |
| `http_post(url, body, headers?)` | Node | http post — web standard library. | `httpPost` |
| `parse_query_string(query)` | Node | parse query string — web standard library. | `parseQueryString` |
| `render_template(template, data)` | Node | render template — web standard library. | `renderTemplate` |
| `send_webhook(url, payload)` | Node | send webhook — web standard library. | `sendWebhook` |
| `serve_static_files(port, folder)` | Node | serve static files — web standard library. | `serveStaticFiles` |
| `start_server(port, handler)` | Node | Start an HTTP server that invokes a PLAIN request handler. | `startServer` |
| `stop_server()` | Node | stop server — web standard library. | `stopServer` |
