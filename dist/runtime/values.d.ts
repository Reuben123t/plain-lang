import { Environment } from "./environment";
import { Statement } from "../ast/types";
export type PlainValue = number | string | boolean | null | PlainValue[] | PlainObject | PlainFunction;
export interface PlainObject {
    [key: string]: PlainValue;
}
export declare function isPlainObject(val: any): val is PlainObject;
export interface PlainFunction {
    type: "function";
    name: string;
    parameters: string[];
    body?: Statement[];
    closure?: Environment;
    nativeFn?: (...args: any[]) => any;
}
export declare function isPlainFunction(val: any): val is PlainFunction;
export declare function plainToString(value: PlainValue): string;
export declare function plainToBoolean(value: PlainValue): boolean;
export declare function getPlainTypeName(value: PlainValue): string;
//# sourceMappingURL=values.d.ts.map