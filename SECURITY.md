# Security Policy

## PLAIN Programming Language

The PLAIN project takes the security of its users and contributors seriously. We appreciate responsible security research and encourage anyone who discovers a potential vulnerability to report it privately.

## Supported Versions

Security updates will primarily be provided for the latest stable release of PLAIN.

| Version | Security Support |
|---|---|
| Latest stable release | Supported |
| Older releases | Not guaranteed |
| Development versions | Not guaranteed |

Users are encouraged to upgrade to the latest stable version to receive security fixes.

## Reporting a Vulnerability

If you discover a security vulnerability in PLAIN, please report it responsibly.

**Please follow these guidelines:**

1. Do not publicly disclose the vulnerability before the maintainers have had an opportunity to investigate it.
2. Do not exploit the vulnerability to access, modify, or delete other people's data.
3. Do not disrupt services or compromise systems belonging to other users.
4. Provide a clear description of the vulnerability, steps to reproduce it, and any relevant proof-of-concept code.

**How to report:**

- Use GitHub's Private Vulnerability Reporting feature, if enabled for this repository.
- Alternatively, contact the repository owner privately through GitHub.

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

## Response Process

After receiving a vulnerability report, the maintainers will:

1. Acknowledge receipt of the report.
2. Review and investigate the reported issue.
3. Assess its severity and potential impact.
4. Develop and test an appropriate security fix.
5. Release an update and communicate relevant security information.

We aim to acknowledge valid reports within 7 days, although investigation and resolution may take longer depending on the complexity of the issue.

## Responsible Disclosure

We appreciate security researchers and contributors who help improve PLAIN's security.

We request that vulnerabilities be disclosed responsibly, allowing sufficient time for investigation and remediation before public disclosure.

Thank you for helping make PLAIN safer for everyone.

---

**Project:** PLAIN – The Simple, English-Like Programming Language  
**Repository:** https://github.com/Reuben123t/plain-lang  
**Maintainer:** Reuben123t
