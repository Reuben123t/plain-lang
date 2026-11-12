"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scienceBuiltins = void 0;
const values_1 = require("../runtime/values");
const math_1 = require("./math");
const plain_error_1 = require("../errors/plain-error");
const PERIODIC_TABLE = {
    H: { number: 1, name: "Hydrogen", mass: 1.008 },
    HE: { number: 2, name: "Helium", mass: 4.0026 },
    LI: { number: 3, name: "Lithium", mass: 6.94 },
    BE: { number: 4, name: "Beryllium", mass: 9.0122 },
    B: { number: 5, name: "Boron", mass: 10.81 },
    C: { number: 6, name: "Carbon", mass: 12.011 },
    N: { number: 7, name: "Nitrogen", mass: 14.007 },
    O: { number: 8, name: "Oxygen", mass: 15.999 },
    F: { number: 9, name: "Fluorine", mass: 18.998 },
    NE: { number: 10, name: "Neon", mass: 20.180 },
    NA: { number: 11, name: "Sodium", mass: 22.990 },
    MG: { number: 12, name: "Magnesium", mass: 24.305 },
    AL: { number: 13, name: "Aluminium", mass: 26.982 },
    SI: { number: 14, name: "Silicon", mass: 28.085 },
    P: { number: 15, name: "Phosphorus", mass: 30.974 },
    S: { number: 16, name: "Sulfur", mass: 32.06 },
    CL: { number: 17, name: "Chlorine", mass: 35.45 },
    AR: { number: 18, name: "Argon", mass: 39.948 },
    K: { number: 19, name: "Potassium", mass: 39.098 },
    CA: { number: 20, name: "Calcium", mass: 40.078 },
    TI: { number: 22, name: "Titanium", mass: 47.867 },
    CR: { number: 24, name: "Chromium", mass: 51.996 },
    MN: { number: 25, name: "Manganese", mass: 54.938 },
    FE: { number: 26, name: "Iron", mass: 55.845 },
    CO: { number: 27, name: "Cobalt", mass: 58.933 },
    NI: { number: 28, name: "Nickel", mass: 58.693 },
    CU: { number: 29, name: "Copper", mass: 63.546 },
    ZN: { number: 30, name: "Zinc", mass: 65.38 },
    BR: { number: 35, name: "Bromine", mass: 79.904 },
    AG: { number: 47, name: "Silver", mass: 107.87 },
    SN: { number: 50, name: "Tin", mass: 118.71 },
    I: { number: 53, name: "Iodine", mass: 126.90 },
    PT: { number: 78, name: "Platinum", mass: 195.08 },
    AU: { number: 79, name: "Gold", mass: 196.97 },
    HG: { number: 80, name: "Mercury", mass: 200.59 },
    PB: { number: 82, name: "Lead", mass: 207.2 },
    U: { number: 92, name: "Uranium", mass: 238.03 }
};
function lookupElement(queryVal) {
    const query = (0, values_1.plainToString)(queryVal).trim().toUpperCase();
    if (PERIODIC_TABLE[query])
        return PERIODIC_TABLE[query];
    for (const sym of Object.keys(PERIODIC_TABLE)) {
        if (PERIODIC_TABLE[sym].name.toUpperCase() === query) {
            return PERIODIC_TABLE[sym];
        }
    }
    throw new plain_error_1.PlainError(`Element '${query}' not found in periodic table.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
}
exports.scienceBuiltins = {
    // Chemistry
    atomic_mass: (queryVal) => {
        return lookupElement(queryVal).mass;
    },
    atomic_number: (queryVal) => {
        return lookupElement(queryVal).number;
    },
    element_name: (queryVal) => {
        return lookupElement(queryVal).name;
    },
    density: (massVal, volumeVal) => {
        const v = math_1.mathBuiltins.to_number(volumeVal);
        if (v === 0)
            throw new plain_error_1.PlainError("Volume cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return math_1.mathBuiltins.to_number(massVal) / v;
    },
    // Physics Formulas
    speed: (distanceVal, timeVal) => {
        const t = math_1.mathBuiltins.to_number(timeVal);
        if (t === 0)
            throw new plain_error_1.PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return math_1.mathBuiltins.to_number(distanceVal) / t;
    },
    acceleration: (vInitVal, vFinalVal, timeVal) => {
        const t = math_1.mathBuiltins.to_number(timeVal);
        if (t === 0)
            throw new plain_error_1.PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return (math_1.mathBuiltins.to_number(vFinalVal) - math_1.mathBuiltins.to_number(vInitVal)) / t;
    },
    force: (massVal, accelVal) => {
        return math_1.mathBuiltins.to_number(massVal) * math_1.mathBuiltins.to_number(accelVal);
    },
    momentum: (massVal, velocityVal) => {
        return math_1.mathBuiltins.to_number(massVal) * math_1.mathBuiltins.to_number(velocityVal);
    },
    kinetic_energy: (massVal, velocityVal) => {
        const v = math_1.mathBuiltins.to_number(velocityVal);
        return 0.5 * math_1.mathBuiltins.to_number(massVal) * v * v;
    },
    potential_energy: (massVal, heightVal, gVal) => {
        const g = gVal ? math_1.mathBuiltins.to_number(gVal) : 9.80665;
        return math_1.mathBuiltins.to_number(massVal) * g * math_1.mathBuiltins.to_number(heightVal);
    },
    work_done: (forceVal, distanceVal) => {
        return math_1.mathBuiltins.to_number(forceVal) * math_1.mathBuiltins.to_number(distanceVal);
    },
    power_watts: (workVal, timeVal) => {
        const t = math_1.mathBuiltins.to_number(timeVal);
        if (t === 0)
            throw new plain_error_1.PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return math_1.mathBuiltins.to_number(workVal) / t;
    },
    ohms_voltage: (currentVal, resistanceVal) => {
        return math_1.mathBuiltins.to_number(currentVal) * math_1.mathBuiltins.to_number(resistanceVal);
    },
    ohms_current: (voltageVal, resistanceVal) => {
        const r = math_1.mathBuiltins.to_number(resistanceVal);
        if (r === 0)
            throw new plain_error_1.PlainError("Resistance cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return math_1.mathBuiltins.to_number(voltageVal) / r;
    },
    ohms_resistance: (voltageVal, currentVal) => {
        const i = math_1.mathBuiltins.to_number(currentVal);
        if (i === 0)
            throw new plain_error_1.PlainError("Current cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return math_1.mathBuiltins.to_number(voltageVal) / i;
    },
    electrical_power: (voltageVal, currentVal) => {
        return math_1.mathBuiltins.to_number(voltageVal) * math_1.mathBuiltins.to_number(currentVal);
    },
    free_fall_time: (heightVal, gVal) => {
        const h = math_1.mathBuiltins.to_number(heightVal);
        const g = gVal ? math_1.mathBuiltins.to_number(gVal) : 9.80665;
        if (h < 0)
            throw new plain_error_1.PlainError("Height cannot be negative.", { line: 1, column: 1 }, { kind: "RuntimeError" });
        return Math.sqrt((2 * h) / g);
    },
    projectile_range: (v0Val, angleDegVal, gVal) => {
        const v0 = math_1.mathBuiltins.to_number(v0Val);
        const rad = (2 * math_1.mathBuiltins.to_number(angleDegVal) * Math.PI) / 180;
        const g = gVal ? math_1.mathBuiltins.to_number(gVal) : 9.80665;
        return (v0 * v0 * Math.sin(rad)) / g;
    }
};
//# sourceMappingURL=science.js.map