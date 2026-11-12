import { PlainValue } from "../runtime/values";
export declare const studentBuiltins: {
    letter_grade: (percentageVal: PlainValue) => string;
    gpa_from_percentage: (percentageVal: PlainValue) => number;
    gpa_from_grades: (gradesListVal: PlainValue, creditsListVal: PlainValue) => number;
    weighted_score: (scoresListVal: PlainValue, weightsListVal: PlainValue) => number;
    celsius_to_fahrenheit: (cVal: PlainValue) => number;
    fahrenheit_to_celsius: (fVal: PlainValue) => number;
    celsius_to_kelvin: (cVal: PlainValue) => number;
    kelvin_to_celsius: (kVal: PlainValue) => number;
    km_to_miles: (kmVal: PlainValue) => number;
    miles_to_km: (milesVal: PlainValue) => number;
    meters_to_feet: (mVal: PlainValue) => number;
    feet_to_meters: (ftVal: PlainValue) => number;
    cm_to_inches: (cmVal: PlainValue) => number;
    inches_to_cm: (inVal: PlainValue) => number;
    kg_to_pounds: (kgVal: PlainValue) => number;
    pounds_to_kg: (lbsVal: PlainValue) => number;
    grams_to_ounces: (gVal: PlainValue) => number;
    ounces_to_grams: (ozVal: PlainValue) => number;
    liters_to_gallons: (lVal: PlainValue) => number;
    gallons_to_liters: (galVal: PlainValue) => number;
    hours_to_minutes: (hVal: PlainValue) => number;
    minutes_to_seconds: (mVal: PlainValue) => number;
};
//# sourceMappingURL=student.d.ts.map