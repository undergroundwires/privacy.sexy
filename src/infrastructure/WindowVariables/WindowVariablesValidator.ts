import { ContextIsolatedElectronDetector } from '@/infrastructure/RuntimeEnvironment/Electron/ContextIsolatedElectronDetector';
import type { ElectronEnvironmentDetector } from '@/infrastructure/RuntimeEnvironment/Electron/ElectronEnvironmentDetector';
import { OperatingSystem } from '@/domain/OperatingSystem';
import {
  type PropertyKeys, isBoolean, isFunction, isNumber, isPlainObject,
} from '@/TypeHelpers';
import type { WindowVariables } from './WindowVariables';

/**
 * Checks for consistency in runtime environment properties injected by Electron preloader.
 */
export function validateWindowVariables(
  variables: Partial<WindowVariables>,
  electronDetector: ElectronEnvironmentDetector = new ContextIsolatedElectronDetector(),
) {
  if (!electronDetector.isRunningInsideElectron()
    || electronDetector.determineElectronProcessType() !== 'renderer') {
    return;
  }
  if (!isPlainObject(variables)) {
    throw new Error('window is not an object');
  }
  const errors = [...testEveryProperty(variables)];
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

function* testEveryProperty(variables: Partial<WindowVariables>): Iterable<string> {
  const tests: Record<PropertyKeys<Required<WindowVariables>>, boolean> = {
    os: testOperatingSystem(variables.os),
    isRunningAsDesktopApplication: testIsRunningAsDesktopApplication(variables),
    codeRunner: testCodeRunner(variables),
    log: testLogger(variables),
    dialog: testDialog(variables),
    scriptDiagnosticsCollector: testScriptDiagnosticsCollector(variables),
  };

  for (const [propertyName, testResult] of Object.entries(tests)) {
    if (!testResult) {
      const propertyValue = variables[propertyName as keyof WindowVariables];
      yield `Unexpected ${propertyName} (${typeof propertyValue})`;
    }
  }
}

function testOperatingSystem(os: unknown): boolean {
  if (os === undefined) {
    return true;
  }
  if (!isNumber(os)) {
    return false;
  }
  return Object
    .values(OperatingSystem)
    .includes(os);
}

function testLogger(variables: Partial<WindowVariables>): boolean {
  return isPlainObject(variables.log)
    && isFunction(variables.log.debug)
    && isFunction(variables.log.info)
    && isFunction(variables.log.error)
    && isFunction(variables.log.warn);
}

function testCodeRunner(variables: Partial<WindowVariables>): boolean {
  return isPlainObject(variables.codeRunner)
    && isFunction(variables.codeRunner.runCode);
}

function testIsRunningAsDesktopApplication(variables: Partial<WindowVariables>): boolean {
  return isBoolean(variables.isRunningAsDesktopApplication)
    && variables.isRunningAsDesktopApplication === true;
}

function testDialog(variables: Partial<WindowVariables>): boolean {
  return isPlainObject(variables.dialog)
    && isFunction(variables.dialog.saveFile)
    && isFunction(variables.dialog.showError);
}

function testScriptDiagnosticsCollector(variables: Partial<WindowVariables>): boolean {
  return isPlainObject(variables.scriptDiagnosticsCollector)
    && isFunction(variables.scriptDiagnosticsCollector.collectDiagnosticInformation);
}
