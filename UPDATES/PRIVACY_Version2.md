```text
# Privacy & Data Handling

This document explains what personal data Symbi Trust Protocol collects, why we collect it, and how long we keep it.

1) Data we may collect
- Account identifiers (email, username) — for account provisioning and recovery.
- Authentication data (hashed passwords, OTP secrets) — for auth.
- Minimal metadata required for signing operations (transaction IDs, timestamps).
- Logs & telemetry (IP addresses, timestamps, errors) — for security and debugging.

2) Purpose and lawful basis
- Account management and authentication.
- Security monitoring and fraud prevention.
- Operation of the signature and trust features.

3) Data retention
- Authentication records and audit logs: retained 1 year by default, unless required longer for legal reasons.
- Telemetry/metrics: aggregated data retained for 90 days; raw logs for 30 days by default.

4) Deletion & Data Subject Requests
- Users can request deletion of their account and associated personal data using contact: privacy@s8ken (replace with monitored address).
- On deletion: remove account, anonymize audit traces where feasible, and revoke sessions.

5) Security
- TLS required in transit for all endpoints.
- Secrets stored in platform secret manager (do not commit .env or secrets).
- Database backups encrypted using KMS-managed keys.

6) Third-party processors
- We will document external services (analytics, error-tracking) in this section and list data shared with each.

7) Contact
- For privacy inquiries: privacy@s8ken
```