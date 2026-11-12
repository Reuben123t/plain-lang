import { PlainValue } from "../runtime/values";
export declare const scienceBuiltins: {
    atomic_mass: (queryVal: PlainValue) => number;
    atomic_number: (queryVal: PlainValue) => number;
    element_name: (queryVal: PlainValue) => string;
    density: (massVal: PlainValue, volumeVal: PlainValue) => number;
    speed: (distanceVal: PlainValue, timeVal: PlainValue) => number;
    acceleration: (vInitVal: PlainValue, vFinalVal: PlainValue, timeVal: PlainValue) => number;
    force: (massVal: PlainValue, accelVal: PlainValue) => number;
    momentum: (massVal: PlainValue, velocityVal: PlainValue) => number;
    kinetic_energy: (massVal: PlainValue, velocityVal: PlainValue) => number;
    potential_energy: (massVal: PlainValue, heightVal: PlainValue, gVal?: PlainValue) => number;
    work_done: (forceVal: PlainValue, distanceVal: PlainValue) => number;
    power_watts: (workVal: PlainValue, timeVal: PlainValue) => number;
    ohms_voltage: (currentVal: PlainValue, resistanceVal: PlainValue) => number;
    ohms_current: (voltageVal: PlainValue, resistanceVal: PlainValue) => number;
    ohms_resistance: (voltageVal: PlainValue, currentVal: PlainValue) => number;
    electrical_power: (voltageVal: PlainValue, currentVal: PlainValue) => number;
    free_fall_time: (heightVal: PlainValue, gVal?: PlainValue) => number;
    projectile_range: (v0Val: PlainValue, angleDegVal: PlainValue, gVal?: PlainValue) => number;
};
//# sourceMappingURL=science.d.ts.map