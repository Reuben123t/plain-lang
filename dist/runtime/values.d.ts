import { Environment } from "./environment";
import { Statement } from "../ast/types";
export type PlainValue = number | string | boolean | null | PlainValue[] | PlainFunction;
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