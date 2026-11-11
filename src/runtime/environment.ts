import { PlainValue } from "./values";
import { PlainError, SourceLocation } from "../errors/plain-error";

export class Environment {
  private variables = new Map<string, PlainValue>();
  private parent?: Environment;

  constructor(parent?: Environment) {
    this.parent = parent;
  }

  public define(name: string, value: PlainValue): void {
    const key = name.toLowerCase();
    this.variables.set(key, value);
  }

  public assign(name: string, value: PlainValue): void {
    const key = name.toLowerCase();
    if (this.variables.has(key)) {
      this.variables.set(key, value);
      return;
    }

    if (this.parent) {
      this.parent.assign(name, value);
      return;
    }

    // Default to defining in current scope if not found in ancestors
    this.variables.set(key, value);
  }

  public lookup(name: string, location?: SourceLocation, sourceCode?: string): PlainValue {
    const key = name.toLowerCase();
    if (this.variables.has(key)) {
      return this.variables.get(key)!;
    }

    if (this.parent) {
      return this.parent.lookup(name, location, sourceCode);
    }

    // Not found anywhere
    const available = this.getAllVariableNames();
    const suggestion = this.findClosestMatch(name, available);

    const loc: SourceLocation = location || { line: 1, column: 1 };
    throw new PlainError(
      `I couldn't find a variable or function named '${name}'.`,
      loc,
      {
        kind: "NameError",
        sourceCode,
        suggestion: suggestion
          ? `Did you mean '${suggestion}'?`
          : `Make sure '${name}' was created with 'set ${name} to ...' before using it.`
      }
    );
  }

  public has(name: string): boolean {
    const key = name.toLowerCase();
    if (this.variables.has(key)) return true;
    return this.parent ? this.parent.has(name) : false;
  }

  public getAllVariableNames(): string[] {
    const names = new Set<string>();
    for (const key of this.variables.keys()) {
      names.add(key);
    }
    if (this.parent) {
      for (const key of this.parent.getAllVariableNames()) {
        names.add(key);
      }
    }
    return Array.from(names);
  }

  private findClosestMatch(target: string, candidates: string[]): string | undefined {
    const t = target.toLowerCase();
    let bestMatch: string | undefined;
    let minDistance = 3; // threshold

    for (const candidate of candidates) {
      const dist = this.levenshtein(t, candidate);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = candidate;
      }
    }

    return bestMatch;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

