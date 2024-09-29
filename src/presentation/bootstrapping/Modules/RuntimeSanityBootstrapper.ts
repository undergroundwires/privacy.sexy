import { validateRuntimeSanity, type RuntimeSanityValidator } from '@/infrastructure/RuntimeSanity/SanityChecks';
import type { Bootstrapper } from '../Bootstrapper';

export class RuntimeSanityBootstrapper implements Bootstrapper {
  constructor(private readonly validator: RuntimeSanityValidator = validateRuntimeSanity) {

  }

  public async bootstrap(): Promise<void> {
    this.validator({
      validateEnvironmentVariables: true,
      validateWindowVariables: true,
    });
  }
}
