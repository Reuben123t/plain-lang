import type { PlainValue } from "./values";
import { SourceLocation } from "../errors/plain-error";
export declare class Environment {
    private variables;
    private parent?;
    private assignmentBoundary;
    constructor(parent?: Environment, assignmentBoundary?: boolean);
    define(name: string, value: PlainValue): void;
    assign(name: string, value: PlainValue): void;
    private findAssignmentOwner;
    lookup(name: string, location?: SourceLocation, sourceCode?: string): PlainValue;
    has(name: string): boolean;
    getOwnVariableNames(): string[];
    getAllVariableNames(): string[];
    private findClosestMatch;
    private levenshtein;
}
//# sourceMappingURL=environment.d.ts.map