# Pipelines

Pipelines are found under [`.github/workflows`](./../.github/workflows).

## Pipeline types

They are categorized based on their type:

- `tests`: Different types of tests to verify functionality.
- `checks`: Other controls such as vulnerability scans or styling checks.
- `release`: Pipelines used for release of deployment such as building and testing.

## Naming conventions

Pipeline files are named using: **`<type>.<name>.yaml`**.

**`type`**: Sub-folders do not work for GitHub workflows so that's why `<type>.` prefix is used. See also [pipeline types](#pipeline-types).

**`name`**: Pipeline themselves are named using kebab case. It allows for easier URL references for their status badges. E.g. file name `tests.unit.yaml`, pipeline name: `name: unit-tests`
