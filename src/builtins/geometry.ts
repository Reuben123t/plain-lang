import { PlainValue } from "../runtime/values";
import { mathBuiltins } from "./math";
import { PlainError } from "../errors/plain-error";

export const geometryBuiltins = {
  hypotenuse: (aVal: PlainValue, bVal: PlainValue): number => {
    const a = mathBuiltins.to_number(aVal);
    const b = mathBuiltins.to_number(bVal);
    return Math.sqrt(a * a + b * b);
  },

  distance_2d: (x1: PlainValue, y1: PlainValue, x2: PlainValue, y2: PlainValue): number => {
    const dx = mathBuiltins.to_number(x2) - mathBuiltins.to_number(x1);
    const dy = mathBuiltins.to_number(y2) - mathBuiltins.to_number(y1);
    return Math.sqrt(dx * dx + dy * dy);
  },

  distance_3d: (x1: PlainValue, y1: PlainValue, z1: PlainValue, x2: PlainValue, y2: PlainValue, z2: PlainValue): number => {
    const dx = mathBuiltins.to_number(x2) - mathBuiltins.to_number(x1);
    const dy = mathBuiltins.to_number(y2) - mathBuiltins.to_number(y1);
    const dz = mathBuiltins.to_number(z2) - mathBuiltins.to_number(z1);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  area_circle: (radiusVal: PlainValue): number => {
    const r = mathBuiltins.to_number(radiusVal);
    return Math.PI * r * r;
  },

  circumference_circle: (radiusVal: PlainValue): number => {
    const r = mathBuiltins.to_number(radiusVal);
    return 2 * Math.PI * r;
  },

  area_triangle: (baseVal: PlainValue, heightVal: PlainValue): number => {
    return 0.5 * mathBuiltins.to_number(baseVal) * mathBuiltins.to_number(heightVal);
  },

  area_rectangle: (lengthVal: PlainValue, widthVal: PlainValue): number => {
    return mathBuiltins.to_number(lengthVal) * mathBuiltins.to_number(widthVal);
  },

  perimeter_rectangle: (lengthVal: PlainValue, widthVal: PlainValue): number => {
    return 2 * (mathBuiltins.to_number(lengthVal) + mathBuiltins.to_number(widthVal));
  },

  area_trapezoid: (base1Val: PlainValue, base2Val: PlainValue, heightVal: PlainValue): number => {
    const b1 = mathBuiltins.to_number(base1Val);
    const b2 = mathBuiltins.to_number(base2Val);
    const h = mathBuiltins.to_number(heightVal);
    return 0.5 * (b1 + b2) * h;
  },

  volume_cube: (sideVal: PlainValue): number => {
    const s = mathBuiltins.to_number(sideVal);
    return s * s * s;
  },

  volume_sphere: (radiusVal: PlainValue): number => {
    const r = mathBuiltins.to_number(radiusVal);
    return (4 / 3) * Math.PI * Math.pow(r, 3);
  },

  surface_area_sphere: (radiusVal: PlainValue): number => {
    const r = mathBuiltins.to_number(radiusVal);
    return 4 * Math.PI * r * r;
  },

  volume_cylinder: (radiusVal: PlainValue, heightVal: PlainValue): number => {
    const r = mathBuiltins.to_number(radiusVal);
    const h = mathBuiltins.to_number(heightVal);
    return Math.PI * r * r * h;
  },

  surface_area_cylinder: (radiusVal: PlainValue, heightVal: PlainValue): number => {
    const r = mathBuiltins.to_number(radiusVal);
    const h = mathBuiltins.to_number(heightVal);
    return 2 * Math.PI * r * h + 2 * Math.PI * r * r;
  },

  volume_cone: (radiusVal: PlainValue, heightVal: PlainValue): number => {
    const r = mathBuiltins.to_number(radiusVal);
    const h = mathBuiltins.to_number(heightVal);
    return (1 / 3) * Math.PI * r * r * h;
  }
};

