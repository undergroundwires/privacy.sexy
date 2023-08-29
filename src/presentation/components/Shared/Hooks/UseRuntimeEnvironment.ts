import { IRuntimeEnvironment } from '@/infrastructure/RuntimeEnvironment/IRuntimeEnvironment';

export function useRuntimeEnvironment(environment: IRuntimeEnvironment) {
  if (!environment) {
    throw new Error('missing environment');
  }
  return environment;
}
