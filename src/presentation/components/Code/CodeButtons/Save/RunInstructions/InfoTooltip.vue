<template>
  <div class="info-container">
    <TooltipWrapper>
      <AppIcon icon="circle-info" />
      <template #tooltip>
        <slot />
      </template>
    </TooltipWrapper>
  </div>
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
.info-container {
  display: inline-block;
  margin-left: 0.15em; // Do not style icon itself to ensure correct tooltip alignment
  vertical-align: middle;
}
</style>
