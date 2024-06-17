# validate-collections-yaml

This script validates YAML collection files against a predefined schema to ensure their integrity.

## Prerequisites

- Python 3.x installed on your system.

## Running in a Virtual Environment (Recommended)

Using a virtual environment isolates dependencies and prevents conflicts.

1. **Create a virtual environment:**

   ```bash
   python3 -m venv ./scripts/validate-collections-yaml/.venv
   ```

2. **Activate the virtual environment:**

   ```bash
   source ./scripts/validate-collections-yaml/.venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   python3 -m pip install -r ./scripts/validate-collections-yaml/requirements.txt
   ```

4. **Run the script:**

   ```bash
   python3 ./scripts/validate-collections-yaml
   ```

## Running Globally

Running the script globally is less recommended due to potential dependency conflicts.

1. **Install dependencies:**

   ```bash
   python3 -m pip install -r ./scripts/validate-collections-yaml/requirements.txt
   ```

2. **Run the script:**

   ```bash
   python3 ./scripts/validate-collections-yaml
   ```
