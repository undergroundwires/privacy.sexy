<template>
  <div ref="containerElement" class="container">
    <slot />
  </div>
</template>

<script lang="ts">
import {
  defineComponent, shallowRef, onMounted, watch,
} from 'vue';
import { useResizeObserver } from './Hooks/Resize/UseResizeObserver';

export default defineComponent({
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    sizeChanged: () => true,
    widthChanged: (width: number) => true,
    heightChanged: (height: number) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(_, { emit }) {
    const containerElement = shallowRef<HTMLElement>();

    let width = 0;
    let height = 0;

    useResizeObserver({
      observedElementRef: containerElement,
      observeCallback: updateSize,
      throttleInMs: 200,
    });

    onMounted(() => {
      watch(() => containerElement.value, async () => {
        updateSize();
      }, { immediate: true });
    });

    function updateSize() {
      const changes = [
        updateWidth(),
        updateHeight(),
      ];
      if (changes.some((c) => c.isChanged)) {
        emit('sizeChanged');
      }
    }

    function updateWidth(): {
      readonly isChanged: boolean;
    } {
      const newWidth = containerElement.value?.offsetWidth ?? 0;
      if (newWidth === width) {
        return { isChanged: false };
      }
      width = newWidth;
      emit('widthChanged', newWidth);
      return { isChanged: true };
    }

    function updateHeight(): {
      readonly isChanged: boolean;
    } {
      const newHeight = containerElement.value?.offsetHeight ?? 0;
      if (newHeight === height) {
        return { isChanged: false };
      }
      height = newHeight;
      emit('heightChanged', newHeight);
      return { isChanged: true };
    }

    return {
      containerElement,
    };
  },
});
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  display: inline-block; // if inline then it has no height or weight
}
</style>
