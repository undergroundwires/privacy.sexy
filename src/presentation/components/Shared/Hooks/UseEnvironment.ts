import { IEnvironment } from '@/infrastructure/Environment/IEnvironment';

export function useEnvironment(environment: IEnvironment) {
  if (!environment) {
    throw new Error('missing environment');
  }
  return environment;
}
