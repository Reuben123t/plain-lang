"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.algorithmsBuiltins = void 0;
exports.algorithmsBuiltins = {
    // 1. Searching Algorithms
    binary_search: (sortedList, target) => {
        const arr = Array.isArray(sortedList) ? sortedList : [];
        let low = 0;
        let high = arr.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (arr[mid] === target)
                return mid;
            if (arr[mid] < target)
                low = mid + 1;
            else
                high = mid - 1;
        }
        return -1;
    },
    linear_search: (list, target) => {
        const arr = Array.isArray(list) ? list : [];
        return arr.indexOf(target);
    },
    // 2. Sorting Algorithms
    quick_sort: (list) => {
        const arr = Array.isArray(list) ? [...list] : [];
        if (arr.length <= 1)
            return arr;
        const pivot = arr[Math.floor(arr.length / 2)];
        const left = arr.filter((x) => x < pivot);
        const middle = arr.filter((x) => x === pivot);
        const right = arr.filter((x) => x > pivot);
        return [
            ...exports.algorithmsBuiltins.quick_sort(left),
            ...middle,
            ...exports.algorithmsBuiltins.quick_sort(right)
        ];
    },
    merge_sort: (list) => {
        const arr = Array.isArray(list) ? [...list] : [];
        if (arr.length <= 1)
            return arr;
        const mid = Math.floor(arr.length / 2);
        const left = exports.algorithmsBuiltins.merge_sort(arr.slice(0, mid));
        const right = exports.algorithmsBuiltins.merge_sort(arr.slice(mid));
        const result = [];
        let l = 0, r = 0;
        while (l < left.length && r < right.length) {
            if (left[l] <= right[r]) {
                result.push(left[l++]);
            }
            else {
                result.push(right[r++]);
            }
        }
        return [...result, ...left.slice(l), ...right.slice(r)];
    },
    bubble_sort: (list) => {
        const arr = Array.isArray(list) ? [...list] : [];
        const n = arr.length;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    const temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    },
    insertion_sort: (list) => {
        const arr = Array.isArray(list) ? [...list] : [];
        for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
        return arr;
    },
    // 3. Graph Algorithms
    graph_create: () => ({ _type: "Graph", nodes: [], adjacency: {} }),
    graph_add_edge: (graph, from, to, weight = 1) => {
        if (!graph || typeof graph !== "object")
            return {};
        const adj = graph.adjacency || {};
        const u = String(from);
        const v = String(to);
        if (!adj[u])
            adj[u] = [];
        if (!adj[v])
            adj[v] = [];
        adj[u].push({ node: v, weight: Number(weight) });
        const nodes = Array.from(new Set([...(graph.nodes || []), u, v]));
        return { ...graph, nodes, adjacency: adj };
    },
    graph_bfs: (graph, startNode) => {
        if (!graph || !graph.adjacency)
            return [];
        const start = String(startNode);
        const visited = new Set();
        const queue = [start];
        const order = [];
        visited.add(start);
        while (queue.length > 0) {
            const current = queue.shift();
            order.push(current);
            const neighbors = graph.adjacency[current] || [];
            for (const edge of neighbors) {
                if (!visited.has(edge.node)) {
                    visited.add(edge.node);
                    queue.push(edge.node);
                }
            }
        }
        return order;
    },
    graph_dfs: (graph, startNode) => {
        if (!graph || !graph.adjacency)
            return [];
        const start = String(startNode);
        const visited = new Set();
        const order = [];
        const dfs = (node) => {
            visited.add(node);
            order.push(node);
            const neighbors = graph.adjacency[node] || [];
            for (const edge of neighbors) {
                if (!visited.has(edge.node)) {
                    dfs(edge.node);
                }
            }
        };
        dfs(start);
        return order;
    },
    graph_dijkstra: (graph, startNode) => {
        if (!graph || !graph.adjacency)
            return {};
        const start = String(startNode);
        const distances = {};
        const visited = new Set();
        for (const node of graph.nodes || []) {
            distances[node] = Infinity;
        }
        distances[start] = 0;
        const unvisited = new Set(graph.nodes || [start]);
        while (unvisited.size > 0) {
            let minNode = null;
            let minDistance = Infinity;
            for (const node of unvisited) {
                if (distances[node] < minDistance) {
                    minDistance = distances[node];
                    minNode = node;
                }
            }
            if (!minNode || minDistance === Infinity)
                break;
            unvisited.delete(minNode);
            const neighbors = graph.adjacency[minNode] || [];
            for (const edge of neighbors) {
                if (unvisited.has(edge.node)) {
                    const newDist = distances[minNode] + edge.weight;
                    if (newDist < distances[edge.node]) {
                        distances[edge.node] = newDist;
                    }
                }
            }
        }
        return distances;
    },
    // 4. Dynamic Programming & Combinatorics
    fibonacci_nth: (n) => {
        const num = Math.floor(Number(n));
        if (num <= 0)
            return 0;
        if (num === 1)
            return 1;
        let a = 0, b = 1;
        for (let i = 2; i <= num; i++) {
            const c = a + b;
            a = b;
            b = c;
        }
        return b;
    },
    longest_common_subsequence: (s1, s2) => {
        const str1 = String(s1);
        const str2 = String(s2);
        const m = str1.length;
        const n = str2.length;
        const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                }
                else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[m][n];
    },
    knapsack_01: (weights, values, capacity) => {
        const w = Array.isArray(weights) ? weights.map(Number) : [];
        const v = Array.isArray(values) ? values.map(Number) : [];
        const cap = Math.floor(Number(capacity));
        const n = Math.min(w.length, v.length);
        const dp = Array.from({ length: n + 1 }, () => new Array(cap + 1).fill(0));
        for (let i = 1; i <= n; i++) {
            for (let j = 0; j <= cap; j++) {
                if (w[i - 1] <= j) {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i - 1][j - w[i - 1]] + v[i - 1]);
                }
                else {
                    dp[i][j] = dp[i - 1][j];
                }
            }
        }
        return dp[n][cap];
    },
    combinations_count: (n, k) => {
        const N = Math.floor(Number(n));
        const K = Math.floor(Number(k));
        if (K < 0 || K > N)
            return 0;
        if (K === 0 || K === N)
            return 1;
        let res = 1;
        for (let i = 1; i <= K; i++) {
            res = (res * (N - i + 1)) / i;
        }
        return Math.round(res);
    },
    permutations_count: (n, k) => {
        const N = Math.floor(Number(n));
        const K = Math.floor(Number(k));
        if (K < 0 || K > N)
            return 0;
        let res = 1;
        for (let i = 0; i < K; i++) {
            res *= N - i;
        }
        return res;
    }
};
//# sourceMappingURL=algorithms.js.map