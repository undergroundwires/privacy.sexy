<template>
  <svg
    :style="{
      '--circle-stroke-width': `${circleStrokeWidthInPx}px`,
    }"
    :viewBox="viewBox"
  >
    <circle
      :cx="circleRadiusInPx"
      :cy="circleRadiusInPx"
      :r="circleRadiusWithoutStrokeInPx"
      :class="{
        filled,
      }"
    />
  </svg>
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
    return {
      circleRadiusInPx,
      circleDiameterInPx,
      circleStrokeWidthInPx,
      circleRadiusWithoutStrokeInPx,
      viewBox,
    };
  },
});
</script>

<style scoped lang="scss">
$circleColor: currentColor;
$circleHeight: 0.8em;
$circleStrokeWidth: var(--circle-stroke-width);

svg {
  height: $circleHeight;
  circle {
    stroke: $circleColor;
    stroke-width: $circleStrokeWidth;
    &.filled {
      fill: $circleColor;
    }
  }
}
</style>
