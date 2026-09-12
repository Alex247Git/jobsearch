# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in JobSearch Platform, please report it privately:

1. Use GitHub's **[Private Vulnerability Reporting](https://github.com/Alex247Git/jobsearch/security/advisories/new)** (preferred), or
2. Email the repository owner directly (see profile: [@Alex247Git](https://github.com/Alex247Git)).

Include as much of the following as you can:

- Type of issue (e.g. SQL injection, broken authz, XSS)
- Affected endpoint/file and step-by-step reproduction
- Potential impact
- Suggested fix, if you have one

### What to expect

- **Acknowledgement:** within 72 hours
- **Initial assessment:** within 7 days
- **Fix or mitigation:** security issues are prioritized over all other work

Please allow a reasonable time for a patch before any public disclosure. We will credit reporters in the release notes unless anonymity is requested.

## Security Design Notes

The codebase follows defense-in-depth practices — see the **Security Posture** table in the README for the current controls (parameterized SQL, bcrypt, layered authz middlewares, rate limiting, audit logging, helmet). Dependencies are pinned via `overrides` and `npm audit --omit=dev` is kept at **0 vulnerabilities**.

## Scope

- The Express API (`BackEnd/`) and React frontend (`FrontEnd/`) as shipped in this repository
- The Docker Compose stack configuration

Out of scope: the host system, deployment platform, and any third-party services.