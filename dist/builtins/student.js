"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentBuiltins = void 0;
const math_1 = require("./math");
const plain_error_1 = require("../errors/plain-error");
exports.studentBuiltins = {
    // Grades & GPA
    letter_grade: (percentageVal) => {
        const score = math_1.mathBuiltins.to_number(percentageVal);
        if (score >= 97)
            return "A+";
        if (score >= 93)
            return "A";
        if (score >= 90)
            return "A-";
        if (score >= 87)
            return "B+";
        if (score >= 83)
            return "B";
        if (score >= 80)
            return "B-";
        if (score >= 77)
            return "C+";
        if (score >= 73)
            return "C";
        if (score >= 70)
            return "C-";
        if (score >= 67)
            return "D+";
        if (score >= 60)
            return "D";
        return "F";
    },
    gpa_from_percentage: (percentageVal) => {
        const score = math_1.mathBuiltins.to_number(percentageVal);
        if (score >= 93)
            return 4.0;
        if (score >= 90)
            return 3.7;
        if (score >= 87)
            return 3.3;
        if (score >= 83)
            return 3.0;
        if (score >= 80)
            return 2.7;
        if (score >= 77)
            return 2.3;
        if (score >= 73)
            return 2.0;
        if (score >= 70)
            return 1.7;
        if (score >= 67)
            return 1.3;
        if (score >= 60)
            return 1.0;
        return 0.0;
    },
    gpa_from_grades: (gradesListVal, creditsListVal) => {
        if (!Array.isArray(gradesListVal) || !Array.isArray(creditsListVal)) {
            throw new plain_error_1.PlainError("'gpa_from_grades' expects two lists: grades and credits.", { line: 1, column: 1 }, { kind: "TypeError" });
        }
        if (gradesListVal.length !== creditsListVal.length || gradesListVal.length === 0) {
            throw new plain_error_1.PlainError("Grade and credit lists must be non-empty and of equal length.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        let totalPoints = 0;
        let totalCredits = 0;
        for (let i = 0; i < gradesListVal.length; i++) {
            const g = math_1.mathBuiltins.to_number(gradesListVal[i]);
            const c = math_1.mathBuiltins.to_number(creditsListVal[i]);
            totalPoints += g * c;
            totalCredits += c;
        }
        if (totalCredits === 0)
            return 0;
        return Math.round((totalPoints / totalCredits) * 100) / 100;
    },
    weighted_score: (scoresListVal, weightsListVal) => {
        if (!Array.isArray(scoresListVal) || !Array.isArray(weightsListVal)) {
            throw new plain_error_1.PlainError("'weighted_score' expects two lists: scores and weights.", { line: 1, column: 1 }, { kind: "TypeError" });
        }
        if (scoresListVal.length !== weightsListVal.length || scoresListVal.length === 0) {
            throw new plain_error_1.PlainError("Scores and weights lists must be non-empty and of equal length.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        }
        let weightedSum = 0;
        let totalWeight = 0;
        for (let i = 0; i < scoresListVal.length; i++) {
            const s = math_1.mathBuiltins.to_number(scoresListVal[i]);
            const w = math_1.mathBuiltins.to_number(weightsListVal[i]);
            weightedSum += s * w;
            totalWeight += w;
        }
        if (totalWeight === 0)
            return 0;
        return weightedSum / totalWeight;
    },
    // Temperature Conversions
    celsius_to_fahrenheit: (cVal) => {
        return (math_1.mathBuiltins.to_number(cVal) * 9) / 5 + 32;
    },
    fahrenheit_to_celsius: (fVal) => {
        return ((math_1.mathBuiltins.to_number(fVal) - 32) * 5) / 9;
    },
    celsius_to_kelvin: (cVal) => {
        return math_1.mathBuiltins.to_number(cVal) + 273.15;
    },
    kelvin_to_celsius: (kVal) => {
        return math_1.mathBuiltins.to_number(kVal) - 273.15;
    },
    // Distance Conversions
    km_to_miles: (kmVal) => {
        return math_1.mathBuiltins.to_number(kmVal) * 0.621371;
    },
    miles_to_km: (milesVal) => {
        return math_1.mathBuiltins.to_number(milesVal) / 0.621371;
    },
    meters_to_feet: (mVal) => {
        return math_1.mathBuiltins.to_number(mVal) * 3.28084;
    },
    feet_to_meters: (ftVal) => {
        return math_1.mathBuiltins.to_number(ftVal) / 3.28084;
    },
    cm_to_inches: (cmVal) => {
        return math_1.mathBuiltins.to_number(cmVal) / 2.54;
    },
    inches_to_cm: (inVal) => {
        return math_1.mathBuiltins.to_number(inVal) * 2.54;
    },
    // Mass / Weight Conversions
    kg_to_pounds: (kgVal) => {
        return math_1.mathBuiltins.to_number(kgVal) * 2.20462;
    },
    pounds_to_kg: (lbsVal) => {
        return math_1.mathBuiltins.to_number(lbsVal) / 2.20462;
    },
    grams_to_ounces: (gVal) => {
        return math_1.mathBuiltins.to_number(gVal) / 28.3495;
    },
    ounces_to_grams: (ozVal) => {
        return math_1.mathBuiltins.to_number(ozVal) * 28.3495;
    },
    // Volume Conversions
    liters_to_gallons: (lVal) => {
        return math_1.mathBuiltins.to_number(lVal) * 0.264172;
    },
    gallons_to_liters: (galVal) => {
        return math_1.mathBuiltins.to_number(galVal) / 0.264172;
    },
    // Time unit conversions
    hours_to_minutes: (hVal) => {
        return math_1.mathBuiltins.to_number(hVal) * 60;
    },
    minutes_to_seconds: (mVal) => {
        return math_1.mathBuiltins.to_number(mVal) * 60;
    }
};
//# sourceMappingURL=student.js.map