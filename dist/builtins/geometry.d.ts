import { PlainValue } from "../runtime/values";
export declare const geometryBuiltins: {
    hypotenuse: (aVal: PlainValue, bVal: PlainValue) => number;
    distance_2d: (x1: PlainValue, y1: PlainValue, x2: PlainValue, y2: PlainValue) => number;
    distance_3d: (x1: PlainValue, y1: PlainValue, z1: PlainValue, x2: PlainValue, y2: PlainValue, z2: PlainValue) => number;
    area_circle: (radiusVal: PlainValue) => number;
    circumference_circle: (radiusVal: PlainValue) => number;
    area_triangle: (baseVal: PlainValue, heightVal: PlainValue) => number;
    area_rectangle: (lengthVal: PlainValue, widthVal: PlainValue) => number;
    perimeter_rectangle: (lengthVal: PlainValue, widthVal: PlainValue) => number;
    area_trapezoid: (base1Val: PlainValue, base2Val: PlainValue, heightVal: PlainValue) => number;
    volume_cube: (sideVal: PlainValue) => number;
    volume_sphere: (radiusVal: PlainValue) => number;
    surface_area_sphere: (radiusVal: PlainValue) => number;
    volume_cylinder: (radiusVal: PlainValue, heightVal: PlainValue) => number;
    surface_area_cylinder: (radiusVal: PlainValue, heightVal: PlainValue) => number;
    volume_cone: (radiusVal: PlainValue, heightVal: PlainValue) => number;
};
//# sourceMappingURL=geometry.d.ts.map