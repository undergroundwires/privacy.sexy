import { join } from 'path';
import { readdir } from 'fs/promises';
import { die } from '../../../utils/log';
import { exists } from '../../../utils/io';
import { getAppName } from '../../../utils/npm';

export async function findByFilePattern(
  pattern: string,
  directory: string,
  projectRootDir: string,
): Promise<ArtifactLocation | never> {
  if (!directory) { throw new Error('Missing directory'); }
  if (!pattern) { throw new Error('Missing file pattern'); }

  if (!await exists(directory)) {
    return die(`Directory does not exist: ${directory}`);
  }

  const directoryContents = await readdir(directory);
  const appName = await getAppName(projectRootDir);
  const regexPattern = pattern
    /* eslint-disable no-template-curly-in-string */
    .replaceAll('${name}', escapeRegExp(appName))
    .replaceAll('${version}', '\\d+\\.\\d+\\.\\d+')
    .replaceAll('${ext}', '.*');
  /* eslint-enable no-template-curly-in-string */
  const regex = new RegExp(`^${regexPattern}$`);
  const foundFileNames = directoryContents.filter((file) => regex.test(file));
  if (!foundFileNames.length) {
    return die(`No files found matching pattern "${pattern}" in ${directory} directory.`);
  }
  if (foundFileNames.length > 1) {
    return die(`Found multiple files matching pattern "${pattern}": ${foundFileNames.join(', ')}`);
  }
  return {
    absolutePath: join(directory, foundFileNames[0]),
  };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface ArtifactLocation {
  readonly absolutePath: string;
}
