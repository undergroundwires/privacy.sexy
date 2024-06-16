"""
Description:
  This script checks the existing collection files and add `id` field to missing script/categories
  by generating a new unique id.

Usage:
  python3 ./scripts/add_missing_ids.py

Note:
  This command must run from the project root directory.
"""
# pylint: disable=missing-function-docstring,missing-class-docstring

import os
from pathlib import Path
import re
import sys
from typing import List, Set
import uuid

def main() -> None:
    collections_directory = './src/application/collections'
    yaml_file_paths = find_yaml_files(collections_directory)
    if not yaml_file_paths:
        print('No collection files found', file=sys.stderr)
        sys.exit(1)
    print(f'Total collection files found: {len(yaml_file_paths)}.')

    for yaml_file_path in yaml_file_paths:
        print(f'Processing: {yaml_file_path}')
        old_contents = read_yaml_file(yaml_file_path)
        processed_yaml = add_id_to_yaml_content(old_contents)
        if not processed_yaml.total_new_ids:
            print('👌 No changes needed, no missing IDs.')
            continue
        save_yaml_file(yaml_file_path, processed_yaml.new_content)
        print(f'🆕 Added missing IDs (total: {processed_yaml.total_new_ids}).')

class YamlIdAdditionResult:
    def __init__(self, new_content: str, total_new_ids: int):
        self.new_content = new_content
        self.total_new_ids = total_new_ids

def add_id_to_yaml_content(content: str) -> YamlIdAdditionResult:
    # Avoiding external yaml libraries to preserve YAML structure and comments.
    existing_ids = find_existing_ids(content)
    original_lines = content.splitlines()
    new_lines = []
    total_new_ids = 0
    functions_section_reached = False
    for i, line in enumerate(original_lines):
        if is_functions_section_start(line):
            functions_section_reached = True
        if (not functions_section_reached) and \
           is_executable_name(line) and \
           (not has_line_before_defined_id(i, original_lines)):
            indentation = len(line) - len(line.lstrip())
            new_id = generate_unique_id(existing_ids)
            total_new_ids += 1
            existing_ids.add(new_id)
            id_line_prefix = "#" if is_preceding_line_comment(i, original_lines) else ""
            id_line = f'{" " * indentation}{id_line_prefix}id: {new_id}'
            new_lines.append(id_line)  # Insert new id line before 'name:'
        new_lines.append(line)
    return YamlIdAdditionResult(
        new_content=os.linesep.join(new_lines),
        total_new_ids=total_new_ids,
    )

def is_functions_section_start(collection_file_line: str) -> bool:
    return 'functions:' in collection_file_line

def is_executable_name(collection_file_line: str) -> bool:
    non_commented_line = get_non_commented_line(collection_file_line)
    stripped_line = non_commented_line.lstrip()
    return stripped_line.startswith('name:') or stripped_line.startswith('category:')

def is_preceding_line_comment(current_line: int, all_lines: list[str]) -> bool:
    return current_line > 0 and all_lines[current_line-1].strip().startswith('#')

def has_line_before_defined_id(current_line: int, all_lines: list[str]) -> bool:
    if current_line == 0:
        return False
    line_before = all_lines[current_line-1]
    non_commented_line = get_non_commented_line(line_before)
    stripped_line = non_commented_line.lstrip()
    return stripped_line.startswith('id:')

def save_yaml_file(absolute_file_path: str, new_contents: str) -> None:
    with open(absolute_file_path, 'w', encoding='utf-8') as file:
        file.write(new_contents)

def read_yaml_file(absolute_file_path: str) -> str:
    with open(absolute_file_path, 'r', encoding='utf-8') as file:
        return file.read()

def find_yaml_files(directory_path: str) -> List[str]:
    return list(Path(directory_path).glob('**/*.yaml'))

def find_existing_ids(content: str) -> Set[str]:
    pattern = r'^\s*#?\s*id:\s*(\S+)' # Matches 'id:' lines including commented lines
    return set(re.findall(pattern, content, re.MULTILINE))

def get_non_commented_line(yaml_line: str) -> str:
    pattern = re.compile(r'^\s*#\s?(.*)$')
    match = pattern.match(yaml_line)
    return match.group(1) if match else yaml_line

def generate_unique_id(generated_ids: Set[str]) -> str:
    new_id = generate_new_id()
    while new_id in generated_ids:
        new_id = generate_new_id()
    return new_id

def generate_new_id() -> str:
    partial_uuid = str(uuid.uuid4()).split('-', maxsplit=1)[0]
    if is_numeric(partial_uuid): # Creates issues with yaml parsing, yaml considering it as a number
        return generate_new_id()
    return partial_uuid

def is_numeric(string: str) -> bool:
    numeric_pattern = re.compile(r'^\d+$|^[+-]?\d+\.?\d*[eE][+-]?\d+$')
    return numeric_pattern.match(string)

if __name__ == "__main__":
    main()
