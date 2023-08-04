#!/usr/bin/env bash

# This script ensures that the '.vscode/settings.json' file exists and is configured correctly for ESLint validation on Vue and JavaScript files.
# See https://web.archive.org/web/20230801024405/https://eslint.vuejs.org/user-guide/#visual-studio-code

declare -r SETTINGS_FILE='.vscode/settings.json'
declare -ra CONFIG_KEYS=('vue' 'javascript' 'typescript')
declare -r TEMP_FILE="tmp.$$.json"

main() {
  ensure_vscode_directory_exists
  create_or_update_settings
}

ensure_vscode_directory_exists() {
  local dir_name
  dir_name=$(dirname "${SETTINGS_FILE}")
  if [[ ! -d ${dir_name} ]]; then
    mkdir -p "${dir_name}"
    echo "🎉 Created directory: ${dir_name}"
  fi
}

create_or_update_settings() {
  if [[ ! -f ${SETTINGS_FILE} ]]; then
    create_default_settings
  else
    add_or_update_eslint_validate
  fi
}

create_default_settings() {
  local default_validate
  default_validate=$(printf '%s' "${CONFIG_KEYS[*]}" | jq -R -s -c -M 'split(" ")')
  echo "{ \"eslint.validate\": ${default_validate} }" | jq '.' > "${SETTINGS_FILE}"
  echo "🎉 Created default ${SETTINGS_FILE}"
}

add_or_update_eslint_validate() {
  if ! jq -e '.["eslint.validate"]' "${SETTINGS_FILE}" >/dev/null; then
    add_default_eslint_validate
  else
    update_eslint_validate
  fi
}

add_default_eslint_validate() {
  jq --argjson keys "$(printf '%s' "${CONFIG_KEYS[*]}" \
    | jq -R -s -c 'split(" ")')" '. += {"eslint.validate": $keys}' "${SETTINGS_FILE}" > "${TEMP_FILE}"
  replace_and_confirm
  echo "🎉 Added default 'eslint.validate' to ${SETTINGS_FILE}"
}

update_eslint_validate() {
  local existing_keys
  existing_keys=$(jq '.["eslint.validate"]' "${SETTINGS_FILE}")
  for key in "${CONFIG_KEYS[@]}"; do
    if ! echo "${existing_keys}" | jq 'index("'"${key}"'")' >/dev/null; then
      jq '.["eslint.validate"] += ["'"${key}"'"]' "${SETTINGS_FILE}" > "${TEMP_FILE}"
      mv "${TEMP_FILE}" "${SETTINGS_FILE}"
      echo "🎉 Updated 'eslint.validate' in ${SETTINGS_FILE} for ${key}"
    else
        echo "⏩️ No updated needed for ${key} ${SETTINGS_FILE}."
    fi
  done
}

replace_and_confirm() {
  if mv "${TEMP_FILE}" "${SETTINGS_FILE}"; then
    echo "🎉 Updated ${SETTINGS_FILE}"
  fi
}

main
