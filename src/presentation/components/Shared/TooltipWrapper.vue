<!--
  This component acts as a wrapper for the v-tooltip to solve the following:
    - Direct inclusion of inline HTML in tooltip components has challenges such as
      - absence of linting or editor support,
      - involves cumbersome string concatenation.
      This component caters to these issues by permitting HTML usage in a slot.
    - It provides an abstraction for a third-party component which simplifies
      switching and acts as an anti-corruption layer.
-->

<template>
  <div class="tooltip-container" v-tooltip.top-center="tooltipHtml">
    <slot />
    <div class="tooltip-content" ref="tooltipWrapper">
      <slot name="tooltip" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, onMounted, onUpdated, nextTick,
} from 'vue';

export default defineComponent({
  setup() {
    const tooltipWrapper = ref<HTMLElement | undefined>();
    const tooltipHtml = ref<string | undefined>();

    onMounted(() => updateTooltipHTML());

    onUpdated(() => {
      nextTick(() => {
        updateTooltipHTML();
      });
    });

    function updateTooltipHTML() {
      const newValue = tooltipWrapper.value?.innerHTML;
      const oldValue = tooltipHtml.value;
      if (newValue === oldValue) {
        return;
      }
      tooltipHtml.value = newValue;
    }

    return {
      tooltipWrapper,
      tooltipHtml,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.tooltip-container {
  display: inline-block;
}

.tooltip-content {
  display: none;
}
</style>
