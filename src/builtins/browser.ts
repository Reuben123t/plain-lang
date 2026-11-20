import { Environment } from "../runtime/environment";
import { PlainObject } from "../runtime/values";
import { mathBuiltins } from "./math";
import { geometryBuiltins } from "./geometry";
import { statsBuiltins } from "./stats";
import { scienceBuiltins } from "./science";
import { studentBuiltins } from "./student";
import { textBuiltins } from "./text";
import { listBuiltins } from "./list";
import { timeBuiltins } from "./time";
import { aiTrainingBuiltins } from "./ai_training";
import { linearAlgebraBuiltins } from "./linear_algebra";
import { dataProcessingBuiltins } from "./data_processing";
import { engineeringPhysicsBuiltins } from "./engineering_physics";
import { algorithmsBuiltins } from "./algorithms";
import { testingBuiltins } from "./testing";
import { BuiltinEnvironmentOptions, createIoBuiltins, getRegisteredModule, registerBuiltinModules } from "./registry";

export function createBrowserEnvironment(options: BuiltinEnvironmentOptions = {}): Environment {
  return registerBuiltinModules({
    math: mathBuiltins, geometry: geometryBuiltins, stats: statsBuiltins, science: scienceBuiltins,
    student: studentBuiltins, text: textBuiltins, list: listBuiltins, time: timeBuiltins,
    ai: {}, ai_training: aiTrainingBuiltins, linear_algebra: linearAlgebraBuiltins,
    tables: dataProcessingBuiltins, physics: engineeringPhysicsBuiltins, algorithms: algorithmsBuiltins,
    testing: testingBuiltins, io: createIoBuiltins(options)
  });
}

// The browser bundle aliases the runtime's standard-environment import to this
// module, so trusted Node-only builtins never enter the worker.
export const createStandardEnvironment = createBrowserEnvironment;

export function getBrowserModule(name: string, environment: Environment): PlainObject | undefined {
  return getRegisteredModule(name, environment);
}
