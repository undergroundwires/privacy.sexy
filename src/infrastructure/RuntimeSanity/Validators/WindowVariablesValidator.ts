import type { WindowVariables } from '@/infrastructure/WindowVariables/WindowVariables';
import { FactoryValidator, type FactoryFunction } from '../Common/FactoryValidator';
import type { SanityCheckOptions } from '../Common/SanityCheckOptions';

export class WindowVariablesValidator extends FactoryValidator<WindowVariables> {
  constructor(factory: FactoryFunction<WindowVariables> = () => window) {
    super(factory);
  }

  public override name = 'window variables';

  public override shouldValidate(options: SanityCheckOptions): boolean {
    return options.validateWindowVariables;
  }
}
