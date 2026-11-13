import { PlainObject } from "../runtime/values";

export const engineeringPhysicsBuiltins = {
  // 1. Classical Mechanics & Kinematics
  kinetic_energy: (mass: number, velocity: number): number => {
    return 0.5 * Number(mass) * Math.pow(Number(velocity), 2);
  },

  gravitational_potential_energy: (mass: number, height: number, g: number = 9.80665): number => {
    return Number(mass) * Number(g) * Number(height);
  },

  momentum: (mass: number, velocity: number): number => {
    return Number(mass) * Number(velocity);
  },

  centripetal_acceleration: (velocity: number, radius: number): number => {
    const r = Number(radius);
    if (r === 0) return 0;
    return Math.pow(Number(velocity), 2) / r;
  },

  centripetal_force: (mass: number, velocity: number, radius: number): number => {
    return Number(mass) * engineeringPhysicsBuiltins.centripetal_acceleration(velocity, radius);
  },

  work_done: (force: number, distance: number, angleDeg: number = 0): number => {
    return Number(force) * Number(distance) * Math.cos((Number(angleDeg) * Math.PI) / 180);
  },

  power_watts: (work: number, timeSeconds: number): number => {
    const t = Number(timeSeconds);
    if (t === 0) return 0;
    return Number(work) / t;
  },

  hookes_law_force: (springConstant: number, displacement: number): number => {
    return -Number(springConstant) * Number(displacement);
  },

  spring_potential_energy: (springConstant: number, displacement: number): number => {
    return 0.5 * Number(springConstant) * Math.pow(Number(displacement), 2);
  },

  pendulum_period: (lengthMeters: number, g: number = 9.80665): number => {
    const l = Number(lengthMeters);
    if (l < 0 || g <= 0) return 0;
    return 2 * Math.PI * Math.sqrt(l / g);
  },

  // 2. Astronomy & Gravitation
  gravitational_force: (m1: number, m2: number, distance: number): number => {
    const G = 6.6743e-11;
    const r = Number(distance);
    if (r === 0) return 0;
    return (G * Number(m1) * Number(m2)) / Math.pow(r, 2);
  },

  escape_velocity: (planetMass: number, planetRadius: number): number => {
    const G = 6.6743e-11;
    const r = Number(planetRadius);
    if (r <= 0) return 0;
    return Math.sqrt((2 * G * Number(planetMass)) / r);
  },

  orbital_velocity: (planetMass: number, orbitRadius: number): number => {
    const G = 6.6743e-11;
    const r = Number(orbitRadius);
    if (r <= 0) return 0;
    return Math.sqrt((G * Number(planetMass)) / r);
  },

  orbital_period_kepler: (planetMass: number, orbitRadius: number): number => {
    const G = 6.6743e-11;
    const r = Number(orbitRadius);
    if (r <= 0) return 0;
    return 2 * Math.PI * Math.sqrt(Math.pow(r, 3) / (G * Number(planetMass)));
  },

  schwarzschild_radius: (mass: number): number => {
    const G = 6.6743e-11;
    const c = 299792458;
    return (2 * G * Number(mass)) / Math.pow(c, 2);
  },

  // 3. Relativity & Modern Physics
  lorentz_factor: (velocity: number): number => {
    const c = 299792458;
    const v = Math.min(c - 1e-6, Math.abs(Number(velocity)));
    return 1 / Math.sqrt(1 - Math.pow(v / c, 2));
  },

  time_dilation: (properTime: number, velocity: number): number => {
    return Number(properTime) * engineeringPhysicsBuiltins.lorentz_factor(velocity);
  },

  length_contraction: (properLength: number, velocity: number): number => {
    return Number(properLength) / engineeringPhysicsBuiltins.lorentz_factor(velocity);
  },

  relativistic_energy: (restMass: number, velocity: number = 0): number => {
    const c = 299792458;
    const gamma = engineeringPhysicsBuiltins.lorentz_factor(velocity);
    return gamma * Number(restMass) * Math.pow(c, 2);
  },

  photon_energy: (frequencyHz: number): number => {
    const h = 6.62607015e-34; // Planck's constant
    return h * Number(frequencyHz);
  },

  de_broglie_wavelength: (mass: number, velocity: number): number => {
    const h = 6.62607015e-34;
    const p = Number(mass) * Number(velocity);
    if (p === 0) return 0;
    return h / p;
  },

  // 4. Thermodynamics & Fluid Dynamics
  ideal_gas_pressure: (moles: number, kelvin: number, volumeCubicMeters: number): number => {
    const R = 8.314462618;
    const v = Number(volumeCubicMeters);
    if (v === 0) return 0;
    return (Number(moles) * R * Number(kelvin)) / v;
  },

  carnot_efficiency: (tempColdKelvin: number, tempHotKelvin: number): number => {
    const th = Number(tempHotKelvin);
    if (th <= 0) return 0;
    return 1 - Number(tempColdKelvin) / th;
  },

  heat_transfer_conduction: (thermalCond: number, area: number, tempDiff: number, thickness: number): number => {
    const d = Number(thickness);
    if (d === 0) return 0;
    return (Number(thermalCond) * Number(area) * Number(tempDiff)) / d;
  },

  stefan_boltzmann_radiation: (emissivity: number, area: number, tempKelvin: number): number => {
    const sigma = 5.670374419e-8;
    return Number(emissivity) * sigma * Number(area) * Math.pow(Number(tempKelvin), 4);
  },

  reynolds_number: (density: number, velocity: number, charLength: number, dynamicViscosity: number): number => {
    const mu = Number(dynamicViscosity);
    if (mu === 0) return 0;
    return (Number(density) * Number(velocity) * Number(charLength)) / mu;
  },

  // 5. Electromagnetism & Circuits
  coulombs_law: (q1: number, q2: number, distance: number): number => {
    const ke = 8.9875517923e9;
    const r = Number(distance);
    if (r === 0) return 0;
    return (ke * Number(q1) * Number(q2)) / Math.pow(r, 2);
  },

  electric_field: (charge: number, distance: number): number => {
    const ke = 8.9875517923e9;
    const r = Number(distance);
    if (r === 0) return 0;
    return (ke * Number(charge)) / Math.pow(r, 2);
  },

  ohms_law_voltage: (currentAmps: number, resistanceOhms: number): number => {
    return Number(currentAmps) * Number(resistanceOhms);
  },

  ohms_law_current: (voltageVolts: number, resistanceOhms: number): number => {
    const r = Number(resistanceOhms);
    if (r === 0) return 0;
    return Number(voltageVolts) / r;
  },

  ohms_law_resistance: (voltageVolts: number, currentAmps: number): number => {
    const i = Number(currentAmps);
    if (i === 0) return 0;
    return Number(voltageVolts) / i;
  },

  resistors_series: (resistors: any): number => {
    const arr = Array.isArray(resistors) ? resistors.map(Number) : [Number(resistors)];
    return arr.reduce((a, b) => a + b, 0);
  },

  resistors_parallel: (resistors: any): number => {
    const arr = Array.isArray(resistors) ? resistors.map(Number).filter((r) => r > 0) : [];
    if (arr.length === 0) return 0;
    const sumInv = arr.reduce((acc, r) => acc + 1 / r, 0);
    return sumInv === 0 ? 0 : 1 / sumInv;
  },

  capacitors_series: (capacitors: any): number => {
    const arr = Array.isArray(capacitors) ? capacitors.map(Number).filter((c) => c > 0) : [];
    if (arr.length === 0) return 0;
    const sumInv = arr.reduce((acc, c) => acc + 1 / c, 0);
    return sumInv === 0 ? 0 : 1 / sumInv;
  },

  capacitors_parallel: (capacitors: any): number => {
    const arr = Array.isArray(capacitors) ? capacitors.map(Number) : [Number(capacitors)];
    return arr.reduce((a, b) => a + b, 0);
  },

  rlc_resonant_frequency: (inductanceHenries: number, capacitanceFarads: number): number => {
    const l = Number(inductanceHenries);
    const c = Number(capacitanceFarads);
    if (l <= 0 || c <= 0) return 0;
    return 1 / (2 * Math.PI * Math.sqrt(l * c));
  }
};

