import { Logger } from '@/application/Common/Log/Logger';
import { ScriptFileName } from '@/application/CodeRunner/ScriptFileName';
import { CodeRunner } from '@/application/CodeRunner/CodeRunner';
import { ElectronLogger } from '../Log/ElectronLogger';
import { ScriptFileExecutor } from './Execution/ScriptFileExecutor';
import { ScriptFileCreator } from './Creation/ScriptFileCreator';
import { ScriptFileCreationOrchestrator } from './Creation/ScriptFileCreationOrchestrator';
import { VisibleTerminalScriptExecutor } from './Execution/VisibleTerminalScriptFileExecutor';

export class ScriptFileCodeRunner implements CodeRunner {
  constructor(
    private readonly scriptFileExecutor
    : ScriptFileExecutor = new VisibleTerminalScriptExecutor(),
    private readonly scriptFileCreator: ScriptFileCreator = new ScriptFileCreationOrchestrator(),
    private readonly logger: Logger = ElectronLogger,
  ) { }

  public async runCode(
    code: string,
    fileExtension: string,
  ): Promise<void> {
    this.logger.info('Initiating script running process.');
    try {
      const scriptFilePath = await this.scriptFileCreator.createScriptFile(code, {
        scriptName: ScriptFileName,
        scriptFileExtension: fileExtension,
      });
      await this.scriptFileExecutor.executeScriptFile(scriptFilePath);
      this.logger.info(`Successfully ran script at ${scriptFilePath}`);
    } catch (error) {
      this.logger.error(`Error running script: ${error.message}`, error);
      throw error;
    }
  }
}
