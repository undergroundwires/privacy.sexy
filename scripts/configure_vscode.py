"""
Description:
  This script configures project-level VSCode settings in '.vscode/settings.json' for
  development and installs recommended extensions from '.vscode/extensions.json'.

Usage:
  python3 ./scripts/configure_vscode.py
"""
# pylint: disable=missing-function-docstring

import os
import json
from pathlib import Path
import subprocess
import sys
import re
from typing import Any, Optional, List
from shutil import which

VSCODE_SETTINGS_JSON_FILE: str = '.vscode/settings.json'
VSCODE_EXTENSIONS_JSON_FILE: str = '.vscode/extensions.json'

ESLINT_URL = "https://web.archive.org/web/20230801024405/https://eslint.vuejs.org/user-guide/#visual-studio-code"
GTK_PATH_URL = "https://archive.ph/2024.01.06-003914/https://github.com/microsoft/vscode/issues/179274"
GTK_PATH_URL_ALT = "https://web.archive.org/web/20240106003915/https://github.com/microsoft/vscode/issues/179274"

def main() -> None:
    """Main function to configure VSCode settings and install extensions."""
    ensure_vscode_directory_exists()
    ensure_setting_file_exists()
    add_or_update_settings()
    install_recommended_extensions()

def ensure_vscode_directory_exists() -> None:
    """Ensure the .vscode directory exists."""
    vscode_directory_path = os.path.dirname(VSCODE_SETTINGS_JSON_FILE)
    try:
        os.makedirs(vscode_directory_path, exist_ok=True)
        print_success(f"Created or verified directory: {vscode_directory_path}")
    except OSError as error:
        print_error(f"Error handling directory {vscode_directory_path}: {error}")

def ensure_setting_file_exists() -> None:
    """Ensure the VSCode settings file exists."""
    try:
        if os.path.isfile(VSCODE_SETTINGS_JSON_FILE):
            print_success(f"VSCode settings file exists: {VSCODE_SETTINGS_JSON_FILE}")
            return
        with open(VSCODE_SETTINGS_JSON_FILE, 'w', encoding='utf-8') as file:
            json.dump({}, file, indent=4)
            print_success(f"Created empty {VSCODE_SETTINGS_JSON_FILE}")
    except IOError as error:
        print_error(f"Error creating file {VSCODE_SETTINGS_JSON_FILE}: {error}")
print_success(f"Created empty {VSCODE_SETTINGS_JSON_FILE}")

def add_or_update_settings() -> None:
    """Add or update VSCode settings."""
    configure_setting_key('eslint.validate', ['vue', 'javascript', 'typescript'])
    # Set ESLint validation for specific file types.
    # Details: # pylint: disable-next=line-too-long
    #   - {ESLINT_URL}

    configure_setting_key('terminal.integrated.env.linux', {"GTK_PATH": ""})
    # Unset GTK_PATH on Linux for Electron development in sandboxed environments
    # like Snap or Flatpak VSCode installations, enabling script execution.
    # Details: # pylint: disable-next=line-too-long
    #   - https://archive.ph/2024.01.06-003914/https://github.com/microsoft/vscode/issues/179274, https://web.archive.org/web/20240106003915/https://github.com/microsoft/vscode/issues/179274

    # Disable telemetry
    configure_setting_key('redhat.telemetry.enabled', False)
    configure_setting_key('gitlens.telemetry.enabled', False)

def configure_setting_key(configuration_key: str, desired_value: Any) -> None:
    """Configure a specific setting key in the VSCode settings file."""
    try:
        with open(VSCODE_SETTINGS_JSON_FILE, 'r+', encoding='utf-8') as file:
            settings: dict = json.load(file)
            if configuration_key in settings:
                actual_value = settings[configuration_key]
                if actual_value == desired_value:
                    print_skip(f"Already configured as desired: \"{configuration_key}\"")
                    return
            settings[configuration_key] = desired_value
            file.seek(0)
            json.dump(settings, file, indent=4)
            file.truncate()
        print_success(f"Added or updated configuration: {configuration_key}")
    except json.JSONDecodeError:
        print_error(f"Failed to update JSON for key {configuration_key}.")

