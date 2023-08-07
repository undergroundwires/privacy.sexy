<template>
  <div
    class="slider"
    v-bind:style="{
      '--vertical-margin': verticalMargin,
      '--first-min-width': firstMinWidth,
      '--first-initial-width': firstInitialWidth,
      '--second-min-width': secondMinWidth,
    }"
  >
    <div class="first" ref="firstElement">
      <slot name="first" />
    </div>
    <SliderHandle class="handle" @resized="onResize($event)" />
    <div class="second">
      <slot name="second" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
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
    const firstElement = ref<HTMLElement>();

    function onResize(displacementX: number): void {
      const leftWidth = firstElement.value.offsetWidth + displacementX;
      firstElement.value.style.width = `${leftWidth}px`;
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
