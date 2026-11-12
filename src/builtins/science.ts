import { PlainValue, plainToString } from "../runtime/values";
import { mathBuiltins } from "./math";
import { PlainError } from "../errors/plain-error";

interface ElementData {
  number: number;
  name: string;
  mass: number;
}

const PERIODIC_TABLE: Record<string, ElementData> = {
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

function lookupElement(queryVal: PlainValue): ElementData {
  const query = plainToString(queryVal).trim().toUpperCase();
  if (PERIODIC_TABLE[query]) return PERIODIC_TABLE[query];

  for (const sym of Object.keys(PERIODIC_TABLE)) {
    if (PERIODIC_TABLE[sym].name.toUpperCase() === query) {
      return PERIODIC_TABLE[sym];
    }
  }

  throw new PlainError(`Element '${query}' not found in periodic table.`, { line: 1, column: 1 }, { kind: "RuntimeError" });
}

export const scienceBuiltins = {
  // Chemistry
  atomic_mass: (queryVal: PlainValue): number => {
    return lookupElement(queryVal).mass;
  },

  atomic_number: (queryVal: PlainValue): number => {
    return lookupElement(queryVal).number;
  },

  element_name: (queryVal: PlainValue): string => {
    return lookupElement(queryVal).name;
  },

  density: (massVal: PlainValue, volumeVal: PlainValue): number => {
    const v = mathBuiltins.to_number(volumeVal);
    if (v === 0) throw new PlainError("Volume cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(massVal) / v;
  },

  // Physics Formulas
  speed: (distanceVal: PlainValue, timeVal: PlainValue): number => {
    const t = mathBuiltins.to_number(timeVal);
    if (t === 0) throw new PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(distanceVal) / t;
  },

  acceleration: (vInitVal: PlainValue, vFinalVal: PlainValue, timeVal: PlainValue): number => {
    const t = mathBuiltins.to_number(timeVal);
    if (t === 0) throw new PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return (mathBuiltins.to_number(vFinalVal) - mathBuiltins.to_number(vInitVal)) / t;
  },

  force: (massVal: PlainValue, accelVal: PlainValue): number => {
    return mathBuiltins.to_number(massVal) * mathBuiltins.to_number(accelVal);
  },

  momentum: (massVal: PlainValue, velocityVal: PlainValue): number => {
    return mathBuiltins.to_number(massVal) * mathBuiltins.to_number(velocityVal);
  },

  kinetic_energy: (massVal: PlainValue, velocityVal: PlainValue): number => {
    const v = mathBuiltins.to_number(velocityVal);
    return 0.5 * mathBuiltins.to_number(massVal) * v * v;
  },

  potential_energy: (massVal: PlainValue, heightVal: PlainValue, gVal?: PlainValue): number => {
    const g = gVal ? mathBuiltins.to_number(gVal) : 9.80665;
    return mathBuiltins.to_number(massVal) * g * mathBuiltins.to_number(heightVal);
  },

  work_done: (forceVal: PlainValue, distanceVal: PlainValue): number => {
    return mathBuiltins.to_number(forceVal) * mathBuiltins.to_number(distanceVal);
  },

  power_watts: (workVal: PlainValue, timeVal: PlainValue): number => {
    const t = mathBuiltins.to_number(timeVal);
    if (t === 0) throw new PlainError("Time cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(workVal) / t;
  },

  ohms_voltage: (currentVal: PlainValue, resistanceVal: PlainValue): number => {
    return mathBuiltins.to_number(currentVal) * mathBuiltins.to_number(resistanceVal);
  },

  ohms_current: (voltageVal: PlainValue, resistanceVal: PlainValue): number => {
    const r = mathBuiltins.to_number(resistanceVal);
    if (r === 0) throw new PlainError("Resistance cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(voltageVal) / r;
  },

  ohms_resistance: (voltageVal: PlainValue, currentVal: PlainValue): number => {
    const i = mathBuiltins.to_number(currentVal);
    if (i === 0) throw new PlainError("Current cannot be zero.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return mathBuiltins.to_number(voltageVal) / i;
  },

  electrical_power: (voltageVal: PlainValue, currentVal: PlainValue): number => {
    return mathBuiltins.to_number(voltageVal) * mathBuiltins.to_number(currentVal);
  },

  free_fall_time: (heightVal: PlainValue, gVal?: PlainValue): number => {
    const h = mathBuiltins.to_number(heightVal);
    const g = gVal ? mathBuiltins.to_number(gVal) : 9.80665;
    if (h < 0) throw new PlainError("Height cannot be negative.", { line: 1, column: 1 }, { kind: "RuntimeError" });
    return Math.sqrt((2 * h) / g);
  },

  projectile_range: (v0Val: PlainValue, angleDegVal: PlainValue, gVal?: PlainValue): number => {
    const v0 = mathBuiltins.to_number(v0Val);
    const rad = (2 * mathBuiltins.to_number(angleDegVal) * Math.PI) / 180;
    const g = gVal ? mathBuiltins.to_number(gVal) : 9.80665;
    return (v0 * v0 * Math.sin(rad)) / g;
  }
};
