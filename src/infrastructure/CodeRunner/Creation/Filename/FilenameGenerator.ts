import type { ScriptFilenameParts } from '../ScriptFileCreator';

export interface FilenameGenerator {
  generateFilename(scriptFilenameParts: ScriptFilenameParts): string;
}
