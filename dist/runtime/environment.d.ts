import { PlainValue } from "./values";
import { SourceLocation } from "../errors/plain-error";
export declare class Environment {
    private variables;
    private parent?;
    constructor(parent?: Environment);
    define(name: string, value: PlainValue): void;
    assign(name: string, value: PlainValue): void;
    lookup(name: string, location?: SourceLocation, sourceCode?: string): PlainValue;
    has(name: string): boolean;
    getAllVariableNames(): string[];
    private findClosestMatch;
    private levenshtein;
}
//# sourceMappingURL=environment.d.ts.map