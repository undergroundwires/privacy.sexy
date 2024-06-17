"""
Description:
  This script validates collection YAML files against the expected schema.

Usage:
  python3 ./scripts/validate-collections-yaml

Notes:
  This script requires the `jsonschema` and `pyyaml` packages (see requirements.txt).
"""
# pylint: disable=missing-function-docstring
from os import path
import sys
from glob import glob
from typing import List
from jsonschema import exceptions, validate # pylint: disable=import-error
import yaml # pylint: disable=import-error

SCHEMA_FILE_PATH = './src/application/collections/.schema.yaml'
COLLECTIONS_GLOB_PATTERN = './src/application/collections/*.yaml'

def main() -> None:
    schema_yaml = read_file(SCHEMA_FILE_PATH)
    schema_json = convert_yaml_to_json(schema_yaml)
    collection_file_paths = find_collection_files(COLLECTIONS_GLOB_PATTERN)
    print(f'Found {len(collection_file_paths)} YAML files to validate.')

    total_invalid_files = 0
    for collection_file_path in collection_file_paths:
        file_name = path.basename(collection_file_path)
        print(f'Validating {file_name}...')
        collection_yaml = read_file(collection_file_path)
        collection_json = convert_yaml_to_json(collection_yaml)
        try:
            validate(instance=collection_json, schema=schema_json)
            print(f'Success: {file_name} is valid.')
        except exceptions.ValidationError as err:
            print(f'Error: Validation failed for {file_name}.', file=sys.stderr)
            print(str(err), file=sys.stderr)
            total_invalid_files += 1

    if total_invalid_files > 0:
        print(f'Validation complete with {total_invalid_files} invalid files.', file=sys.stderr)
        sys.exit(1)
    else:
        print('Validation complete. All files are valid.')
        sys.exit(0)

def read_file(file_path: str) -> str:
    with open(file_path, 'r', encoding='utf-8') as file:
        return file.read()

def find_collection_files(glob_pattern: str) -> List[str]:
    files = glob(glob_pattern)
    filtered_files = [f for f in files if not path.basename(f).startswith('.')]
    return filtered_files

def convert_yaml_to_json(yaml_content: str) -> dict:
    return yaml.safe_load(yaml_content)

if __name__ == '__main__':
    main()
