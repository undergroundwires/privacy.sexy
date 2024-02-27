import { validateRuntimeSanity } from '@/infrastructure/RuntimeSanity/SanityChecks';
import type { Bootstrapper } from '../Bootstrapper';

export class RuntimeSanityValidator implements Bootstrapper {
  constructor(private readonly validator = validateRuntimeSanity) {

  }

  public async bootstrap(): Promise<void> {
    this.validator({
      validateEnvironmentVariables: true,
      validateWindowVariables: true,
    });
  }
}
