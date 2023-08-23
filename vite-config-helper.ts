import { resolve } from 'path';
import { VITE_ENVIRONMENT_KEYS } from './src/infrastructure/Metadata/Vite/ViteEnvironmentKeys';
import tsconfigJson from './tsconfig.json';
import packageJson from './package.json';

export function getAliasesFromTsConfig(): Record<string, string> {
  const { paths } = tsconfigJson.compilerOptions;
  return Object.keys(paths).reduce((aliases, pathName) => {
    const pathFolder = paths[pathName][0];
    const aliasFolder = pathFolder.substring(0, pathFolder.length - 1); // trim * from end
    const aliasName = pathName.substring(0, pathName.length - 2); // trim /* from end
    const aliasPath = resolve(__dirname, aliasFolder);
    aliases[aliasName] = aliasPath;
    return aliases;
  }, {});
}

type ViteEnvironmentKeyValues = {
  [K in typeof VITE_ENVIRONMENT_KEYS[keyof typeof VITE_ENVIRONMENT_KEYS]]: string
};

export function getClientEnvironmentVariables(): Record<string, string> {
  const environmentVariables: ViteEnvironmentKeyValues = {
    [VITE_ENVIRONMENT_KEYS.NAME]: packageJson.name,
    [VITE_ENVIRONMENT_KEYS.VERSION]: packageJson.version,
    [VITE_ENVIRONMENT_KEYS.REPOSITORY_URL]: packageJson.repository.url,
    [VITE_ENVIRONMENT_KEYS.HOMEPAGE_URL]: packageJson.homepage,
    [VITE_ENVIRONMENT_KEYS.SLOGAN]: packageJson.slogan,
  };
  return Object.entries(environmentVariables).reduce((acc, [key, value]) => {
    const newKey = `import.meta.env.${key}`;
    const newValue = JSON.stringify(value);
    return { ...acc, [newKey]: newValue };
  }, {});
}
