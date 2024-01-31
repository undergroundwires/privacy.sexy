<template>
  <span class="code-wrapper">
    <span class="dollar">$</span>
    <code ref="codeElement"><slot /></code>
    <div class="copy-action-container">
      <TooltipWrapper>
        <FlatButton icon="copy" @click="copyCode" />
        <template #tooltip>
          Copy
        </template>
      </TooltipWrapper>
    </div>
  </span>
</template>

<script lang="ts">
import { defineComponent, shallowRef } from 'vue';
import TooltipWrapper from '@/presentation/components/Shared/TooltipWrapper.vue';
import { injectKey } from '@/presentation/injectionSymbols';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';

export default defineComponent({
  components: {
    TooltipWrapper,
    FlatButton,
  },
  setup() {
    const { copyText } = injectKey((keys) => keys.useClipboard);

    const codeElementRef = shallowRef<HTMLElement | undefined>();

    async function copyCode() {
      const element = codeElementRef.value;
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
      codeElement: codeElementRef,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.code-wrapper {
  display: inline-flex;
  white-space: nowrap;
  justify-content: space-between;
  font-family: $font-normal;
  background-color: $color-primary-darker;
  color: $color-on-primary;
  align-items: center;
  padding: 0.2rem;
  .dollar {
    margin-right: 0.5rem;
    font-size: $font-size-smaller;
    user-select: none;
  }
  .copy-action-container {
    margin-left: 1rem;
  }
  code {
    font-size: $font-size-small;
  }
}
</style>
