# System Requirements for the Desktop Version

The following system requirements are the official ones for the desktop version.
While we have tested and confirmed these requirements, the application might also work on other
systems or configurations that haven't undergone official testing.

## Windows

- **Version:** Windows 10 and later.
- **Processor:** Intel Pentium 4 or later.
- **Architecture:** 64-bit (x64), ARM.

> **⚠️ Compatibility Note:**
> ARM version is only compatible with Windows 11 and later.
> It runs non-natively, leading to slower performance due to emulation [1].

## macOS

- **Version:** macOS Catalina (10.15) and later.
- **Architecture:** Intel-based (64-bit), Apple Silicon (ARM).

> **⚠️ Compatibility Note:**
> Apple Silicon version runs non-natively, leading to slower performance due to emulation [2].

## Linux

- **Version:** Ubuntu 18.04 and later, Fedora 32 and later, and Debian 10 and later.
- **Processor:** Intel Pentium 4 or later.
- **Architecture:** 64-bit (x64).

## References

System requirements reflect Electron's platform capabilities [3] and Chromium's recommended configurations [4].

For details on the build process, see [electron-builder configuration file](./../../electron-builder.cjs).

[1]: https://web.archive.org/web/20240428082726/https://learn.microsoft.com/en-us/windows/arm/add-arm-support#emulation-on-arm-based-devices-for-x86-or-x64-windows-apps "Add support Arm devices to your Windows app | Microsoft Learn | learn.microsoft.com"
[2]: https://archive.today/2024.04.28-082901/https://developer.apple.com/documentation/apple-silicon/building-a-universal-macos-binary%23overview "Building a universal macOS binary | Apple Developer Documentation | developer.apple.com"
[3]: https://archive.ph/2024.04.28-082958/https://github.com/electron/electron/blob/main/README.md#platform-support "Platform Support | electron/README.md at main · electron/electron · GitHub | github.com"
[4]: https://web.archive.org/web/20240428082945/https://support.google.com/chrome/a/answer/7100626?hl=en "Chrome browser system requirements - Chrome Enterprise and Education Help | support.google.com"
