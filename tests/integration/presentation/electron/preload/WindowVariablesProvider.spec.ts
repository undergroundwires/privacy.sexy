import { it, describe, expect } from 'vitest';
import { provideWindowVariables } from '@/presentation/electron/preload/WindowVariablesProvider';

describe('WindowVariablesProvider', () => {
  describe('provideWindowVariables', () => {
    describe('conforms to Electron\'s context bridging requirements', () => {
      // https://www.electronjs.org/docs/latest/api/context-bridge
      const variables = provideWindowVariables();
      Object.entries(variables).forEach(([key, value]) => {
        it(`\`${key}\` conforms to allowed types for context bridging`, () => {
          expect(checkAllowedType(value)).to.equal(true);
        });
      });
    });
  });
});

function checkAllowedType(value: unknown) {
  const type = typeof value;
  if (['string', 'number', 'boolean', 'function'].includes(type)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(checkAllowedType);
  }
  if (type === 'object' && value !== null && value !== undefined) {
    return (
      // Every key should be a string
      Object.keys(value).every((key) => typeof key === 'string')
      // Every value should be of allowed type
      && Object.values(value).every(checkAllowedType)
    );
  }
  return false;
}
