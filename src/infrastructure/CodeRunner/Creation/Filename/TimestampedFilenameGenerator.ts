import type { FilenameGenerator } from './FilenameGenerator';
import type { ScriptFilenameParts } from '../ScriptFileCreator';

export class TimestampedFilenameGenerator implements FilenameGenerator {
  public generateFilename(
    scriptFilenameParts: ScriptFilenameParts,
    date = new Date(),
  ): string {
    validateScriptFilenameParts(scriptFilenameParts);
    const baseFilename = `${createTimeStampForFile(date)}-${scriptFilenameParts.scriptName}`;
    return scriptFilenameParts.scriptFileExtension ? `${baseFilename}.${scriptFilenameParts.scriptFileExtension}` : baseFilename;
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

function validateScriptFilenameParts(scriptFilenameParts: ScriptFilenameParts) {
  if (!scriptFilenameParts.scriptName) {
    throw new Error('Script name is required but not provided.');
  }
  if (scriptFilenameParts.scriptFileExtension?.startsWith('.')) {
    throw new Error('File extension should not start with a dot.');
  }
}
