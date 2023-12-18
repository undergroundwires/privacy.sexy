import { createElectronLogger } from '@/infrastructure/Log/ElectronLogger';
import { Logger } from '@/application/Common/Log/Logger';
import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { TemporaryFileCodeRunner } from '@/infrastructure/CodeRunner/TemporaryFileCodeRunner';
import { CodeRunner } from '@/application/CodeRunner';
import { convertPlatformToOs } from './NodeOsMapper';
import { createSecureFacade } from './SecureFacadeCreator';

export function provideWindowVariables(
  createCodeRunner: CodeRunnerFactory = () => new TemporaryFileCodeRunner(),
  createLogger: LoggerFactory = () => createElectronLogger(),
  convertToOs = convertPlatformToOs,
  createApiFacade: ApiFacadeFactory = createSecureFacade,
): WindowVariables {
  return {
    isDesktop: true,
    log: createApiFacade(createLogger(), ['info', 'debug', 'warn', 'error']),
    os: convertToOs(process.platform),
    codeRunner: createApiFacade(createCodeRunner(), ['runCode']),
  };
}

export type LoggerFactory = () => Logger;

export type CodeRunnerFactory = () => CodeRunner;

export type ApiFacadeFactory = typeof createSecureFacade;
