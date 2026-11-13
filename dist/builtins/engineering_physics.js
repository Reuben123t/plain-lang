"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.engineeringPhysicsBuiltins = void 0;
exports.engineeringPhysicsBuiltins = {
    // 1. Classical Mechanics & Kinematics
    kinetic_energy: (mass, velocity) => {
        return 0.5 * Number(mass) * Math.pow(Number(velocity), 2);
    },
    gravitational_potential_energy: (mass, height, g = 9.80665) => {
        return Number(mass) * Number(g) * Number(height);
    },
    momentum: (mass, velocity) => {
        return Number(mass) * Number(velocity);
    },
    centripetal_acceleration: (velocity, radius) => {
        const r = Number(radius);
        if (r === 0)
            return 0;
        return Math.pow(Number(velocity), 2) / r;
    },
    centripetal_force: (mass, velocity, radius) => {
        return Number(mass) * exports.engineeringPhysicsBuiltins.centripetal_acceleration(velocity, radius);
    },
    work_done: (force, distance, angleDeg = 0) => {
        return Number(force) * Number(distance) * Math.cos((Number(angleDeg) * Math.PI) / 180);
    },
    power_watts: (work, timeSeconds) => {
        const t = Number(timeSeconds);
        if (t === 0)
            return 0;
        return Number(work) / t;
    },
    hookes_law_force: (springConstant, displacement) => {
        return -Number(springConstant) * Number(displacement);
    },
    spring_potential_energy: (springConstant, displacement) => {
        return 0.5 * Number(springConstant) * Math.pow(Number(displacement), 2);
    },
    pendulum_period: (lengthMeters, g = 9.80665) => {
        const l = Number(lengthMeters);
        if (l < 0 || g <= 0)
            return 0;
        return 2 * Math.PI * Math.sqrt(l / g);
    },
    // 2. Astronomy & Gravitation
    gravitational_force: (m1, m2, distance) => {
        const G = 6.6743e-11;
        const r = Number(distance);
        if (r === 0)
            return 0;
        return (G * Number(m1) * Number(m2)) / Math.pow(r, 2);
    },
    escape_velocity: (planetMass, planetRadius) => {
        const G = 6.6743e-11;
        const r = Number(planetRadius);
        if (r <= 0)
            return 0;
        return Math.sqrt((2 * G * Number(planetMass)) / r);
    },
    orbital_velocity: (planetMass, orbitRadius) => {
        const G = 6.6743e-11;
        const r = Number(orbitRadius);
        if (r <= 0)
            return 0;
        return Math.sqrt((G * Number(planetMass)) / r);
    },
    orbital_period_kepler: (planetMass, orbitRadius) => {
        const G = 6.6743e-11;
        const r = Number(orbitRadius);
        if (r <= 0)
            return 0;
        return 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / (G * Number(planetMass)));
    },
    schwarzschild_radius: (mass) => {
        const G = 6.6743e-11;
        const c = 299792458;
        return (2 * G * Number(mass)) / Math.pow(c, 2);
    },
    // 3. Relativity & Modern Physics
    lorentz_factor: (velocity) => {
        const c = 299792458;
        const v = Math.min(c - 1e-6, Math.abs(Number(velocity)));
        return 1 / Math.sqrt(1 - Math.pow(v / c, 2));
    },
    time_dilation: (properTime, velocity) => {
        return Number(properTime) * exports.engineeringPhysicsBuiltins.lorentz_factor(velocity);
    },
    length_contraction: (properLength, velocity) => {
        return Number(properLength) / exports.engineeringPhysicsBuiltins.lorentz_factor(velocity);
    },
    relativistic_energy: (restMass, velocity = 0) => {
        const c = 299792458;
        const gamma = exports.engineeringPhysicsBuiltins.lorentz_factor(velocity);
        return gamma * Number(restMass) * Math.pow(c, 2);
    },
    photon_energy: (frequencyHz) => {
        const h = 6.62607015e-34; // Planck's constant
        return h * Number(frequencyHz);
    },
    de_broglie_wavelength: (mass, velocity) => {
        const h = 6.62607015e-34;
        const p = Number(mass) * Number(velocity);
        if (p === 0)
            return 0;
        return h / p;
    },
    // 4. Thermodynamics & Fluid Dynamics
    ideal_gas_pressure: (moles, kelvin, volumeCubicMeters) => {
        const R = 8.314462618;
        const v = Number(volumeCubicMeters);
        if (v === 0)
            return 0;
        return (Number(moles) * R * Number(kelvin)) / v;
    },
    carnot_efficiency: (tempColdKelvin, tempHotKelvin) => {
        const th = Number(tempHotKelvin);
        if (th <= 0)
            return 0;
        return 1 - Number(tempColdKelvin) / th;
    },
    heat_transfer_conduction: (thermalCond, area, tempDiff, thickness) => {
        const d = Number(thickness);
        if (d === 0)
            return 0;
        return (Number(thermalCond) * Number(area) * Number(tempDiff)) / d;
    },
    stefan_boltzmann_radiation: (emissivity, area, tempKelvin) => {
        const sigma = 5.670374419e-8;
        return Number(emissivity) * sigma * Number(area) * Math.pow(Number(tempKelvin), 4);
    },
    reynolds_number: (density, velocity, charLength, dynamicViscosity) => {
        const mu = Number(dynamicViscosity);
        if (mu === 0)
            return 0;
        return (Number(density) * Number(velocity) * Number(charLength)) / mu;
    },
    // 5. Electromagnetism & Circuits
    coulombs_law: (q1, q2, distance) => {
        const ke = 8.9875517923e9;
        const r = Number(distance);
        if (r === 0)
            return 0;
        return (ke * Number(q1) * Number(q2)) / Math.pow(r, 2);
    },
    electric_field: (charge, distance) => {
        const ke = 8.9875517923e9;
        const r = Number(distance);
        if (r === 0)
            return 0;
        return (ke * Number(charge)) / Math.pow(r, 2);
    },
    ohms_law_voltage: (currentAmps, resistanceOhms) => {
        return Number(currentAmps) * Number(resistanceOhms);
    },
    ohms_law_current: (voltageVolts, resistanceOhms) => {
        const r = Number(resistanceOhms);
        if (r === 0)
            return 0;
        return Number(voltageVolts) / r;
    },
    ohms_law_resistance: (voltageVolts, currentAmps) => {
        const i = Number(currentAmps);
        if (i === 0)
            return 0;
        return Number(voltageVolts) / i;
    },
    resistors_series: (resistors) => {
        const arr = Array.isArray(resistors) ? resistors.map(Number) : [Number(resistors)];
        return arr.reduce((a, b) => a + b, 0);
    },
    resistors_parallel: (resistors) => {
        const arr = Array.isArray(resistors) ? resistors.map(Number).filter((r) => r > 0) : [];
        if (arr.length === 0)
            return 0;
        const sumInv = arr.reduce((acc, r) => acc + 1 / r, 0);
        return sumInv === 0 ? 0 : 1 / sumInv;
    },
    capacitors_series: (capacitors) => {
        const arr = Array.isArray(capacitors) ? capacitors.map(Number).filter((c) => c > 0) : [];
        if (arr.length === 0)
            return 0;
        const sumInv = arr.reduce((acc, c) => acc + 1 / c, 0);
        return sumInv === 0 ? 0 : 1 / sumInv;
    },
    capacitors_parallel: (capacitors) => {
        const arr = Array.isArray(capacitors) ? capacitors.map(Number) : [Number(capacitors)];
        return arr.reduce((a, b) => a + b, 0);
    },
    rlc_resonant_frequency: (inductanceHenries, capacitanceFarads) => {
        const l = Number(inductanceHenries);
        const c = Number(capacitanceFarads);
        if (l <= 0 || c <= 0)
            return 0;
        return 1 / (2 * Math.PI * Math.sqrt(l * c));
    }
};
//# sourceMappingURL=engineering_physics.js.map