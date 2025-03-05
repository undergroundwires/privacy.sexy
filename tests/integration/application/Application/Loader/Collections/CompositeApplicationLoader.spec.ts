import { describe, it, expect } from 'vitest';
import { BASE_APP_COMPILATION_TIMEOUT_MS } from '@tests/unit/shared/TestTiming';
import { loadApplicationComposite } from '@/application/Application/Loader/CompositeApplicationLoader';

describe('CompositeApplicationLoader', () => {
  describe('loadApplicationComposite', () => {
    it('can parse current application', {
      timeout: BASE_APP_COMPILATION_TIMEOUT_MS,
    }, () => {
      // act
      const act = () => loadApplicationComposite();
      // assert
      expect(act).to.not.throw();
    });
  });
});
