import { validateEnvironmentVariables } from './EnvironmentVariablesValidator';
import { ViteEnvironmentVariables } from './Vite/ViteEnvironmentVariables';
import type { IEnvironmentVariablesFactory } from './IEnvironmentVariablesFactory';
import type { IEnvironmentVariables } from './IEnvironmentVariables';

export class EnvironmentVariablesFactory implements IEnvironmentVariablesFactory {
  public static readonly Current = new EnvironmentVariablesFactory();

  public readonly instance: IEnvironmentVariables;

  protected constructor(validator: EnvironmentVariablesValidator = validateEnvironmentVariables) {
    const environment = new ViteEnvironmentVariables();
    validator(environment);
    this.instance = environment;
  }
}

export type EnvironmentVariablesValidator = typeof validateEnvironmentVariables;
