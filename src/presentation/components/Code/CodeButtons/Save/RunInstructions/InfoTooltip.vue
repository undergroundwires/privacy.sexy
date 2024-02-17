<template>
  <span class="info-container">
    <TooltipWrapper>
      <AppIcon icon="circle-info" />
      <template #tooltip>
        <slot />
      </template>
    </TooltipWrapper>
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';

export default defineComponent({
  components: {
    TooltipWrapper,
    AppIcon,
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

@mixin apply-style-when-placed-after-non-text {
  * + & {
    @content;
  }
}

.info-container {
  vertical-align: text-top;

  * + & { // If it's followed by any other element
    vertical-align: middle;
    @include set-property-ch-value-with-fallback(
      $property: margin-left,
      $value-in-ch: 0.5,
    )
  }
}
</style>
