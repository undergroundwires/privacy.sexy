<template>
  <code class="copyable-command">
    <span class="dollar">$</span>
    <span ref="copyableTextHolder"><slot /></span>
    <span class="copy-action-container">
      <TooltipWrapper>
        <FlatButton icon="copy" @click="copyCode" />
        <template #tooltip>
          Copy
        </template>
      </TooltipWrapper>
    </span>
  </code>
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

    const copyableTextHolderRef = shallowRef<HTMLElement | undefined>();

    async function copyCode() {
      const element = copyableTextHolderRef.value;
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
      copyableTextHolder: copyableTextHolderRef,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.copyable-command {
  display: inline-flex;
  padding: $spacing-relative-x-small;
  font-size: $font-size-absolute-small;
  .dollar {
    margin-right: $spacing-relative-small;
    user-select: none;
  }
  .copy-action-container {
    margin-left: $spacing-relative-medium;
  }
}
</style>
