import { PlainValue } from "../runtime/values";
export declare const timeBuiltins: {
    today: () => string;
    current_time: () => string;
    days_between: (d1Val: PlainValue, d2Val: PlainValue) => number;
    sleep: (secondsVal: PlainValue) => Promise<void>;
};
//# sourceMappingURL=time.d.ts.map