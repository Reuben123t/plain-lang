"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStandardEnvironment = void 0;
exports.createBrowserEnvironment = createBrowserEnvironment;
exports.getBrowserModule = getBrowserModule;
const math_1 = require("./math");
const geometry_1 = require("./geometry");
const stats_1 = require("./stats");
const science_1 = require("./science");
const student_1 = require("./student");
const text_1 = require("./text");
const list_1 = require("./list");
const time_1 = require("./time");
const ai_training_1 = require("./ai_training");
const linear_algebra_1 = require("./linear_algebra");
const data_processing_1 = require("./data_processing");
const engineering_physics_1 = require("./engineering_physics");
const algorithms_1 = require("./algorithms");
const testing_1 = require("./testing");
const registry_1 = require("./registry");
function createBrowserEnvironment(options = {}) {
    return (0, registry_1.registerBuiltinModules)({
        math: math_1.mathBuiltins, geometry: geometry_1.geometryBuiltins, stats: stats_1.statsBuiltins, science: science_1.scienceBuiltins,
        student: student_1.studentBuiltins, text: text_1.textBuiltins, list: list_1.listBuiltins, time: time_1.timeBuiltins,
        ai: {}, ai_training: ai_training_1.aiTrainingBuiltins, linear_algebra: linear_algebra_1.linearAlgebraBuiltins,
        tables: data_processing_1.dataProcessingBuiltins, physics: engineering_physics_1.engineeringPhysicsBuiltins, algorithms: algorithms_1.algorithmsBuiltins,
        testing: testing_1.testingBuiltins, io: (0, registry_1.createIoBuiltins)(options)
    });
}
// The browser bundle aliases the runtime's standard-environment import to this
// module, so trusted Node-only builtins never enter the worker.
exports.createStandardEnvironment = createBrowserEnvironment;
function getBrowserModule(name, environment) {
    return (0, registry_1.getRegisteredModule)(name, environment);
}
//# sourceMappingURL=browser.js.map