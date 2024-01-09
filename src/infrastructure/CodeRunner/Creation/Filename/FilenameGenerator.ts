import { ScriptFileNameParts } from '../ScriptFileCreator';

export interface FilenameGenerator {
  generateFilename(scriptFileNameParts: ScriptFileNameParts): string;
}
