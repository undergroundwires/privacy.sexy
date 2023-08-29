import { validateRuntimeSanity } from '@/infrastructure/RuntimeSanity/SanityChecks';
import { IVueBootstrapper } from '../IVueBootstrapper';

export class RuntimeSanityValidator implements IVueBootstrapper {
  constructor(private readonly validator = validateRuntimeSanity) {

  }

  public bootstrap(): void {
    this.validator({
      validateEnvironmentVariables: true,
      validateWindowVariables: true,
    });
  }
}
