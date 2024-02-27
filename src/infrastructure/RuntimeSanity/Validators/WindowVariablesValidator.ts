import type { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { FactoryValidator, type FactoryFunction } from '../Common/FactoryValidator';
import type { ISanityCheckOptions } from '../Common/ISanityCheckOptions';

export class WindowVariablesValidator extends FactoryValidator<WindowVariables> {
  constructor(factory: FactoryFunction<WindowVariables> = () => window) {
    super(factory);
  }

  public override name = 'window variables';

  public override shouldValidate(options: ISanityCheckOptions): boolean {
    return options.validateWindowVariables;
  }
}
