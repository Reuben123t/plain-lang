import * as http from "http";
import { PlainObject, PlainValue } from "../runtime/values";
export declare function getLocalIpAddress(): string;
export declare function getAllIpAddresses(): string[];
export declare function fetchPublicIp(): Promise<string>;
export interface DeployServerOptions {
    port?: number;
    host?: string;
    onDeploy?: (info: {
        port: number;
        localUrl: string;
        networkUrl: string;
        publicUrl: string;
    }) => void;
    handler?: (req: http.IncomingMessage, res: http.ServerResponse) => void | Promise<void>;
}
export declare function createServerDeployer(options?: {
    invokeFunction?: (fn: any, args: PlainValue[]) => Promise<PlainValue>;
}): {
    get_local_ip: () => string;
    get_all_ips: () => string[];
    get_public_ip: () => Promise<string>;
    get_hostname: () => string;
    deploy_server: (portVal: any, handlerOrRouter?: any, hostVal?: any) => Promise<PlainObject>;
    stop_deployed_server: () => boolean;
    json_response: (data: PlainValue, statusVal?: any) => PlainObject;
    html_response: (html: string, statusVal?: any) => PlainObject;
    text_response: (text: string, statusVal?: any) => PlainObject;
    redirect_response: (url: string, statusVal?: any) => PlainObject;
    cors_headers: (originVal?: string) => PlainObject;
    parse_query_string: (query: string) => PlainObject;
    parse_cookies: (cookieHeader: any) => PlainObject;
    status_code_text: (code: number) => string;
    server_uptime: () => number;
    server_memory_usage: () => PlainObject;
};
//# sourceMappingURL=server_deploy.d.ts.map