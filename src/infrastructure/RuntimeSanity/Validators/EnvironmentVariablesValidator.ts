import { IEnvironmentVariables } from '@/infrastructure/EnvironmentVariables/IEnvironmentVariables';
import { EnvironmentVariablesFactory } from '@/infrastructure/EnvironmentVariables/EnvironmentVariablesFactory';
import { ISanityCheckOptions } from '../Common/ISanityCheckOptions';
import { FactoryValidator, FactoryFunction } from '../Common/FactoryValidator';

export class EnvironmentVariablesValidator extends FactoryValidator<IEnvironmentVariables> {
  constructor(
    factory: FactoryFunction<IEnvironmentVariables> = () => {
      return EnvironmentVariablesFactory.Current.instance;
    },
  ) {
    super(factory);
  }

  public override name = 'environment variables';

  public override shouldValidate(options: ISanityCheckOptions): boolean {
    return options.validateEnvironmentVariables;
  }
}
