# Desktop vs. Web Features

This table highlights differences between the desktop and web versions of `privacy.sexy`.

| Feature | Desktop | Web |
| ------- | ------- | --- |
| [Usage without installation](#usage-without-installation) | 🔴 Not available | 🟢 Available |
| [Offline usage](#offline-usage) | 🟢 Available | 🟡 Partially available |
| [Auto-updates](#auto-updates) | 🟢 Available | 🟢 Available |
| [Logging](#logging) | 🟢 Available | 🔴 Not available |
| [Script execution](#script-execution) | 🟢 Available | 🔴 Not available |
| [Error handling](#error-handling) | 🟢 Advanced | 🟡 Limited |
| [Native dialogs](#error-handling) | 🟢 Available | 🔴 Not available |

## Feature descriptions

### Usage without installation

You can use the web version directly in a browser without installation.
The desktop version requires download and installation.

> **Note for Linux users:** On Linux, privacy.sexy is available as an `AppImage`, a portable format that doesn't need traditional installation.
> This allows Linux users to use the desktop version without full installation, akin to the web version.

### Offline usage

The web version, once loaded, supports offline use.
Desktop version inherently allows offline usage.

### Auto-updates

Both the desktop and web versions of privacy.sexy provide timely access to the latest features and security improvements. The updates are automatically deployed from source code, reflecting the latest changes for enhanced security and reliability. For more details, see [CI/CD documentation](./ci-cd.md).

The desktop version ensures secure delivery through cryptographic signatures and version checks.

[Security is a top priority](./../SECURITY.md#update-security-and-integrity) at privacy.sexy.

> **Note for macOS users:** On macOS, the desktop version's auto-update process involves manual steps due to Apple's code signing costs.
> Users get notified about updates but might need to complete the installation manually.
> Consider [donating](https://github.com/sponsors/undergroundwires) to help improve this process ❤️.

### Logging

The desktop version supports logging of activities to aid in troubleshooting.
This feature is not available in the web version.

Log file locations vary by operating system:

- macOS: `$HOME/Library/Logs/privacy.sexy`
- Linux: `$HOME/.config/privacy.sexy/logs`
- Windows: `%APPDATA%\privacy.sexy\logs`

### Script execution

The desktop version of privacy.sexy enables direct script execution, providing a seamless and integrated experience.
This direct execution capability isn't available in the web version due to inherent browser restrictions.

**Script execution history:**

For enhanced auditability and easier troubleshooting, the desktop version keeps a record of executed scripts in designated directories.
These locations vary based on the operating system:

- macOS: `$HOME/Library/Application Support/privacy.sexy/runs`
- Linux: `$HOME/.config/privacy.sexy/runs`
- Windows: `%APPDATA%\privacy.sexy\runs`

### Error handling

The desktop version of privacy.sexy features advanced error handling capabilities.
It employs robust and reliable execution strategies, including self-healing mechanisms, and provides guidance and troubleshooting information to resolve issues effectively.
In contrast, the web version has more basic error handling due to browser limitations and the nature of web applications.

### Native dialogs

The desktop version uses native dialogs, offering more features and reliability compared to the browser's file system dialogs.
These native dialogs provide a more integrated and user-friendly experience, aligning with the operating system's standard interface and functionalities.
