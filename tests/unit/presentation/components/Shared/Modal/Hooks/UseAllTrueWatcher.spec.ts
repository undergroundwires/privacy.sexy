import { describe, it, expect } from 'vitest';
import { ref, nextTick } from 'vue';
import { useAllTrueWatcher } from '@/presentation/components/Shared/Modal/Hooks/UseAllTrueWatcher';

describe('useAllTrueWatcher', () => {
  describe('onAllConditionsMet', () => {
    it('triggers the callback when all conditions turn true', async () => {
      // arrange
      const condition1 = ref(false);
      const condition2 = ref(false);
      const { onAllConditionsMet } = useAllTrueWatcher(condition1, condition2);

      let callbackCalled = false;

      // act
      onAllConditionsMet(() => {
        callbackCalled = true;
      });
      condition1.value = true;
      condition2.value = true;
      await nextTick();

      // assert
      expect(callbackCalled).to.equal(true);
    });

    it('instantly triggers the callback if conditions are true on callback registration', async () => {
      // arrange
      const condition1 = ref(true);
      const condition2 = ref(true);
      const { onAllConditionsMet } = useAllTrueWatcher(condition1, condition2);

      let callbackCalled = false;

      // act
      onAllConditionsMet(() => {
        callbackCalled = true;
      });
      await nextTick();

      // assert
      expect(callbackCalled).to.equal(true);
    });

    it('does not trigger the callback unless all conditions are met', async () => {
      // arrange
      const condition1 = ref(true);
      const condition2 = ref(false);
      const { onAllConditionsMet } = useAllTrueWatcher(condition1, condition2);

      let callbackCalled = false;

      // act
      onAllConditionsMet(() => {
        callbackCalled = true;
      });
      await nextTick();

      // assert
      expect(callbackCalled).to.be.equal(false);
    });

    it('triggers all registered callbacks once all conditions are satisfied', async () => {
      // arrange
      const condition1 = ref(false);
      const condition2 = ref(false);
      const { onAllConditionsMet } = useAllTrueWatcher(condition1, condition2);

      let callbackCount = 0;

      // act
      onAllConditionsMet(() => callbackCount++);
      onAllConditionsMet(() => callbackCount++);
      condition1.value = true;
      condition2.value = true;
      await nextTick();

      // assert
      expect(callbackCount).to.equal(2);
    });

    it('ensures each callback is invoked only once for a single condition set', async () => {
      // arrange
      const condition1 = ref(false);
      const condition2 = ref(false);
      const { onAllConditionsMet } = useAllTrueWatcher(condition1, condition2);

      let callbackCount = 0;

      // act
      onAllConditionsMet(() => callbackCount++);
      condition1.value = true;
      condition2.value = true;
      condition1.value = false;
      condition1.value = true;
      await nextTick();

      // assert
      expect(callbackCount).to.equal(1);
    });

    it('triggers the callback after conditions are sequentially met post-reset', async () => {
      // arrange
      const condition1 = ref(false);
      const condition2 = ref(false);
      const { onAllConditionsMet, resetAllConditions } = useAllTrueWatcher(condition1, condition2);

      let callbackCalled = false;

      // act
      onAllConditionsMet(() => {
        callbackCalled = true;
      });
      condition1.value = true;
      resetAllConditions();
      condition1.value = true;
      condition2.value = true;
      await nextTick();

      // assert
      expect(callbackCalled).to.equal(true);
    });

    it('avoids triggering the callback for single condition post-reset', async () => {
      // arrange
      const condition1 = ref(false);
      const condition2 = ref(false);
      const { onAllConditionsMet, resetAllConditions } = useAllTrueWatcher(condition1, condition2);

      let callbackCalled = false;

      // act
      condition1.value = true;
      condition2.value = true;
      resetAllConditions();
      onAllConditionsMet(() => {
        callbackCalled = true;
      });
      condition1.value = true;
      await nextTick();

      // assert
      expect(callbackCalled).to.equal(false);
    });
  });

  describe('resetAllConditions', () => {
    it('returns all conditions to their default false state', async () => {
      // arrange
      const condition1 = ref(true);
      const condition2 = ref(true);
      const { resetAllConditions } = useAllTrueWatcher(condition1, condition2);

      // act
      resetAllConditions();
      await nextTick();

      // assert
      expect(condition1.value).to.be.equal(false);
      expect(condition2.value).to.be.equal(false);
    });
  });
});
