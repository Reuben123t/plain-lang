import { Environment } from "../runtime/environment";
import { PlainObject } from "../runtime/values";
import { BuiltinEnvironmentOptions } from "./registry";
export declare function createBrowserEnvironment(options?: BuiltinEnvironmentOptions): Environment;
export declare const createStandardEnvironment: typeof createBrowserEnvironment;
export declare function getBrowserModule(name: string, environment: Environment): PlainObject | undefined;
//# sourceMappingURL=browser.d.ts.map