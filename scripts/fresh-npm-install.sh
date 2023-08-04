#!/usr/bin/env bash

# Description:
#   This script ensures npm is available, removes existing node modules, optionally
#   removes package-lock.json (when -n flag is used), installs dependencies and runs unit tests.
# Usage:
#   ./fresh-npm-install.sh         # Regular execution
#   ./fresh-npm-install.sh -n      # Non-deterministic mode (removes package-lock.json)

declare NON_DETERMINISTIC_FLAG=0


main() {
  parse_args "$@"
  ensure_npm_is_available
  ensure_npm_root
  remove_existing_modules
  if [[ $NON_DETERMINISTIC_FLAG -eq 1 ]]; then
    remove_package_lock_json
  fi
  install_dependencies
  run_unit_tests
}

ensure_npm_is_available() {
  if ! command -v npm &> /dev/null; then
    log::fatal 'npm could not be found, please install it first.'
  fi
}

ensure_npm_root() {
  if [ ! -f package.json ]; then
    log::fatal 'Current directory is not a npm root. Please run the script in a npm root directory.'
  fi
}

remove_existing_modules() {
  if [ -d ./node_modules ]; then
    log::info 'Removing existing node modules...'
    if ! rm -rf ./node_modules; then
      log::fatal 'Could not remove existing node modules.'
    fi
  fi
}

install_dependencies() {
  log::info 'Installing dependencies...'
  if ! npm install; then
    log::fatal 'Failed to install dependencies.'
  fi
}

remove_package_lock_json() {
  if [ -f ./package-lock.json ]; then
    log::info 'Removing package-lock.json...'
    if ! rm -rf ./package-lock.json; then
      log::fatal 'Could not remove package-lock.json.'
    fi
  fi
}

run_unit_tests() {
  log::info 'Running unit tests...'
  if ! npm run test:unit; then
    pwd
    log::fatal 'Failed to run unit tests.'
  fi
}

log::info() {
  local -r message="$1"
  echo "📣 ${message}"
}

log::fatal() {
  local -r message="$1"
  echo "❌ ${message}" >&2
  exit 1
}

parse_args() {
  while getopts "n" opt; do
    case ${opt} in
      n)
        NON_DETERMINISTIC_FLAG=1
        ;;
      \?)
        echo "Invalid option: $OPTARG" 1>&2
        exit 1
        ;;
    esac
  done
}

main "$1"
