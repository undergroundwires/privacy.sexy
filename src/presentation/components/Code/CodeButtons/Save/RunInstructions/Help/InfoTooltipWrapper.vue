<template>
  <span class="info-tooltip-wrapper">
    <span>
      <slot />
    </span>
    <span>
      <InfoTooltipInline>
        <slot name="info" />
      </InfoTooltipInline>
    </span>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import InfoTooltipInline from './InfoTooltipInline.vue';

export default defineComponent({
  components: {
    InfoTooltipInline,
  },
});
</script>

<style lang="scss">
@use "@/presentation/assets/styles/main" as *;

.info-tooltip-wrapper {
  display: flex;
  align-items: center;
  @include set-property-ch-value-with-fallback(
    $property: gap,
    $value-in-ch: 0.5,
  )
}
</style>
