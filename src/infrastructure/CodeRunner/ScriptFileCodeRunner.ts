import { CodeRunner } from '@/application/CodeRunner';
import { Logger } from '@/application/Common/Log/Logger';
import { ElectronLogger } from '../Log/ElectronLogger';
import { ScriptFileExecutor } from './Execution/ScriptFileExecutor';
import { VisibleTerminalScriptExecutor } from './Execution/VisibleTerminalScriptFileExecutor';
import { ScriptFileCreator } from './Creation/ScriptFileCreator';
import { ScriptFileCreationOrchestrator } from './Creation/ScriptFileCreationOrchestrator';

export class ScriptFileCodeRunner implements CodeRunner {
  constructor(
    private readonly scriptFileExecutor: ScriptFileExecutor = new VisibleTerminalScriptExecutor(),
    private readonly scriptFileCreator: ScriptFileCreator = new ScriptFileCreationOrchestrator(),
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public async runCode(
    code: string,
  ): Promise<void> {
    this.logger.info('Initiating script running process.');
    try {
      const scriptFilePath = await this.scriptFileCreator.createScriptFile(code);
      await this.scriptFileExecutor.executeScriptFile(scriptFilePath);
      this.logger.info(`Successfully ran script at ${scriptFilePath}`);
    } catch (error) {
      this.logger.error(`Error running script: ${error.message}`, error);
      throw error;
    }
  }
}
