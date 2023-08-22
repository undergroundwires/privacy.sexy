import { resolve } from 'path';
import tsconfigJson from './tsconfig.json';

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
