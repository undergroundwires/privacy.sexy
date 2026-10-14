# System Requirements for the Desktop Version

These requirements describe builds from the current source and its Electron 44 dependency [2].
They do not change the requirements of previously released installers.
Desktop launch, installation, and update behavior still require testing on each target platform.

## Windows

- **Version:** Windows 10 and later.
- **Architecture:** 64-bit (x86-64), ARM (ARM64).

> **⚠️ Compatibility Note:**
> ARM version is only compatible with Windows 11 and later.
> It runs non-natively, leading to slower performance due to emulation [1].

## macOS

- **Version:** macOS Ventura (13) and later.
- **Architecture:** Intel-based (x86-64), Apple silicon (ARM64).

## Linux

- **Version:** A distribution version supported by both Chromium and its distribution maintainer [2].
- **Architecture:** 64-bit (x86-64).

## References

System requirements reflect Electron's platform capabilities [2].
An operating system meeting Electron's minimum does not mean every privacy script applies to it.
Check each script's documented edition, build, update, and feature requirements separately.

For details on the build process, see [electron-builder configuration file](./../../electron-builder.cjs).

[1]: https://web.archive.org/web/20240428082726/https://learn.microsoft.com/en-us/windows/arm/add-arm-support#emulation-on-arm-based-devices-for-x86-or-x64-windows-apps "Add support Arm devices to your Windows app | Microsoft Learn | learn.microsoft.com"
[2]: https://github.com/electron/electron/blob/v44.3.0/README.md#platform-support "Electron 44.3.0 platform support"
