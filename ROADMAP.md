# Roadmap

This is a list of directions, not a schedule or a claim that the work is already complete. The [Unreleased changelog](CHANGELOG.md) describes the current reliability/developer-workflow work. Compatibility, security, and testability take priority over a larger API count.

## Near term: reliable source and releases

- Keep fresh-checkout builds and tests portable across Node 22/24 and Windows/macOS/Linux.
- Strengthen parser/runtime regression coverage, input validation, and error locations.
- Keep CLI, browser profiles, generated reference material, editor help, and examples aligned with canonical builtin registrations.
- Validate packed npm/VSIX contents and clean-machine behavior before approving a distribution channel.
- Finish repeatable native build/signing/upgrade checks without synthetic payloads or overwriting legacy downloads during development.
- Keep loopback development tools distinct from any future service intended to execute untrusted programs.

## Next: deeper developer tooling

- **Language Server Protocol:** investigate a shared language service for completion, diagnostics, definitions, and workspace symbols. An editor extension is not itself an implemented LSP server.
- **Debugger:** design stepping, breakpoints, stack/scope inspection, and Debug Adapter Protocol integration. Running a file from an editor is not a debugger.
- **Formatting and static analysis:** expand conservative formatting and diagnostics with compatibility fixtures before promising Python-like behavior.
- **Module ergonomics:** clarify module boundaries, import errors, reproducible local projects, and dependency metadata before introducing remote dependency resolution.

## Longer term: ecosystem and evaluation

- **Package registry:** evaluate naming, dependency locking, provenance, security review, hosting/maintenance cost, and ownership. Local imports are not a finished package manager or public registry.
- **Measured performance:** create reproducible workloads, documented hardware/runtime configurations, and regression budgets before publishing benchmark claims.
- **Deployment model:** assess authentication, isolation, quotas, updates, and operational ownership before treating local tools as hosted multi-user services.
- **Learning material:** grow small, tested tutorials and accessible browser examples rather than unverified API or production-readiness claims.

## How to propose work

Use the feature issue form to describe the problem, a minimal use case, compatibility expectations, and how it can be tested. A maintainer decision is needed before committing to a public interface or external service.

Repository metadata/topics, a public site, release uploads, package registries, Marketplace listings, and publishing automation all require separate user approval. This roadmap does not authorize any of those actions.
