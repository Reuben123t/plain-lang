import { PlainValue } from "../runtime/values";
export declare function valuesEqual(left: PlainValue, right: PlainValue, visited?: WeakMap<object, object>): boolean;
export declare const testingBuiltins: {
    assert: (condition: PlainValue, message?: PlainValue) => boolean;
    assert_equal: (actual: PlainValue, expected: PlainValue, message?: PlainValue) => boolean;
    assert_not_equal: (actual: PlainValue, expected: PlainValue, message?: PlainValue) => boolean;
};
//# sourceMappingURL=testing.d.ts.map