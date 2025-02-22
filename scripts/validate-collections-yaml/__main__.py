"""
Description:
  This script validates collection YAML files against the expected schema.

Usage:
  python3 ./scripts/validate-collections-yaml

Notes:
  This script requires the `jsonschema` and `pyyaml` packages (see requirements.txt).
"""
# pylint: disable=missing-function-docstring
import logging
from os import path
import sys
from glob import glob
from typing import List
from jsonschema import exceptions, validate # pylint: disable=import-error
import yaml # pylint: disable=import-error

SCHEMA_FILE_PATH = './src/application/collections/.schema.yaml'
COLLECTIONS_GLOB_PATTERN = './src/application/collections/*.yaml'

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main(schema_file_path: str = SCHEMA_FILE_PATH, collections_glob_pattern: str = COLLECTIONS_GLOB_PATTERN) -> None:
    schema_yaml = read_file(schema_file_path)
    schema_json = convert_yaml_to_json(schema_yaml)
    collection_file_paths = find_collection_files(collections_glob_pattern)
    logging.info(f'Found {len(collection_file_paths)} YAML files to validate.')

    total_invalid_files = 0
    for collection_file_path in collection_file_paths:
        file_name = path.basename(collection_file_path)
        logging.info(f'Validating {file_name}...')
        collection_yaml = read_file(collection_file_path)
        collection_json = convert_yaml_to_json(collection_yaml)
        try:
            validate(instance=collection_json, schema=schema_json)
            logging.info(f'Success: {file_name} is valid.')
        except exceptions.ValidationError as err:
            logging.error(f'Error: Validation failed for {file_name}.')
            logging.error(str(err))
            total_invalid_files += 1

    if total_invalid_files > 0:
        logging.error(f'Validation complete with {total_invalid_files} invalid files.')
        sys.exit(1)
    else:
        logging.info('Validation complete. All files are valid.')
        sys.exit(0)

def read_file(file_path: str) -> str:
    """Reads the content of a file and returns it as a string."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        logging.error(f'Error reading file {file_path}: {e}')
        sys.exit(1)

def find_collection_files(glob_pattern: str) -> List[str]:
    """Finds and returns a list of collection file paths matching the glob pattern."""
    files = glob(glob_pattern)
    filtered_files = [f for f in files if not path.basename(f).startswith('.')]
    return filtered_files

def convert_yaml_to_json(yaml_content: str) -> dict:
    """Converts YAML content to a JSON-compatible dictionary."""
    try:
        return yaml.safe_load(yaml_content)
    except yaml.YAMLError as e:
        logging.error(f'Error converting YAML to JSON: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()
