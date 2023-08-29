import { WindowVariables } from '../WindowVariables/WindowVariables';
import { ISystemOperations } from './ISystemOperations';

export function getWindowInjectedSystemOperations(
  windowVariables: Partial<WindowVariables> = window,
): ISystemOperations {
  if (!windowVariables) {
    throw new Error('missing window');
  }
  if (!windowVariables.system) {
    throw new Error('missing system');
  }
  return windowVariables.system;
}
