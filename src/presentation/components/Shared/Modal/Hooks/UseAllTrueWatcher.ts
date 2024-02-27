import { type Ref, computed, watch } from 'vue';

/**
 * This function monitors a set of conditions (represented as refs) and
 * maintains a composite status based on all conditions.
 */
export function useAllTrueWatcher(
  ...conditions: Ref<boolean>[]
) {
  const allMetCallbacks = new Array<() => void>();

  const areAllConditionsMet = computed(() => conditions.every((condition) => condition.value));

  watch(areAllConditionsMet, (areMet) => {
    if (areMet) {
      allMetCallbacks.forEach((action) => action());
    }
  });

  function resetAllConditions() {
    conditions.forEach((condition) => {
      condition.value = false;
    });
  }

  function onAllConditionsMet(callback: () => void) {
    allMetCallbacks.push(callback);
    if (areAllConditionsMet.value) {
      callback();
    }
  }

  return {
    resetAllConditions,
    onAllConditionsMet,
  };
}
