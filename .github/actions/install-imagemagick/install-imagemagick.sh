#!/usr/bin/env bash

main() {
  local install_command
  if ! install_command=$(get_install_command); then
    fatal_error 'Could not find available command to install'
  fi
  if ! eval "$install_command"; then
    echo "Failed to install ImageMagick. Command: ${install_command}"
    exit 1
  fi
  echo 'ImageMagick installation completed successfully'
}

get_install_command() {
  case "$OSTYPE" in
    darwin*)
      ensure_command_exists 'brew'
      echo 'brew install imagemagick'
      ;;
    linux-gnu*)
      if is_ubuntu; then
        ensure_command_exists 'apt'
        echo 'sudo apt install -y imagemagick'
      else
        fatal_error 'Unsupported Linux distribution'
      fi
      ;;
    msys*|cygwin*)
      ensure_command_exists 'choco'
      echo 'choco install -y imagemagick'
      ;;
    *)
      fatal_error "Unsupported operating system: $OSTYPE"
      ;;
  esac
}

ensure_command_exists() {
  local -r command="$1"
  if ! command -v "$command" >/dev/null 2>&1; then
    fatal_error "Command missing: $command"
  fi
}

fatal_error() {
  local -r error_message="$1"
  >&2 echo "❌ $error_message"
  exit 1
}

is_ubuntu() {
  [ -f /etc/os-release ] && grep -qi 'ubuntu' /etc/os-release
}

main
