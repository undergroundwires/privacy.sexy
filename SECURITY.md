# Security Policy

Security is a top priority at privacy.sexy.
Please report any discovered vulnerabilities responsibly.

## Reporting a Vulnerability

Efforts to responsibly disclose findings are greatly appreciated. To report a security vulnerability, follow these steps:

- For general vulnerabilities, [open an issue](https://github.com/undergroundwires/privacy.sexy/issues/new/choose) using the bug report template.
- For sensitive matters, [contact the developer directly](https://undergroundwires.dev).

## Security Report Handling

Upon receiving a security report, the process involves:

- Confirming the report and identifying affected components.
- Assessing the impact and severity of the issue.
- Fixing the vulnerability and planning a release to address it.
- Keeping the reporter informed about progress.

## Security Practices

### Application Security

privacy.sexy adopts a defense in depth strategy to protect users on multiple layers:

- **Link Protection:**
  privacy.sexy ensures each external link has special attributes for your privacy and security.
  These attributes block the new site from accessing the privacy.sexy page, increasing your online safety and privacy.
- **Content Security Policies (CSP):**
  privacy.sexy actively follows security guidelines from the Open Web Application Security Project (OWASP) at strictest level.
  This approach protects against attacks like Cross Site Scripting (XSS) and data injection.
- **Host System Access Control:**
  The desktop application segregates code sections based on their access levels.
  This provides a critical defense mechanism, prevents attackers from introducing harmful code into the app, known as injection attacks.

### Update Security and Integrity

privacy.sexy benefits from automated update processes including security tests. Automated deployments from source code ensure immediate and secure updates, mirroring the latest source code. This aligns the deployed application with the expected source code, enhancing transparency and trust. For more details, see [CI/CD Documentation](./docs/ci-cd.md).

Every desktop update undergoes a thorough verification process. Updates are cryptographically signed to ensure authenticity and integrity, preventing tampered versions from reaching your device. Version checks are conducted to prevent downgrade attacks.

### Testing

privacy.sexy's testing approach includes a mix of automated and community-driven tests.
Details on testing practices are available in the [Testing Documentation](./docs/tests.md).

## Support

For help or any questions, [submit a GitHub issue](https://github.com/undergroundwires/privacy.sexy/issues/new/choose). Addressing security concerns is a priority, and we ensure the necessary support.

Support privacy.sexy's commitment to security by [making a donation ❤️](https://github.com/sponsors/undergroundwires). Your contributions aid in maintaining and enhancing the project's security features.

---

Active contribution to the safety and security of privacy.sexy is thanked. This collaborative effort keeps the project resilient and trustworthy for all.
