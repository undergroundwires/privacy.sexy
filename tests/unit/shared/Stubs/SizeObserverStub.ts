import { defineComponent, ref, watch } from 'vue';
import type { Ref } from 'vue';

const COMPONENT_SIZE_OBSERVER_NAME = 'SizeObserver';

export function createSizeObserverStub(
  widthRef: Readonly<Ref<number>> = ref(500),
) {
  const component = defineComponent({
    name: COMPONENT_SIZE_OBSERVER_NAME,
    emits: {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      widthChanged: (newWidth: number) => true,
      /* eslint-enable @typescript-eslint/no-unused-vars */
    },
    setup: (_, { emit }) => {
      watch(widthRef, (newValue) => {
        emit('widthChanged', newValue);
      });
    },
    template: `<div id="${COMPONENT_SIZE_OBSERVER_NAME}-stub"><slot /></div>`,
  });
  return {
    name: COMPONENT_SIZE_OBSERVER_NAME,
    component,
  };
}