def install_recommended_extensions() -> None:
    """Install recommended VSCode extensions."""
    if not os.path.isfile(VSCODE_EXTENSIONS_JSON_FILE):
        print_error(
            f"The extensions.json file does not exist in the path: {VSCODE_EXTENSIONS_JSON_FILE}."
        )
        return
    with open(VSCODE_EXTENSIONS_JSON_FILE, 'r', encoding='utf-8') as file:
        json_content: str = remove_json_comments(file.read())
    try:
        data: dict = json.loads(json_content)
        extensions: List[str] = data.get("recommendations", [])
        if not extensions:
            print_skip(f"No recommendations found in the {VSCODE_EXTENSIONS_JSON_FILE} file.")
            return
        vscode_cli_path = locate_vscode_cli()
        if vscode_cli_path is None:
            print_error('Visual Studio Code CLI (`code`) tool not found.')
            return
        install_vscode_extensions(vscode_cli_path, extensions)
    except json.JSONDecodeError:
        print_error(f"Invalid JSON in {VSCODE_EXTENSIONS_JSON_FILE}")

def locate_vscode_cli() -> Optional[str]:
    """Locate the VSCode CLI tool."""
    vscode_alias = which('code') # More reliable than using `code`, especially on Windows.
    if vscode_alias:
        return vscode_alias
    potential_vscode_cli_paths = [
        # VS Code on macOS may not register 'code' command in PATH
        '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
    ]
    for vscode_cli_candidate_path in potential_vscode_cli_paths:
        if Path(vscode_cli_candidate_path).is_file():
            return vscode_cli_candidate_path
    return None

def remove_json_comments(json_like: str) -> str:
    """Remove comments from JSON-like strings."""
    pattern: str = r'(?:"(?:\\.|[^"\\])*"|/\*[\s\S]*?\*/|//.*)|([^:]//.*$)'
    return re.sub(
        pattern,
        lambda m: '' if m.group(1) else m.group(0), json_like, flags=re.MULTILINE,
    )

def install_vscode_extensions(vscode_cli_path: str, extensions: List[str]) -> None:
    """Install VSCode extensions using the CLI tool."""
    successful_installations = 0
    for ext in extensions:
        try:
            result = subprocess.run(
                [vscode_cli_path, "--install-extension", ext],
                check=True,
                capture_output=True,
                text=True,
            )
            if "already installed" in result.stdout:
                print_skip(f"Extension already installed: {ext}")
            else:
                print_success(f"Installed extension: {ext}")
            successful_installations += 1
            print_subprocess_output(result)
        except subprocess.CalledProcessError as e:
            print_subprocess_output(e)
            print_error(f"Failed to install extension: {ext}")
        except FileNotFoundError:
            print_error(f"Visual Studio Code CLI tool not found: {vscode_cli_path}. Could not install extension: {ext}")
        except Exception as e: # pylint: disable=broad-except
            print_error(f"Failed to install extension '{ext}'. Attempted using Visual Studio Code CLI at: '{vscode_cli_path}'. Encountered error: {e}")
    total_extensions = len(extensions)
    print_installation_results(successful_installations, total_extensions)

def print_subprocess_output(result: subprocess.CompletedProcess[str]) -> None:
    """Print the output of a subprocess."""
    output = '\n'.join([text.strip() for text in [result.stdout, result.stderr] if text])
    if not output:
        return
    formatted_output = '\t' + output.strip().replace('\n', '\n\t')
    print(formatted_output)

def print_installation_results(successful_installations: int, total_extensions: int) -> None:
    """Print the results of the extension installation process."""
    if successful_installations == total_extensions:
        print_success(f"Successfully installed or verified all {total_extensions} recommended extensions.")
    elif successful_installations > 0:
        print_warning(f"Partially successful: Installed or verified {successful_installations} out of {total_extensions} recommended extensions.")
    else:
        print_error("Failed to install any of the recommended extensions.")

def print_error(message: str) -> None:
    """Print an error message."""
    print(f"[ERROR] {message}", file=sys.stderr)

def print_success(message: str) -> None:
    """Print a success message."""
    print(f"[SUCCESS] {message}")

def print_skip(message: str) -> None:
    """Print a skip message."""
    print(f"[SKIPPED] {message}")

def print_warning(message: str) -> None:
    """Print a warning message."""
    print(f"[WARNING] {message}", file=sys.stderr)

if __name__ == "__main__":
    main()
