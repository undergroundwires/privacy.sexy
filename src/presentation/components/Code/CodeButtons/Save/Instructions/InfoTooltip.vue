<template>
  <TooltipWrapper>
    <AppIcon icon="circle-info" />
    <template v-slot:tooltip>
      <slot />
    </template>
  </TooltipWrapper>
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
