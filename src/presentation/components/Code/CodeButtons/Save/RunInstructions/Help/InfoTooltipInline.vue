<template>
  <span
    class="info-container"
  >
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
  props: {
    hasLeftMargin: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss">
.info-container {
  vertical-align: text-top;
}
</style>
