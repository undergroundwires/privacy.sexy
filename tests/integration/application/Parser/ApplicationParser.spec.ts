import { describe, it, expect } from 'vitest';
import { parseApplication } from '@/application/Parser/ApplicationParser';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/unit/shared/TestTiming';

describe('ApplicationParser', () => {
  describe('parseApplication', () => {
    it('can parse current application', {
      timeout: BASE_APP_COMPILATION_TIMEOUT_MS,
    }, () => {
      // act
      const act = () => parseApplication();
      // assert
      expect(act).to.not.throw();
    });
  });
});
