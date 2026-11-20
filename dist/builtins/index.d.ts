import { Environment } from "../runtime/environment";
import { PlainObject } from "../runtime/values";
import { BuiltinEnvironmentOptions } from "./registry";
export declare function createStandardEnvironment(options?: BuiltinEnvironmentOptions): Environment;
export declare function getBuiltinModule(name: string, environment: Environment): PlainObject | undefined;
//# sourceMappingURL=index.d.ts.map