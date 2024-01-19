<template>
  <div
    class="slider"
    :style="{
      '--vertical-margin': verticalMargin,
      '--first-min-width': firstMinWidth,
      '--first-initial-width': firstInitialWidth,
      '--second-min-width': secondMinWidth,
    }"
  >
    <div ref="firstElement" class="first">
      <slot name="first" />
    </div>
    <SliderHandle class="handle" @resized="onResize($event)" />
    <div class="second">
      <slot name="second" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from 'vue';
import SliderHandle from './SliderHandle.vue';

export default defineComponent({
  components: {
    SliderHandle,
  },
  props: {
    verticalMargin: {
      type: String,
      required: true,
    },
    firstMinWidth: {
      type: String,
      required: true,
    },
    firstInitialWidth: {
      type: String,
      required: true,
    },
    secondMinWidth: {
      type: String,
      required: true,
    },
  },
  setup() {
    const firstElement = shallowRef<HTMLElement>();

    function onResize(displacementX: number): void {
      const element = firstElement.value;
      if (!element) {
        throw new Error('The element reference ref is not correctly assigned to a DOM element.');
      }
      const leftWidth = element.offsetWidth + displacementX;
      element.style.width = `${leftWidth}px`;
    }

    return {
      firstElement,
      onResize,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/presentation/assets/styles/main" as *;

.slider {
  display: flex;
  flex-direction: row;
  .first {
    min-width: var(--first-min-width);
    width: var(--first-initial-width);
  }
  .second {
    flex: 1;
    min-width: var(--second-min-width);
  }
  @media screen and (max-width: $media-vertical-view-breakpoint) {
    flex-direction: column;
    .first {
      width: auto !important;
    }
    .second {
      margin-top: var(--vertical-margin);
    }
    .handle {
      display: none;
    }
  }
}
</style>
