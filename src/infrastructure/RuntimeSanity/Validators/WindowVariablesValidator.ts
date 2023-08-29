import { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { ISanityCheckOptions } from '../Common/ISanityCheckOptions';
import { FactoryValidator, FactoryFunction } from '../Common/FactoryValidator';

export class WindowVariablesValidator extends FactoryValidator<WindowVariables> {
  constructor(factory: FactoryFunction<WindowVariables> = () => window) {
    super(factory);
  }

  public override name = 'window variables';

  public override shouldValidate(options: ISanityCheckOptions): boolean {
    return options.validateWindowVariables;
  }
}
