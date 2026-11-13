import { PlainObject } from "../runtime/values";
export declare const cyberSecurityBuiltins: {
    port_scan: (targetHost?: string, customPorts?: number[], timeoutMs?: number) => Promise<PlainObject>;
    is_port_open: (targetHost: string, portNumber: number, timeoutMs?: number) => Promise<boolean>;
    banner_grab: (targetHost: string, portNumber?: number, timeoutMs?: number) => Promise<string>;
    ping_host: (targetHost: string, timeoutMs?: number) => Promise<PlainObject>;
    dns_resolve: (hostname: string, recordType?: string) => Promise<any>;
    reverse_dns: (ipAddress: string) => Promise<any>;
    subnet_calculator: (cidrOrIp: string, netmaskStr?: string) => PlainObject;
    port_lookup: (portNumber: number) => PlainObject;
    audit_security_headers: (targetUrl: string) => Promise<PlainObject>;
    detect_sql_injection: (inputString: string) => PlainObject;
    detect_xss: (inputString: string) => PlainObject;
    detect_path_traversal: (filePath: string) => PlainObject;
    sanitize_html: (htmlString: string) => string;
    sanitize_sql_param: (paramString: string) => string;
    check_password_strength: (passwordText: string) => PlainObject;
    calculate_entropy: (data: string | number[] | Buffer) => PlainObject;
    detect_file_signature: (hexOrData: string) => PlainObject;
    extract_strings: (data: string | Buffer, minLength?: number) => string[];
    cve_lookup: (cveId: string) => PlainObject;
    rate_limit_check: (clientKey: string, maxRequests?: number, windowSeconds?: number) => PlainObject;
    xor_cipher: (plainText: string, keyText: string) => string;
    crc32: (data: string) => string;
};
//# sourceMappingURL=cyber_security.d.ts.map