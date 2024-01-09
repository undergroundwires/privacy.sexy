import { ScriptFileNameParts } from '../ScriptFileCreator';
import { FilenameGenerator } from './FilenameGenerator';

export class TimestampedFilenameGenerator implements FilenameGenerator {
  public generateFilename(
    scriptFileNameParts: ScriptFileNameParts,
    date = new Date(),
  ): string {
    validateScriptFileNameParts(scriptFileNameParts);
    const baseFileName = `${createTimeStampForFile(date)}-${scriptFileNameParts.scriptName}`;
    return scriptFileNameParts.scriptFileExtension ? `${baseFileName}.${scriptFileNameParts.scriptFileExtension}` : baseFileName;
  }
}

/** Generates a timestamp for the filename in 'YYYY-MM-DD_HH-MM-SS' format. */
function createTimeStampForFile(date: Date): string {
  return date
    .toISOString()
    .replace(/T/, '_')
    .replace(/:/g, '-')
    .replace(/\..+/, '');
}

function validateScriptFileNameParts(scriptFileNameParts: ScriptFileNameParts) {
  if (!scriptFileNameParts.scriptName) {
    throw new Error('Script name is required but not provided.');
  }
  if (scriptFileNameParts.scriptFileExtension?.startsWith('.')) {
    throw new Error('File extension should not start with a dot.');
  }
}
