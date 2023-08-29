import { WindowVariables } from './WindowVariables';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends WindowVariables { }
}
