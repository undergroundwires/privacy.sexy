import type { Logger } from '@/application/Common/Log/Logger';
import { ScriptFilename } from '@/application/CodeRunner/ScriptFilename';
import type {
  CodeRunError, CodeRunOutcome, CodeRunner, FailedCodeRun,
} from '@/application/CodeRunner/CodeRunner';
import { ElectronLogger } from '../Log/ElectronLogger';
import { VisibleTerminalScriptExecutor } from './Execution/VisibleTerminalScriptFileExecutor';
import { ScriptFileCreationOrchestrator } from './Creation/ScriptFileCreationOrchestrator';
import type { ScriptFileExecutor } from './Execution/ScriptFileExecutor';
import type { ScriptFileCreator } from './Creation/ScriptFileCreator';

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
  ): Promise<CodeRunOutcome> {
    this.logger.info('Initiating script running process.');
    const {
      success: isFileCreated, scriptFileAbsolutePath, error: fileCreationError,
    } = await this.scriptFileCreator.createScriptFile(code, {
      scriptName: ScriptFilename,
      scriptFileExtension: fileExtension,
    });
    if (!isFileCreated) {
      return createFailure(fileCreationError);
    }
    const {
      success: isFileSuccessfullyExecuted,
      error: fileExecutionError,
    } = await this.scriptFileExecutor.executeScriptFile(
      scriptFileAbsolutePath,
    );
    if (!isFileSuccessfullyExecuted) {
      return createFailure(fileExecutionError);
    }
    this.logger.info(`Successfully ran script at ${scriptFileAbsolutePath}`);
    return {
      success: true,
    };
  }
}

function createFailure(
  error: CodeRunError,
): FailedCodeRun {
  return {
    success: false,
    error,
  };
}
