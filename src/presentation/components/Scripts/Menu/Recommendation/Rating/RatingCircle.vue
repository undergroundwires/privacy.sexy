<template>
  <span class="circle-container">
    <svg :viewBox="viewBox">
      <circle
        :cx="circleRadiusInPx"
        :cy="circleRadiusInPx"
        :r="circleRadiusWithoutStrokeInPx"
        :stroke-width="circleStrokeWidthStyleValue"
        :class="{
          filled,
        }"
      />
    </svg>
  </span>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

const circleDiameterInPx = 20;
const circleStrokeWidthInPx = 2;

export default defineComponent({
  props: {
    filled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const circleRadiusInPx = computed(() => {
      return circleDiameterInPx / 2;
    });
    const circleRadiusWithoutStrokeInPx = computed(() => {
      return circleRadiusInPx.value - (circleStrokeWidthInPx / 2);
    });
    const viewBox = computed(() => {
      const minX = -circleStrokeWidthInPx / 2;
      const minY = -circleStrokeWidthInPx / 2;
      const width = circleDiameterInPx + circleStrokeWidthInPx;
      const height = circleDiameterInPx + circleStrokeWidthInPx;
      return `${minX} ${minY} ${width} ${height}`;
    });
    const circleStrokeWidthStyleValue = computed(() => {
      return `${circleStrokeWidthInPx}px`;
    });
    return {
      circleRadiusInPx,
      circleDiameterInPx,
      circleStrokeWidthStyleValue,
      circleRadiusWithoutStrokeInPx,
      viewBox,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$circle-color: currentColor;
$circle-height: $font-size-relative-smaller;

svg {
  font-size: $circle-height;
  height: 1em;
  circle {
    stroke: $circle-color;
    &.filled {
      fill: $circle-color;
    }
  }
}
</style>
