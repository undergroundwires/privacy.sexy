import { OperatingSystem } from '@/domain/OperatingSystem';
import {
  PropertyKeys, isBoolean, isFunction, isNumber, isPlainObject,
} from '@/TypeHelpers';
import { WindowVariables } from './WindowVariables';

/**
 * Checks for consistency in runtime environment properties injected by Electron preloader.
 */
export function validateWindowVariables(variables: Partial<WindowVariables>) {
  if (!isPlainObject(variables)) {
    throw new Error('window is not an object');
  }
  const errors = [...testEveryProperty(variables)];
  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

function* testEveryProperty(variables: Partial<WindowVariables>): Iterable<string> {
  const tests: {
    [K in PropertyKeys<Required<WindowVariables>>]: boolean;
  } = {
    os: testOperatingSystem(variables.os),
    isDesktop: testIsDesktop(variables.isDesktop),
    codeRunner: testCodeRunner(variables),
    log: testLogger(variables),
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
  if (!variables.isDesktop) {
    return true;
  }
  return isPlainObject(variables.log);
}

function testCodeRunner(variables: Partial<WindowVariables>): boolean {
  if (!variables.isDesktop) {
    return true;
  }
  return isPlainObject(variables.codeRunner)
    && isFunction(variables.codeRunner.runCode);
}

function testIsDesktop(isDesktop: unknown): boolean {
  if (isDesktop === undefined) {
    return true;
  }
  return isBoolean(isDesktop);
}
