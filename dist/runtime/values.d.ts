import { Environment } from "./environment";
import type { Statement } from "../ast/types";
import { SourceLocation } from "../errors/plain-error";
export type PlainValue = number | string | boolean | null | PlainValue[] | PlainObject | PlainFunction;
export interface PlainObject {
    [key: string]: PlainValue;
}
export declare function isPlainObject(val: unknown): val is PlainObject;
export declare function hasOwnProperty(value: object, key: PropertyKey): boolean;
export declare function createPlainObject(): PlainObject;
export declare function getOwnProperty(value: PlainObject, key: string): PlainValue;
export declare function setOwnProperty(value: PlainObject, key: string, item: PlainValue): void;
export interface PlainFunction {
    type: "function";
    name: string;
    parameters: string[];
    body?: Statement[];
    closure?: Environment;
    nativeFn?: (...args: any[]) => any;
}
export declare function isPlainFunction(val: unknown): val is PlainFunction;
export declare function plainToNumber(value: PlainValue, location?: SourceLocation, sourceCode?: string): number;
export declare function plainToString(value: PlainValue): string;
export declare function plainToBoolean(value: PlainValue): boolean;
export declare function getPlainTypeName(value: PlainValue): string;
//# sourceMappingURL=values.d.ts.map