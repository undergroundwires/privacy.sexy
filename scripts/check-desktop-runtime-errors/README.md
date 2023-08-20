# check-desktop-runtime-errors

This script automates the processes of:

1) Building
2) Packaging
3) Installing
4) Executing
5) Verifying Electron distributions

It runs the application for a duration and detects runtime errors in the packaged application via:

- **Log verification**: Checking application logs for errors and validating successful application initialization.
- **`stderr` monitoring**: Continuous listening to the `stderr` stream for unexpected errors.
- **Window title inspection**: Checking for window titles that indicate crashes before logging becomes possible.

Upon error, the script captures a screenshot (if `--screenshot` is provided) and terminates.

## Usage

```sh
node ./scripts/check-desktop-runtime-errors
```

## Options

- `--build`: Clears the electron distribution directory and forces a rebuild of the Electron app.
- `--screenshot`: Takes a screenshot of the desktop environment after running the application.

This module provides utilities for building, executing, and validating Electron desktop apps.
It can be used to automate checking for runtime errors during development.

## Configs

Configurations are defined in [`config.js`](./config.js).
