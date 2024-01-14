import { ScriptFilenameParts } from '../ScriptFileCreator';

export interface FilenameGenerator {
  generateFilename(scriptFilenameParts: ScriptFilenameParts): string;
}
