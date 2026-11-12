import { PlainValue } from "../runtime/values";
export declare const timeBuiltins: {
    today: () => string;
    current_time: () => string;
    current_year: () => number;
    current_month: () => number;
    current_month_name: () => string;
    current_day: () => number;
    current_hour: () => number;
    current_minute: () => number;
    current_second: () => number;
    timestamp: () => number;
    day_of_week: (dateVal?: PlainValue) => string;
    is_leap_year: (yearVal?: PlainValue) => boolean;
    days_in_month: (yearVal: PlainValue, monthVal: PlainValue) => number;
    days_between: (d1Val: PlainValue, d2Val: PlainValue) => number;
    add_days: (dateVal: PlainValue, daysVal: PlainValue) => string;
    format_date: (dateVal: PlainValue, formatVal: PlainValue) => string;
    sleep: (secondsVal: PlainValue) => Promise<void>;
};
//# sourceMappingURL=time.d.ts.map