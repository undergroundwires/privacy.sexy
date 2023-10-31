<template>
  <div ref="containerElement" class="container">
    <slot />
  </div>
</template>

<script lang="ts">
import {
  defineComponent, shallowRef, onMounted, onBeforeUnmount,
} from 'vue';
import { useResizeObserverPolyfill } from '@/presentation/components/Shared/Hooks/UseResizeObserverPolyfill';

export default defineComponent({
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    sizeChanged: () => true,
    widthChanged: (width: number) => true,
    heightChanged: (height: number) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(_, { emit }) {
    const { resizeObserverReady } = useResizeObserverPolyfill();

    const containerElement = shallowRef<HTMLElement>();

    let width = 0;
    let height = 0;
    let observer: ResizeObserver;

    onMounted(() => {
      width = containerElement.value.offsetWidth;
      height = containerElement.value.offsetHeight;

      resizeObserverReady.then(() => {
        observer = new ResizeObserver(updateSize);
        observer.observe(containerElement.value);
      });

      fireChangeEvents();
    });

    onBeforeUnmount(() => {
      observer?.disconnect();
    });

    function updateSize() {
      let sizeChanged = false;
      if (isWidthChanged()) {
        updateWidth(containerElement.value.offsetWidth);
        sizeChanged = true;
      }
      if (isHeightChanged()) {
        updateHeight(containerElement.value.offsetHeight);
        sizeChanged = true;
      }
      if (sizeChanged) {
        emit('sizeChanged');
      }
    }

    function updateWidth(newWidth: number) {
      width = newWidth;
      emit('widthChanged', newWidth);
    }

    function updateHeight(newHeight: number) {
      height = newHeight;
      emit('heightChanged', newHeight);
    }

    function fireChangeEvents() {
      updateWidth(containerElement.value.offsetWidth);
      updateHeight(containerElement.value.offsetHeight);
      emit('sizeChanged');
    }

    function isWidthChanged(): boolean {
      return width !== containerElement.value.offsetWidth;
    }

    function isHeightChanged(): boolean {
      return height !== containerElement.value.offsetHeight;
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
