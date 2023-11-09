<template>
  <span class="code-wrapper">
    <span class="dollar">$</span>
    <code ref="codeElement"><slot /></code>
    <TooltipWrapper>
      <AppIcon
        class="copy-button"
        icon="copy"
        @click="copyCode"
      />
      <template v-slot:tooltip>
        Copy
      </template>
    </TooltipWrapper>
  </span>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from 'vue';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { injectKey } from '@/presentation/injectionSymbols';

export default defineComponent({
  components: {
    TooltipWrapper,
    AppIcon,
  },
  setup() {
    const { copyText } = injectKey((keys) => keys.useClipboard);

    const codeElement = shallowRef<HTMLElement | undefined>();

    async function copyCode() {
      const element = codeElement.value;
      if (!element) {
        throw new Error('Code element could not be found.');
      }
      const code = element.textContent;
      if (!code) {
        throw new Error('Code element does not contain any text.');
      }
      await copyText(code);
    }

    return {
      copyCode,
      codeElement,
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
