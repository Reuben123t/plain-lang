# Security Policy

## PLAIN Programming Language

The PLAIN project takes the security of its users and contributors seriously. We appreciate responsible security research and encourage anyone who discovers a potential vulnerability to report it privately.

## Supported Versions and Development Baseline

Security fixes are developed against the current source branch on **Node.js 22 or newer**. The runtime manifest currently says `1.2.0`; the VS Code extension says `1.3.0`.

| Version | Security Support |
|---|---|
| Latest stable release | Supported |
| Older releases | Not guaranteed |
| Development versions | Not guaranteed |

Users are encouraged to upgrade to the latest stable version to receive security fixes. There is no published long-term support or backport schedule in this repository.

## Reporting a Vulnerability

If you discover a security vulnerability in PLAIN, please report it responsibly. Do not put exploit details, secrets, or private user data into a public issue or pull request.

**Please follow these guidelines:**

1. Check the repository's **Security** tab. **If** GitHub displays a **Report a vulnerability** control, use that private reporting flow.
2. If no private reporting control is available, open a minimal public issue asking for a confidential reporting channel. Omit the vulnerable endpoint, proof of concept, sensitive logs, and details that would enable exploitation.
3. Once a private channel is confirmed, provide the affected commit/version, Node/OS version, capability profile, impact, and a minimal reproduction using only your own local test data. Include any mitigation you have verified.
4. Do not exploit the vulnerability to access, modify, or delete other people's data.
5. Do not disrupt services or compromise systems belonging to other users.

Repository: https://github.com/Reuben123t/plain-lang

Please do not report security vulnerabilities through public GitHub issues.

## Security Areas

The following areas are particularly relevant to PLAIN:

- **Interpreter and Parser:** Potential execution vulnerabilities, input validation issues, and unexpected code execution.
- **File Operations:** Unauthorized file access, directory traversal, and unsafe file handling.
- **Shell Command Execution:** Risks associated with executing external system commands.
- **HTTP and Web Functions:** Unsafe network requests, server vulnerabilities, and improper input handling.
- **Web Playground:** Potential injection vulnerabilities and unsafe execution of user-submitted programs.
- **Dependencies:** Vulnerabilities in third-party packages and outdated dependencies.
- **Installation Scripts:** Risks associated with downloading and executing installation scripts.

## Trust Boundaries

### Node CLI and Local Tools

PLAIN programs run through Node can access filesystem, network, subprocess, environment, and other host capabilities exposed by builtins. Local imports execute code. `test` and `eval` execute code too. Run only programs you trust, with the permissions and data you intend to expose.

Some file helpers validate paths, but those checks do **not** turn the entire Node interpreter into a security sandbox. Automation/shell APIs and other host integrations have their own capabilities. Syntax checking checks syntax, not safety.

Node-backed IDE/playground endpoints are for a trusted local user on **loopback**. Do not bind them to a public interface, forward their ports, publish them through a proxy/tunnel, or treat them as a multi-tenant code execution service. Loopback binding alone does not make untrusted code safe.

### Static Browser Playground

The browser Worker runs a restricted pure-language profile with no Node filesystem, shell, environment, network, updater, or local file-import capabilities. It is separate from the Node-backed local playground. Missing host APIs must not be silently exposed to make a browser demo work.

A Worker is an isolation and cancellation boundary for the playground, not a claim that every possible denial-of-service or browser vulnerability has been eliminated. Keep browser examples small and do not put secrets into sample code.

### Editor and Native Artifacts

Opening a file and executing it are different operations. Editor integrations must respect workspace trust and require deliberate execution. A checked-in source file, an old VSIX, and a native executable can contain different code; test the artifact that will actually be distributed.

Native staging checksums report integrity, not authenticity or code signing. Downloaded runtimes and redistribution licenses must be verified before release. Old synthetic `student_data.dat` files are not a security dataset or a reason to trust a binary.

### Network and Security Helpers

Use network clients, listeners, and security helpers only against systems you own or are authorized to test. Automated repository checks must use test-owned loopback fixtures, not internet hosts, credentials, or real user installations. Heuristic scanners and small bundled reference tables are not authoritative security assessments.

## Response Process

After receiving a vulnerability report, the maintainers will:

1. Acknowledge receipt of the report.
2. Review and investigate the reported issue.
3. Assess its severity and potential impact.
4. Develop and test an appropriate security fix.
5. Release an update and communicate relevant security information.

We aim to acknowledge valid reports within 7 days, although investigation and resolution may take longer depending on the complexity of the issue.

## Release Hygiene

Keep credentials and personal data out of issues, examples, logs, packaged files, and CI artifacts. Workflows use minimal read permissions and do not automatically publish/deploy. Any external release, package publication, metadata change, or artifact replacement needs separate approval and the checks in [docs/releasing.md](docs/releasing.md).

## Responsible Disclosure

We appreciate security researchers and contributors who help improve PLAIN's security.

We request that vulnerabilities be disclosed responsibly, allowing sufficient time for investigation and remediation before public disclosure.

Thank you for helping make PLAIN safer for everyone.

---

**Project:** PLAIN – The Simple, English-Like Programming Language  
**Repository:** https://github.com/Reuben123t/plain-lang  
**Maintainer:** Reuben123t
