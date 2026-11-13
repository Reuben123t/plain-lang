import { PlainObject, PlainValue } from "../runtime/values";
export declare const algorithmsBuiltins: {
    binary_search: (sortedList: any, target: any) => number;
    linear_search: (list: any, target: any) => number;
    quick_sort: (list: any) => PlainValue[];
    merge_sort: (list: any) => PlainValue[];
    bubble_sort: (list: any) => PlainValue[];
    insertion_sort: (list: any) => PlainValue[];
    graph_create: () => PlainObject;
    graph_add_edge: (graph: any, from: string, to: string, weight?: number) => PlainObject;
    graph_bfs: (graph: any, startNode: string) => string[];
    graph_dfs: (graph: any, startNode: string) => string[];
    graph_dijkstra: (graph: any, startNode: string) => PlainObject;
    fibonacci_nth: (n: number) => number;
    longest_common_subsequence: (s1: string, s2: string) => number;
    knapsack_01: (weights: any, values: any, capacity: number) => number;
    combinations_count: (n: number, k: number) => number;
    permutations_count: (n: number, k: number) => number;
};
//# sourceMappingURL=algorithms.d.ts.map