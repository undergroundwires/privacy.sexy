<template>
  <span class="code-wrapper">
    <span class="dollar">$</span>
    <code><slot /></code>
    <TooltipWrapper>
      <font-awesome-icon
        class="copy-button"
        :icon="['fas', 'copy']"
        @click="copyCode"
      />
      <template v-slot:tooltip>
        Copy
      </template>
    </TooltipWrapper>
  </span>
</template>

<script lang="ts">
import { defineComponent, useSlots } from 'vue';
import { Clipboard } from '@/infrastructure/Clipboard';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';

export default defineComponent({
  components: {
    TooltipWrapper,
  },
  setup() {
    const slots = useSlots();

    function copyCode() {
      const code = slots.default()[0].text;
      Clipboard.copyText(code);
    }

    return {
      copyCode,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.code-wrapper {
  display:flex;
  white-space: nowrap;
  justify-content: space-between;
  font-family: $font-normal;
  background-color: $color-primary-darker;
  color: $color-on-primary;
  align-items: center;
  padding: 0.2rem;
  .dollar {
    margin-right: 0.5rem;
    font-size: 0.8rem;
    user-select: none;
  }
  .copy-button {
    margin-left: 1rem;
    @include clickable;
    @include hover-or-touch {
      color: $color-primary;
    }
  }
  code {
    font-size: 1rem;
  }
}
</style>
