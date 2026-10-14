# validate-collections-yaml

This script validates YAML collection files against a predefined schema to ensure their integrity.

## Prerequisites

- [uv](https://docs.astral.sh/uv/) installed.
- Python 3.12 or later available to uv.

## Run

From the repository root, create or update the validator's isolated environment and run it:

```bash
uv sync --project ./scripts/validate-collections-yaml
uv run --project ./scripts/validate-collections-yaml python ./scripts/validate-collections-yaml
```

The validator only reads the collection schema and YAML files. Do not run it from the validator directory because its file paths are relative to the repository root.

## Update CI Requirements Export

`requirements.txt` is a fully pinned, pip-compatible export for the existing CI workflow. After changing the project dependencies, regenerate it from the lockfile at the repository root:

```bash
uv lock --project ./scripts/validate-collections-yaml
uv export --project ./scripts/validate-collections-yaml --locked --format requirements.txt --no-emit-project --no-header --output-file ./scripts/validate-collections-yaml/requirements.txt
```
