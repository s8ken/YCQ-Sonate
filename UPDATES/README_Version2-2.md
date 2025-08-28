```text
# Symbi Trust Protocol

Brief: Symbi Trust Protocol is a signature-oriented application (frontend + backend) designed to manage cryptographic signing operations and trust workflows. This repository contains the application code, CI, and governance files.

Quickstart (local)
1. Install dependencies:
   - npm ci
2. Start backend:
   - cd backend && npm run dev
3. Start frontend:
   - cd frontend && npm run dev
4. Run tests:
   - npm test --workspace=backend --if-present
   - npm test --workspace=frontend --if-present

What this repo contains
- /backend — API server, auth, signing flows
- /frontend — web UI for signing flows and account management
- .github/workflows — CI and security workflows
- docs/ — architecture and API specs (recommended)

Core priorities
- Secure key handling: prefer client-side key storage for user keys. If keys are managed server-side, use KMS/HSM.
- Strong auth: MFA, secure password hashing (Argon2/bcrypt), refresh tokens, RBAC.
- Observability: audit logs, metrics, tracing.

Roadmap
- Publish OpenAPI spec and SDK
- Add MFA and WebAuthn support
- Implement API rate limiting and signing policy enforcement
- Add automated security scanning and periodic pentest
```