# Security Policy

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

**DO NOT** create a public GitHub issue for security vulnerabilities.

### How to Report

1. **Email**: Send details to security@s8ken
2. **Private GitHub Security Advisory**: Use GitHub's private vulnerability reporting feature
3. **Encrypted Communication**: If needed, request our PGP key

### What to Include

Please include as much of the following information as possible:

- **Component**: Which part of the system (frontend, backend, infrastructure)
- **Version**: Affected version or commit hash
- **Description**: Clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Proof of Concept**: Code, screenshots, or demonstration
- **Impact**: Potential impact and attack scenarios
- **Suggested Fix**: If you have ideas for mitigation

### Our Response Process

1. **Acknowledgment**: We'll acknowledge receipt within 48 hours
2. **Investigation**: We'll investigate and validate the report
3. **Timeline**: We'll provide an estimated timeline for fixes
4. **Resolution**: We'll develop and test a fix
5. **Disclosure**: We'll coordinate responsible disclosure
6. **Credit**: We'll credit you in our security advisories (if desired)

### Scope

This policy applies to:
- All code in this repository
- Deployed instances we maintain
- Dependencies and third-party integrations

### Out of Scope

- Social engineering attacks
- Physical attacks
- Denial of service attacks
- Issues in third-party services beyond our control

### Responsible Disclosure

We ask that you:
- Give us reasonable time to fix issues before public disclosure
- Don't access or modify data that isn't yours
- Don't perform attacks that could harm availability or data integrity
- Don't use automated scanners without permission

### Security Best Practices

For developers contributing to this project:

- Never commit secrets, API keys, or credentials
- Use environment variables for configuration
- Follow secure coding practices
- Keep dependencies updated
- Use static analysis tools
- Implement proper input validation
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization

Thank you for helping keep Symbi Trust Protocol secure!