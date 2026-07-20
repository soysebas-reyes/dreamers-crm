# Security Policy

Dreamers CRM holds personal and sometimes sensitive information about vulnerable people (see docs/PRD.md §11 — Privacy, Safeguarding & Compliance). We take security reports seriously.

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

Instead, use [GitHub's private vulnerability reporting](https://github.com/soysebas-reyes/dreamers-crm/security/advisories/new) for this repository, or email sebastianr@30x.com.

Include:

- A description of the vulnerability and its potential impact
- Steps to reproduce
- Any relevant logs or screenshots (with sensitive data redacted)

We'll acknowledge your report as soon as possible and keep you updated as we work on a fix.

## Scope

This is a self-hosted, open-source project — anyone running their own instance is responsible for their own deployment's security (database access controls, environment variable handling, hosting configuration). Reports about the application code itself (auth bypass, injection, data leakage between tenants, etc.) are in scope.
