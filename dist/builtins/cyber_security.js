"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.cyberSecurityBuiltins = void 0;
const net = __importStar(require("net"));
const dns = __importStar(require("dns"));
const http = __importStar(require("http"));
const https = __importStar(require("https"));
// Common Ports & Threat Knowledge Base
const COMMON_PORTS = {
    20: { service: "FTP-Data", desc: "File Transfer Protocol Data" },
    21: { service: "FTP", desc: "File Transfer Protocol Control" },
    22: { service: "SSH", desc: "Secure Shell Remote Login" },
    23: { service: "Telnet", desc: "Unencrypted Text Terminal", risk: "HIGH - Insecure plaintext" },
    25: { service: "SMTP", desc: "Simple Mail Transfer Protocol" },
    53: { service: "DNS", desc: "Domain Name System" },
    80: { service: "HTTP", desc: "World Wide Web Plaintext" },
    110: { service: "POP3", desc: "Post Office Protocol v3" },
    111: { service: "RPCBind", desc: "RPC Portmapper" },
    135: { service: "MSRPC", desc: "Microsoft RPC Endpoint Mapper" },
    139: { service: "NetBIOS", desc: "NetBIOS Session Service" },
    143: { service: "IMAP", desc: "Internet Message Access Protocol" },
    443: { service: "HTTPS", desc: "HTTP over TLS/SSL Secure Web" },
    445: { service: "SMB", desc: "Microsoft Server Message Block", risk: "TARGET - EternalBlue attack vector" },
    993: { service: "IMAPS", desc: "IMAP over TLS/SSL" },
    995: { service: "POP3S", desc: "POP3 over TLS/SSL" },
    1433: { service: "MSSQL", desc: "Microsoft SQL Server Database" },
    1521: { service: "Oracle", desc: "Oracle Database Listener" },
    3306: { service: "MySQL", desc: "MySQL Database" },
    3389: { service: "RDP", desc: "Remote Desktop Protocol", risk: "TARGET - Brute-force & BlueKeep vector" },
    4444: { service: "Metasploit", desc: "Metasploit Default Listener Shell", risk: "CRITICAL - Known exploit payload" },
    5432: { service: "PostgreSQL", desc: "PostgreSQL Database" },
    5900: { service: "VNC", desc: "Virtual Network Computing Remote Desktop" },
    6379: { service: "Redis", desc: "Redis Key-Value In-Memory Store" },
    8080: { service: "HTTP-Proxy", desc: "Common Web App & Proxy Port" },
    8443: { service: "HTTPS-Alt", desc: "Alternate HTTPS Web Port" },
    8888: { service: "HTTP-Alt", desc: "Alternate Web & Jupyter Notebook" },
    27017: { service: "MongoDB", desc: "MongoDB NoSQL Database" },
    31337: { service: "BackOrifice", desc: "Back Orifice Trojan Backdoor", risk: "CRITICAL - Legacy malware backdoor" }
};
// Offline CVE Threat Intelligence Database
const CVE_DATABASE = {
    "cve-2021-44228": {
        cve_id: "CVE-2021-44228",
        title: "Log4Shell (Apache Log4j Remote Code Execution)",
        cvss: 10.0,
        severity: "CRITICAL",
        affected_software: "Apache Log4j 2.0-beta9 through 2.14.1",
        attack_vector: "Network (JNDI Lookup injection in log messages)",
        description: "JNDI lookup features do not protect against attacker-controlled LDAP and other JNDI related endpoints, allowing unauthenticated RCE.",
        mitigation: "Upgrade Apache Log4j to >= 2.17.1 or set log4j2.formatMsgNoLookups=true."
    },
    "cve-2017-0144": {
        cve_id: "CVE-2017-0144",
        title: "EternalBlue (Windows SMB Remote Code Execution)",
        cvss: 8.1,
        severity: "HIGH",
        affected_software: "Microsoft Windows SMBv1 Server",
        attack_vector: "Network (SMBv1 buffer overflow used by WannaCry and NotPetya)",
        description: "SMBv1 server handling allows remote attackers to execute arbitrary code via crafted packets.",
        mitigation: "Apply Microsoft patch MS17-010 and disable SMBv1 across all systems."
    },
    "cve-2014-0160": {
        cve_id: "CVE-2014-0160",
        title: "Heartbleed (OpenSSL TLS Heartbeat Memory Leak)",
        cvss: 7.5,
        severity: "HIGH",
        affected_software: "OpenSSL 1.0.1 through 1.0.1f",
        attack_vector: "Network (TLS Heartbeat Extension buffer over-read)",
        description: "Missing bounds check allows remote attackers to obtain sensitive process memory including private keys and user credentials.",
        mitigation: "Upgrade OpenSSL to 1.0.1g or compile with -DOPENSSL_NO_HEARTBEATS."
    },
    "cve-2024-3094": {
        cve_id: "CVE-2024-3094",
        title: "XZ Utils Supply Chain Backdoor",
        cvss: 10.0,
        severity: "CRITICAL",
        affected_software: "XZ Utils liblzma 5.6.0 and 5.6.1",
        attack_vector: "Supply Chain (Targeted OpenSSH via systemd notify interception)",
        description: "Malicious code injected into build scripts modified RSA decryption routines in liblzma to intercept SSH authentication.",
        mitigation: "Downgrade xz-utils to 5.4.x and audit all systems running versions 5.6.0/5.6.1."
    },
    "cve-2019-0708": {
        cve_id: "CVE-2019-0708",
        title: "BlueKeep (Windows Remote Desktop Services RCE)",
        cvss: 9.8,
        severity: "CRITICAL",
        affected_software: "Windows 7, Server 2008, Server 2008 R2, Windows XP",
        attack_vector: "Network (RDP pre-authentication memory corruption)",
        description: "Remote Desktop Services does not properly handle connection requests, allowing a wormable unauthenticated remote code execution.",
        mitigation: "Apply KB4499175 patch or enable Network Level Authentication (NLA) on RDP."
    },
    "cve-2020-1472": {
        cve_id: "CVE-2020-1472",
        title: "Zerologon (Netlogon Cryptographic Flaw)",
        cvss: 10.0,
        severity: "CRITICAL",
        affected_software: "Windows Server Active Directory Domain Controllers",
        attack_vector: "Network (Flawed AES-CFB8 encryption with all-zero initialization vector)",
        description: "Flaw in Netlogon Remote Protocol AES implementation allows an attacker on the local network to reset the Domain Controller machine account password.",
        mitigation: "Apply August 2020 Windows Server security update and enforce secure RPC."
    },
    "cve-2022-22965": {
        cve_id: "CVE-2022-22965",
        title: "Spring4Shell (Spring Framework Data Binding RCE)",
        cvss: 9.8,
        severity: "CRITICAL",
        affected_software: "Spring Framework 5.3.0 to 5.3.17, 5.2.0 to 5.2.19 on JDK 9+",
        attack_vector: "Network (HTTP request parameter classLoader binding)",
        description: "Data binding via classLoader allows unauthenticated remote attackers to write arbitrary JSP web shells on Tomcat servers.",
        mitigation: "Upgrade Spring Framework to >= 5.3.18 or >= 5.2.20."
    }
};
// Rate limiter state storage: Map<key, { count: number, resetAt: number }>
const rateLimiterStore = new Map();
exports.cyberSecurityBuiltins = {
    // ==========================================
    // 1. NETWORK RECONNAISSANCE & PORT SCANNING
    // ==========================================
    port_scan: async (targetHost = "127.0.0.1", customPorts, timeoutMs = 400) => {
        const host = String(targetHost).trim().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
        const ports = Array.isArray(customPorts) && customPorts.length > 0
            ? customPorts.map((p) => Math.floor(Number(p))).filter((p) => p > 0 && p <= 65535)
            : [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 993, 995, 1433, 1521, 3306, 3389, 5432, 5900, 6379, 8080, 8443, 27017, 4444, 31337];
        const startTime = Date.now();
        const openPorts = [];
        // Helper to probe an individual port
        const probe = (port) => new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(timeoutMs);
            socket.on("connect", () => {
                const info = COMMON_PORTS[port] || { service: "unknown", desc: "User-specified service" };
                openPorts.push({
                    port,
                    service: info.service,
                    desc: info.desc,
                    ...(info.risk ? { risk: info.risk } : {})
                });
                socket.destroy();
                resolve();
            });
            socket.on("timeout", () => {
                socket.destroy();
                resolve();
            });
            socket.on("error", () => {
                socket.destroy();
                resolve();
            });
            try {
                socket.connect(port, host);
            }
            catch {
                resolve();
            }
        });
        // Scan in chunks of 15 ports concurrently to prevent OS socket exhaustion
        const chunkSize = 15;
        for (let i = 0; i < ports.length; i += chunkSize) {
            const slice = ports.slice(i, i + chunkSize);
            await Promise.all(slice.map((p) => probe(p)));
        }
        openPorts.sort((a, b) => a.port - b.port);
        const duration = Date.now() - startTime;
        return {
            target: host,
            scanned_ports_count: ports.length,
            open_ports_count: openPorts.length,
            open_ports: openPorts,
            scan_duration_ms: duration,
            status: openPorts.length > 0 ? "HOST_UP_SERVICES_DETECTED" : "NO_OPEN_PORTS_FOUND"
        };
    },
    is_port_open: async (targetHost, portNumber, timeoutMs = 600) => {
        const host = String(targetHost).trim().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
        const port = Math.floor(Number(portNumber));
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(timeoutMs);
            socket.on("connect", () => {
                socket.destroy();
                resolve(true);
            });
            socket.on("timeout", () => {
                socket.destroy();
                resolve(false);
            });
            socket.on("error", () => {
                socket.destroy();
                resolve(false);
            });
            try {
                socket.connect(port, host);
            }
            catch {
                resolve(false);
            }
        });
    },
    banner_grab: async (targetHost, portNumber = 80, timeoutMs = 1500) => {
        const host = String(targetHost).trim().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
        const port = Math.floor(Number(portNumber));
        return new Promise((resolve) => {
            const socket = new net.Socket();
            let banner = "";
            socket.setTimeout(timeoutMs);
            socket.on("connect", () => {
                if (port === 80 || port === 8080 || port === 8888) {
                    socket.write(`HEAD / HTTP/1.0\r\nHost: ${host}\r\nUser-Agent: PLAIN-Cyber-Scanner/1.1\r\n\r\n`);
                }
            });
            socket.on("data", (chunk) => {
                banner += chunk.toString("utf-8");
                socket.destroy();
                resolve(banner.trim());
            });
            socket.on("timeout", () => {
                socket.destroy();
                resolve(banner.trim() || "[Timeout: No service banner received]");
            });
            socket.on("error", (err) => {
                socket.destroy();
                resolve(`[Error: ${err.message}]`);
            });
            try {
                socket.connect(port, host);
            }
            catch (err) {
                resolve(`[Connection Failed: ${err.message}]`);
            }
        });
    },
    ping_host: async (targetHost, timeoutMs = 800) => {
        const host = String(targetHost).trim().replace(/^https?:\/\//, "").split("/")[0].split(":")[0];
        const startTime = Date.now();
        return new Promise((resolve) => {
            // Probe common web or DNS port
            const socket = new net.Socket();
            socket.setTimeout(timeoutMs);
            const finish = (alive) => {
                const duration = Date.now() - startTime;
                socket.destroy();
                resolve({
                    host,
                    alive,
                    latency_ms: alive ? duration : null,
                    status: alive ? "REACHABLE" : "UNREACHABLE_OR_FILTERED"
                });
            };
            socket.on("connect", () => finish(true));
            socket.on("timeout", () => finish(false));
            socket.on("error", () => finish(false));
            try {
                socket.connect(80, host);
            }
            catch {
                finish(false);
            }
        });
    },
    dns_resolve: async (hostname, recordType = "A") => {
        const host = String(hostname).trim().replace(/^https?:\/\//, "").split("/")[0];
        const type = String(recordType).toUpperCase();
        try {
            const records = await dns.promises.resolve(host, type);
            return { host, type, records };
        }
        catch (err) {
            return { host, type, error: err.message };
        }
    },
    reverse_dns: async (ipAddress) => {
        const ip = String(ipAddress).trim();
        try {
            const hostnames = await dns.promises.reverse(ip);
            return { ip, hostnames };
        }
        catch (err) {
            return { ip, error: err.message };
        }
    },
    subnet_calculator: (cidrOrIp, netmaskStr) => {
        let [ip, maskPart] = String(cidrOrIp).trim().split("/");
        let prefix = maskPart ? parseInt(maskPart, 10) : (netmaskStr ? netmaskToPrefix(netmaskStr) : 24);
        if (isNaN(prefix) || prefix < 0 || prefix > 32)
            prefix = 24;
        const ipParts = ip.split(".").map(Number);
        if (ipParts.length !== 4 || ipParts.some((n) => isNaN(n) || n < 0 || n > 255)) {
            throw new Error(`Invalid IPv4 address: '${ip}'. Expected standard format like '192.168.1.0/24'.`);
        }
        const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
        const maskInt = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
        const wildcardInt = ~maskInt >>> 0;
        const networkInt = (ipInt & maskInt) >>> 0;
        const broadcastInt = (networkInt | wildcardInt) >>> 0;
        const intToIp = (num) => [
            (num >>> 24) & 255,
            (num >>> 16) & 255,
            (num >>> 8) & 255,
            num & 255
        ].join(".");
        const totalHosts = Math.pow(2, 32 - prefix);
        const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : totalHosts - 2;
        const firstHost = prefix >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1);
        const lastHost = prefix >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1);
        return {
            ip,
            cidr: prefix,
            netmask: intToIp(maskInt),
            wildcard: intToIp(wildcardInt),
            network: intToIp(networkInt),
            broadcast: intToIp(broadcastInt),
            first_usable_host: firstHost,
            last_usable_host: lastHost,
            total_ips: totalHosts,
            usable_hosts: usableHosts
        };
    },
    port_lookup: (portNumber) => {
        const port = Math.floor(Number(portNumber));
        const info = COMMON_PORTS[port];
        if (info) {
            return { port, service: info.service, description: info.desc, risk: info.risk || "STANDARD" };
        }
        return { port, service: "unknown", description: "Unassigned or custom port", risk: "UNKNOWN" };
    },
    // ==========================================
    // 2. WEB SECURITY & VULNERABILITY AUDITING
    // ==========================================
    audit_security_headers: async (targetUrl) => {
        let cleanUrl = String(targetUrl).trim();
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = "https://" + cleanUrl;
        }
        return new Promise((resolve) => {
            const urlObj = new URL(cleanUrl);
            const isHttps = urlObj.protocol === "https:";
            const client = isHttps ? https : http;
            const req = client.request(cleanUrl, {
                method: "HEAD",
                timeout: 4000,
                headers: { "User-Agent": "PLAIN-Cyber-Auditor/1.1 (+https://plain-lang-reuben.vercel.app)" }
            }, (res) => {
                const headers = res.headers;
                const passed = [];
                const warnings = [];
                const remedies = [];
                let score = 100;
                // 1. Content-Security-Policy (CSP)
                if (headers["content-security-policy"]) {
                    passed.push("Content-Security-Policy is active.");
                }
                else {
                    warnings.push("Missing Content-Security-Policy (CSP) — high risk of XSS.");
                    remedies.push("Add header: Content-Security-Policy: default-src 'self';");
                    score -= 25;
                }
                // 2. Strict-Transport-Security (HSTS)
                if (headers["strict-transport-security"]) {
                    passed.push("Strict-Transport-Security (HSTS) is enabled.");
                }
                else if (isHttps) {
                    warnings.push("Missing Strict-Transport-Security (HSTS) — risk of SSL-stripping.");
                    remedies.push("Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload");
                    score -= 20;
                }
                // 3. X-Frame-Options
                if (headers["x-frame-options"]) {
                    passed.push(`X-Frame-Options is set to '${headers["x-frame-options"]}'.`);
                }
                else {
                    warnings.push("Missing X-Frame-Options — vulnerable to Clickjacking attacks.");
                    remedies.push("Add header: X-Frame-Options: SAMEORIGIN (or DENY)");
                    score -= 20;
                }
                // 4. X-Content-Type-Options
                if (headers["x-content-type-options"]) {
                    passed.push("X-Content-Type-Options is nosniff.");
                }
                else {
                    warnings.push("Missing X-Content-Type-Options — vulnerable to MIME-sniffing exploits.");
                    remedies.push("Add header: X-Content-Type-Options: nosniff");
                    score -= 15;
                }
                // 5. Referrer-Policy
                if (headers["referrer-policy"]) {
                    passed.push(`Referrer-Policy configured (${headers["referrer-policy"]}).`);
                }
                else {
                    warnings.push("Missing Referrer-Policy — URL tokens may leak in HTTP referer.");
                    remedies.push("Add header: Referrer-Policy: strict-origin-when-cross-origin");
                    score -= 10;
                }
                // 6. Permissions-Policy
                if (headers["permissions-policy"]) {
                    passed.push("Permissions-Policy configured.");
                }
                else {
                    warnings.push("Missing Permissions-Policy.");
                    score -= 10;
                }
                // 7. CORS Wildcard Check
                const cors = headers["access-control-allow-origin"];
                if (cors === "*") {
                    warnings.push("Access-Control-Allow-Origin is set to wildcard '*' — public API exposure.");
                    score -= 10;
                }
                score = Math.max(0, score);
                let grade = "F";
                if (score >= 90)
                    grade = "A+";
                else if (score >= 80)
                    grade = "A";
                else if (score >= 70)
                    grade = "B";
                else if (score >= 55)
                    grade = "C";
                else if (score >= 40)
                    grade = "D";
                resolve({
                    url: cleanUrl,
                    status_code: res.statusCode || 0,
                    security_score: score,
                    grade,
                    is_https: isHttps,
                    passed_checks: passed,
                    vulnerabilities_found: warnings,
                    recommended_remediation: remedies,
                    raw_headers: JSON.parse(JSON.stringify(headers))
                });
            });
            req.on("error", (err) => {
                resolve({
                    url: cleanUrl,
                    error: err.message,
                    security_score: 0,
                    grade: "F",
                    status: "FAILED_TO_CONNECT"
                });
            });
            req.on("timeout", () => {
                req.destroy();
                resolve({
                    url: cleanUrl,
                    error: "Connection timed out",
                    security_score: 0,
                    grade: "F",
                    status: "TIMEOUT"
                });
            });
            req.end();
        });
    },
    detect_sql_injection: (inputString) => {
        const text = String(inputString);
        const sqliPatterns = [
            { name: "UNION SELECT Injection", regex: /\bUNION\b\s+(ALL\s+)?\bSELECT\b/i },
            { name: "Tautology (' OR '1'='1')", regex: /('|"|`)\s*OR\s*('1'='1'|1=1|[a-z]=[a-z])/i },
            { name: "Comment Evasion (-- or /* */)", regex: /(--|\/\*|\*\/|#\s*$)/ },
            { name: "Stacked Queries (; DROP / ; DELETE)", regex: /;\s*(DROP|DELETE|UPDATE|INSERT|TRUNCATE|ALTER)\b/i },
            { name: "Time-based Blind Delay (SLEEP / WAITFOR)", regex: /\b(SLEEP\s*\(|WAITFOR\s+DELAY|BENCHMARK\s*\()/i },
            { name: "System Command Injection (xp_cmdshell)", regex: /\b(xp_cmdshell|exec\s*\(|system\s*\()/i },
            { name: "Schema Enumeration", regex: /\bFROM\s+INFORMATION_SCHEMA\b/i }
        ];
        const matches = [];
        for (const p of sqliPatterns) {
            if (p.regex.test(text)) {
                matches.push(p.name);
            }
        }
        return {
            input_sample: text.length > 80 ? text.slice(0, 80) + "..." : text,
            is_malicious: matches.length > 0,
            risk_level: matches.length > 0 ? "HIGH" : "NONE",
            matched_threats: matches,
            recommendation: matches.length > 0
                ? "CRITICAL: Untrusted SQL pattern detected. Use parameterized queries or ORM bindings."
                : "Input looks clean of common SQL injection signatures."
        };
    },
    detect_xss: (inputString) => {
        const text = String(inputString);
        const xssPatterns = [
            { name: "Script Tag Injection", regex: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi },
            { name: "HTML Event Handler (onerror, onload, onmouseover)", regex: /\bon[a-z]+\s*=/i },
            { name: "JavaScript Pseudo-Protocol (javascript:...)", regex: /javascript:\s*[^"'\s>]+/i },
            { name: "Dangerous DOM Functions (eval, document.cookie)", regex: /\b(eval|document\.cookie|document\.location|window\.location)\b/i },
            { name: "SVG / IFrame Vector", regex: /<(iframe|embed|object|svg\s+onload)\b/i },
            { name: "Base64 Data URI Payload", regex: /data:text\/html;base64,/i }
        ];
        const matches = [];
        for (const p of xssPatterns) {
            if (p.regex.test(text)) {
                matches.push(p.name);
            }
        }
        return {
            input_sample: text.length > 80 ? text.slice(0, 80) + "..." : text,
            is_malicious: matches.length > 0,
            risk_level: matches.length > 0 ? "HIGH" : "NONE",
            matched_threats: matches,
            recommendation: matches.length > 0
                ? "CRITICAL: Malicious Cross-Site Scripting (XSS) payload detected. Sanitize input with sanitize_html()."
                : "Input looks clean of common XSS vectors."
        };
    },
    detect_path_traversal: (filePath) => {
        const text = String(filePath);
        const isTraversal = text.includes("..") || text.includes("%2e%2e") || text.includes("%2f") || text.includes("/etc/") || /^[a-z]:\\windows/i.test(text);
        return {
            path: text,
            is_malicious: isTraversal,
            risk_level: isTraversal ? "HIGH" : "NONE",
            recommendation: isTraversal ? "Reject path traversal attempts: Resolve path within an explicit safe directory root." : "Path safe."
        };
    },
    sanitize_html: (htmlString) => {
        return String(htmlString)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },
    sanitize_sql_param: (paramString) => {
        return String(paramString)
            .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
            switch (char) {
                case "\0": return "\\0";
                case "\x08": return "\\b";
                case "\x09": return "\\t";
                case "\x1a": return "\\z";
                case "\n": return "\\n";
                case "\r": return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\" + char;
                default:
                    return char;
            }
        });
    },
    check_password_strength: (passwordText) => {
        const pwd = String(passwordText);
        const length = pwd.length;
        const commonPasswords = new Set([
            "123456", "password", "12345678", "qwerty", "123456789", "12345", "1234", "111111",
            "1234567", "dragon", "welcome", "admin", "admin123", "root", "master", "iloveyou"
        ]);
        const isBreachedCommon = commonPasswords.has(pwd.toLowerCase());
        const hasLower = /[a-z]/.test(pwd);
        const hasUpper = /[A-Z]/.test(pwd);
        const hasNumber = /[0-9]/.test(pwd);
        const hasSymbol = /[^a-zA-Z0-9]/.test(pwd);
        let charsetSize = 0;
        if (hasLower)
            charsetSize += 26;
        if (hasUpper)
            charsetSize += 26;
        if (hasNumber)
            charsetSize += 10;
        if (hasSymbol)
            charsetSize += 33;
        // Shannon entropy bits = length * log2(charsetSize)
        const entropyBits = charsetSize > 0 ? Math.round(length * Math.log2(charsetSize)) : 0;
        let score = 0;
        const suggestions = [];
        if (isBreachedCommon) {
            score = 5;
            suggestions.push("This is one of the most breached passwords in history. Choose a unique passphrase.");
        }
        else {
            if (length >= 8)
                score += 20;
            if (length >= 12)
                score += 20;
            if (length >= 16)
                score += 10;
            if (hasLower)
                score += 10;
            if (hasUpper)
                score += 15;
            if (hasNumber)
                score += 10;
            if (hasSymbol)
                score += 15;
        }
        if (!hasLower)
            suggestions.push("Add lowercase letters.");
        if (!hasUpper)
            suggestions.push("Add uppercase letters.");
        if (!hasNumber)
            suggestions.push("Add digits.");
        if (!hasSymbol)
            suggestions.push("Add special symbols (!@#$%^&*).");
        if (length < 12)
            suggestions.push("Make password at least 12 characters long.");
        let strength = "VERY_WEAK";
        if (score >= 85)
            strength = "VERY_STRONG";
        else if (score >= 70)
            strength = "STRONG";
        else if (score >= 50)
            strength = "MEDIUM";
        else if (score >= 30)
            strength = "WEAK";
        return {
            password_length: length,
            entropy_bits: entropyBits,
            strength_score: score,
            strength_rating: strength,
            breached_common: isBreachedCommon,
            suggestions: suggestions.length > 0 ? suggestions : ["Password meets top cybersecurity recommendations!"]
        };
    },
    // ==========================================
    // 3. MALWARE ANALYSIS & FORENSICS
    // ==========================================
    calculate_entropy: (data) => {
        const buffer = Buffer.isBuffer(data)
            ? data
            : Array.isArray(data)
                ? Buffer.from(data)
                : Buffer.from(String(data), "utf-8");
        if (buffer.length === 0) {
            return { entropy: 0, analysis: "Empty data (Entropy 0.0)" };
        }
        const frequencies = {};
        for (let i = 0; i < buffer.length; i++) {
            const byte = buffer[i];
            frequencies[byte] = (frequencies[byte] || 0) + 1;
        }
        let entropy = 0;
        const total = buffer.length;
        for (const count of Object.values(frequencies)) {
            const p = count / total;
            entropy -= p * Math.log2(p);
        }
        const rounded = Math.round(entropy * 1000) / 1000;
        let analysis = "Standard structured plain text / code";
        if (rounded > 7.2) {
            analysis = "ALERT: High Entropy (> 7.2). Data is almost certainly compressed, encrypted, or packed malware/shellcode.";
        }
        else if (rounded > 6.0) {
            analysis = "Moderate-to-high entropy. Typical of binary executables, fonts, or assets.";
        }
        else if (rounded < 3.5) {
            analysis = "Very low entropy. Repetitive or sparse data.";
        }
        return {
            bytes_analyzed: total,
            shannon_entropy: rounded,
            max_entropy: 8.0,
            percentage: Math.round((rounded / 8.0) * 100),
            analysis
        };
    },
    detect_file_signature: (hexOrData) => {
        let hex = String(hexOrData).trim().replace(/\s+/g, "").toUpperCase();
        if (hex.length < 4) {
            return { detected: false, file_type: "Unknown", error: "Input too short for magic byte identification." };
        }
        const signatures = [
            { magic: "4D5A", type: "Windows PE Executable (.exe / .dll)", mime: "application/x-dosexec" },
            { magic: "7F454C46", type: "Linux ELF Executable (.bin / .elf)", mime: "application/x-executable" },
            { magic: "CAFEBABE", type: "Java Class File / Mach-O Fat Binary", mime: "application/java-vm" },
            { magic: "FEEDFACE", type: "macOS Mach-O 32-bit Binary", mime: "application/x-mach-binary" },
            { magic: "FEEDFACF", type: "macOS Mach-O 64-bit Binary", mime: "application/x-mach-binary" },
            { magic: "504B0304", type: "ZIP Archive / Office Document (.zip / .docx / .jar / .apk)", mime: "application/zip" },
            { magic: "25504446", type: "PDF Document (.pdf)", mime: "application/pdf" },
            { magic: "89504E47", type: "PNG Image (.png)", mime: "image/png" },
            { magic: "FFD8FF", type: "JPEG Image (.jpg / .jpeg)", mime: "image/jpeg" },
            { magic: "47494638", type: "GIF Image (.gif)", mime: "image/gif" },
            { magic: "1F8B08", type: "GZIP Compressed File (.gz)", mime: "application/gzip" },
            { magic: "D4C3B2A1", type: "PCAP Packet Capture File (.pcap)", mime: "application/vnd.tcpdump.pcap" },
            { magic: "A1B2C3D4", type: "PCAP Packet Capture File (.pcap - Little Endian)", mime: "application/vnd.tcpdump.pcap" },
            { magic: "526172211A07", type: "RAR Archive (.rar)", mime: "application/x-rar-compressed" },
            { magic: "377ABCAF271C", type: "7-Zip Archive (.7z)", mime: "application/x-7z-compressed" }
        ];
        for (const sig of signatures) {
            if (hex.startsWith(sig.magic)) {
                return {
                    detected: true,
                    magic_bytes_hex: sig.magic,
                    file_type: sig.type,
                    mime_type: sig.mime
                };
            }
        }
        return {
            detected: false,
            magic_bytes_hex: hex.slice(0, 8),
            file_type: "Unidentified file format",
            mime_type: "application/octet-stream"
        };
    },
    extract_strings: (data, minLength = 4) => {
        const str = Buffer.isBuffer(data) ? data.toString("latin1") : String(data);
        const min = Math.max(2, Math.floor(Number(minLength)));
        const regex = new RegExp(`[\\x20-\\x7E]{${min},}`, "g");
        return str.match(regex) || [];
    },
    cve_lookup: (cveId) => {
        const key = String(cveId).trim().toLowerCase();
        const info = CVE_DATABASE[key];
        if (info) {
            return info;
        }
        return {
            cve_id: cveId,
            error: "CVE not found in offline threat knowledge base.",
            available_popular_cves: Object.keys(CVE_DATABASE).map((k) => k.toUpperCase())
        };
    },
    // ==========================================
    // 4. RATE LIMITING & DEFENSE
    // ==========================================
    rate_limit_check: (clientKey, maxRequests = 100, windowSeconds = 60) => {
        const key = String(clientKey).trim();
        const now = Date.now();
        const windowMs = Math.max(1, windowSeconds) * 1000;
        let entry = rateLimiterStore.get(key);
        if (!entry || now > entry.resetAt) {
            entry = { count: 1, resetAt: now + windowMs };
            rateLimiterStore.set(key, entry);
            return {
                key,
                allowed: true,
                current_requests: 1,
                max_allowed: maxRequests,
                remaining: maxRequests - 1,
                reset_in_seconds: Math.round((entry.resetAt - now) / 1000)
            };
        }
        entry.count++;
        const allowed = entry.count <= maxRequests;
        return {
            key,
            allowed,
            current_requests: entry.count,
            max_allowed: maxRequests,
            remaining: Math.max(0, maxRequests - entry.count),
            reset_in_seconds: Math.round((entry.resetAt - now) / 1000),
            action: allowed ? "PASS" : "BLOCK_RATE_LIMIT_EXCEEDED"
        };
    },
    // ==========================================
    // 5. EXTENDED CIPHERS & ENCODINGS
    // ==========================================
    xor_cipher: (plainText, keyText) => {
        const text = String(plainText);
        const key = String(keyText);
        if (key.length === 0)
            return text;
        let result = "";
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }
        return result;
    },
    crc32: (data) => {
        // Standard CRC32 polynomial 0xEDB88320
        const str = String(data);
        let crc = 0 ^ -1;
        for (let i = 0; i < str.length; i++) {
            let byte = str.charCodeAt(i);
            crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ byte) & 0xff];
        }
        return ((crc ^ -1) >>> 0).toString(16).padStart(8, "0");
    }
};
// Precomputed CRC32 table
const CRC32_TABLE = (() => {
    const table = [];
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
        }
        table.push(c >>> 0);
    }
    return table;
})();
function netmaskToPrefix(netmask) {
    return netmask
        .split(".")
        .map(Number)
        .map((n) => (n >>> 0).toString(2))
        .join("")
        .split("1").length - 1;
}
//# sourceMappingURL=cyber_security.js.map