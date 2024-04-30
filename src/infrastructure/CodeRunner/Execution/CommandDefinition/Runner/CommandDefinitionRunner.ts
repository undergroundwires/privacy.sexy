import type { ScriptFileExecutionOutcome } from '../../ScriptFileExecutor';
import type { CommandDefinition } from '../CommandDefinition';

export interface CommandDefinitionRunner {
  runCommandDefinition(
    commandDefinition: CommandDefinition,
    filePath: string,
  ): Promise<ScriptFileExecutionOutcome>;
}
