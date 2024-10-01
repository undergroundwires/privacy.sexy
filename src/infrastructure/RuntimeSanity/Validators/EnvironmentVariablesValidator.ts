import type { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { FactoryValidator, type FactoryFunction } from '../Common/FactoryValidator';
import type { SanityCheckOptions } from '../Common/SanityCheckOptions';

export class EnvironmentVariablesValidator extends FactoryValidator<IEnvironmentVariables> {
  constructor(
    factory: FactoryFunction<IEnvironmentVariables> = () => {
      return EnvironmentVariablesFactory.Current.instance;
    },
  ) {
    super(factory);
  }

  public override name = 'environment variables';

  public override shouldValidate(options: SanityCheckOptions): boolean {
    return options.validateEnvironmentVariables;
  }
}
