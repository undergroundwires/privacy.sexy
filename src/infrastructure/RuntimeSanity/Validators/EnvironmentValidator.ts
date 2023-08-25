import { Environment } from '@/infrastructure/Environment/Environment';
import { IEnvironment } from '@/infrastructure/Environment/IEnvironment';
import { ISanityCheckOptions } from '../Common/ISanityCheckOptions';
import { FactoryValidator, FactoryFunction } from '../Common/FactoryValidator';

export class EnvironmentValidator extends FactoryValidator<IEnvironment> {
  constructor(factory: FactoryFunction<IEnvironment> = () => Environment.CurrentEnvironment) {
    super(factory);
  }

  public override name = 'environment';

  public override shouldValidate(options: ISanityCheckOptions): boolean {
    return options.validateEnvironment;
  }
}
