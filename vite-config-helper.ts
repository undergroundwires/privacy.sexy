import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VITE_USER_DEFINED_ENVIRONMENT_KEYS } from './src/infrastructure/EnvironmentVariables/Vite/ViteEnvironmentKeys';
import tsconfigJson from './tsconfig.json' assert { type: 'json' };
import packageJson from './package.json' assert { type: 'json' };

export function getAliasesFromTsConfig(): Record<string, string> {
  const { paths } = tsconfigJson.compilerOptions;
  return Object.keys(paths).reduce((aliases, pathName) => {
    const pathFolder = paths[pathName][0];
    const aliasFolder = pathFolder.substring(0, pathFolder.length - 1); // trim * from end
    const aliasName = pathName.substring(0, pathName.length - 2); // trim /* from end
    const aliasPath = resolve(getSelfDirectoryAbsolutePath(), aliasFolder);
    aliases[aliasName] = aliasPath;
    return aliases;
  }, {});
}

export function getSelfDirectoryAbsolutePath() {
  const filePath = fileURLToPath(import.meta.url);
  const directoryPath = dirname(filePath);
  return directoryPath;
}

type ViteEnvironmentKeyValues = {
  [K in
    typeof VITE_USER_DEFINED_ENVIRONMENT_KEYS[keyof typeof VITE_USER_DEFINED_ENVIRONMENT_KEYS]
  ]: string
};

export function getClientEnvironmentVariables(): Record<string, string> {
  const environmentVariables: ViteEnvironmentKeyValues = {
    [VITE_USER_DEFINED_ENVIRONMENT_KEYS.NAME]: packageJson.name,
    [VITE_USER_DEFINED_ENVIRONMENT_KEYS.VERSION]: packageJson.version,
    [VITE_USER_DEFINED_ENVIRONMENT_KEYS.REPOSITORY_URL]: packageJson.repository.url,
    [VITE_USER_DEFINED_ENVIRONMENT_KEYS.HOMEPAGE_URL]: packageJson.homepage,
    [VITE_USER_DEFINED_ENVIRONMENT_KEYS.SLOGAN]: packageJson.slogan,
  };
  return Object.entries(environmentVariables).reduce((acc, [key, value]) => {
    const newKey = `import.meta.env.${key}`;
    const newValue = JSON.stringify(value);
    return { ...acc, [newKey]: newValue };
  }, {});
}
