## Summary

What changed, why, and which issue does it address?

## Verification

List the commands actually run and their results. Explain anything skipped.

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:examples`
- [ ] `npm run test:package`
- [ ] Regression tests cover the changed behavior and relevant failures.

Optional native/local-install checks (only if deliberately configured):

- Artifact/platform tested, command, and result:

## Compatibility and documentation

- [ ] English/Python-style syntax, explicit `end`, case rules, and indexing conventions are preserved or changes are documented.
- [ ] Canonical APIs, examples, capability profiles, and generated references agree with the implementation.
- [ ] User-visible changes are recorded under Unreleased; no release/version claims were invented.
- [ ] Tests use deterministic fixtures and do not depend on internet hosts or a real user installation.

## Scope and release impact

Note any filesystem, shell, network, browser, editor, packaging, or security impact.

- [ ] Existing local changes and legacy binary artifacts were not silently overwritten or removed.
- [ ] No credentials/private data are included.
- [ ] No deployment, publication, metadata change, or release upload is performed by this change without separate approval.

For vulnerabilities, use SECURITY.md rather than adding exploit details to this public description.
