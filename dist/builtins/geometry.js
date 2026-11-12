"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geometryBuiltins = void 0;
const math_1 = require("./math");
exports.geometryBuiltins = {
    hypotenuse: (aVal, bVal) => {
        const a = math_1.mathBuiltins.to_number(aVal);
        const b = math_1.mathBuiltins.to_number(bVal);
        return Math.sqrt(a * a + b * b);
    },
    distance_2d: (x1, y1, x2, y2) => {
        const dx = math_1.mathBuiltins.to_number(x2) - math_1.mathBuiltins.to_number(x1);
        const dy = math_1.mathBuiltins.to_number(y2) - math_1.mathBuiltins.to_number(y1);
        return Math.sqrt(dx * dx + dy * dy);
    },
    distance_3d: (x1, y1, z1, x2, y2, z2) => {
        const dx = math_1.mathBuiltins.to_number(x2) - math_1.mathBuiltins.to_number(x1);
        const dy = math_1.mathBuiltins.to_number(y2) - math_1.mathBuiltins.to_number(y1);
        const dz = math_1.mathBuiltins.to_number(z2) - math_1.mathBuiltins.to_number(z1);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    area_circle: (radiusVal) => {
        const r = math_1.mathBuiltins.to_number(radiusVal);
        return Math.PI * r * r;
    },
    circumference_circle: (radiusVal) => {
        const r = math_1.mathBuiltins.to_number(radiusVal);
        return 2 * Math.PI * r;
    },
    area_triangle: (baseVal, heightVal) => {
        return 0.5 * math_1.mathBuiltins.to_number(baseVal) * math_1.mathBuiltins.to_number(heightVal);
    },
    area_rectangle: (lengthVal, widthVal) => {
        return math_1.mathBuiltins.to_number(lengthVal) * math_1.mathBuiltins.to_number(widthVal);
    },
    perimeter_rectangle: (lengthVal, widthVal) => {
        return 2 * (math_1.mathBuiltins.to_number(lengthVal) + math_1.mathBuiltins.to_number(widthVal));
    },
    area_trapezoid: (base1Val, base2Val, heightVal) => {
        const b1 = math_1.mathBuiltins.to_number(base1Val);
        const b2 = math_1.mathBuiltins.to_number(base2Val);
        const h = math_1.mathBuiltins.to_number(heightVal);
        return 0.5 * (b1 + b2) * h;
    },
    volume_cube: (sideVal) => {
        const s = math_1.mathBuiltins.to_number(sideVal);
        return s * s * s;
    },
    volume_sphere: (radiusVal) => {
        const r = math_1.mathBuiltins.to_number(radiusVal);
        return (4 / 3) * Math.PI * Math.pow(r, 3);
    },
    surface_area_sphere: (radiusVal) => {
        const r = math_1.mathBuiltins.to_number(radiusVal);
        return 4 * Math.PI * r * r;
    },
    volume_cylinder: (radiusVal, heightVal) => {
        const r = math_1.mathBuiltins.to_number(radiusVal);
        const h = math_1.mathBuiltins.to_number(heightVal);
        return Math.PI * r * r * h;
    },
    surface_area_cylinder: (radiusVal, heightVal) => {
        const r = math_1.mathBuiltins.to_number(radiusVal);
        const h = math_1.mathBuiltins.to_number(heightVal);
        return 2 * Math.PI * r * h + 2 * Math.PI * r * r;
    },
    volume_cone: (radiusVal, heightVal) => {
        const r = math_1.mathBuiltins.to_number(radiusVal);
        const h = math_1.mathBuiltins.to_number(heightVal);
        return (1 / 3) * Math.PI * r * r * h;
    }
};
//# sourceMappingURL=geometry.js.map