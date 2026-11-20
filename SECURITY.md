# Security policy

## Supported development baseline

Security fixes are developed against the current source branch on **Node.js 22 or newer**. The runtime manifest currently says `1.2.0`; the VS Code extension says `1.3.0`. These numbers identify components, not a promise that an old downloaded executable contains recent source fixes. There is no published long-term support or backport schedule in this repository.

## Reporting a vulnerability

Do not put exploit details, secrets, or private user data into a public issue or pull request.

1. Check the repository's **Security** tab. **If** GitHub displays a **Report a vulnerability** control, use that private reporting flow. Its availability depends on repository settings; this policy does not claim it is enabled.
2. If no private reporting control or verified maintainer contact is available, open a minimal public issue asking for a confidential reporting channel. Omit the vulnerable endpoint, proof of concept, sensitive logs, and details that would enable exploitation.
3. Once a private channel is confirmed, provide the affected commit/version, Node/OS version, capability profile, impact, and a minimal reproduction using only your own local test data. Include any mitigation you have verified.
4. Coordinate disclosure and retesting with the maintainer. There is no guaranteed response time, bounty, or remediation deadline stated here.

No security email address or private-report URL is asserted without maintainer verification. Ordinary non-sensitive defects can use the public bug form.

## Trust boundaries

### Node CLI and local tools

PLAIN programs run through Node can access filesystem, network, subprocess, environment, and other host capabilities exposed by builtins. Local imports execute code. `test` and `eval` execute code too. Run only programs you trust, with the permissions and data you intend to expose.

Some file helpers validate paths, but those checks do **not** turn the entire Node interpreter into a security sandbox. Automation/shell APIs and other host integrations have their own capabilities. Syntax checking checks syntax, not safety.

Node-backed IDE/playground endpoints are for a trusted local user on **loopback**. Do not bind them to a public interface, forward their ports, publish them through a proxy/tunnel, or treat them as a multi-tenant code execution service. Loopback binding alone does not make untrusted code safe.

### Static browser playground

The browser Worker runs a restricted pure-language profile with no Node filesystem, shell, environment, network, updater, or local file-import capabilities. It is separate from the Node-backed local playground. Missing host APIs must not be silently exposed to make a browser demo work.

A Worker is an isolation and cancellation boundary for the playground, not a claim that every possible denial-of-service or browser vulnerability has been eliminated. Keep browser examples small and do not put secrets into sample code.

### Editor and native artifacts

Opening a file and executing it are different operations. Editor integrations must respect workspace trust and require deliberate execution. A checked-in source file, an old VSIX, and a native executable can contain different code; test the artifact that will actually be distributed.

Native staging checksums report integrity, not authenticity or code signing. Downloaded runtimes and redistribution licenses must be verified before release. Old synthetic `student_data.dat` files are not a security dataset or a reason to trust a binary.

### Network and security helpers

Use network clients, listeners, and security helpers only against systems you own or are authorized to test. Automated repository checks must use test-owned loopback fixtures, not internet hosts, credentials, or real user installations. Heuristic scanners and small bundled reference tables are not authoritative security assessments.

## Release hygiene

Keep credentials and personal data out of issues, examples, logs, packaged files, and CI artifacts. Workflows use minimal read permissions and do not automatically publish/deploy. Any external release, package publication, metadata change, or artifact replacement needs separate approval and the checks in [docs/releasing.md](docs/releasing.md).
