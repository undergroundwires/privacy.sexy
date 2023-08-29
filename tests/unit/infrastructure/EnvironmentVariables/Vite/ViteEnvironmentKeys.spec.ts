import { expect, describe, it } from 'vitest';
import { VITE_ENVIRONMENT_KEYS } from '@/infrastructure/EnvironmentVariables/Vite/ViteEnvironmentKeys';

describe('VITE_ENVIRONMENT_KEYS', () => {
  describe('each key should have a non-empty string', () => {
    Object.entries(VITE_ENVIRONMENT_KEYS).forEach(([key, value]) => {
      it(`The key ${key} should have a non-empty string value`, () => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });
});
