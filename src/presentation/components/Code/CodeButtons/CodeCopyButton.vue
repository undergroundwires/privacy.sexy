<template>
  <IconButton
    text="Copy"
    icon-name="copy"
    @click="copyCode"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import IconButton from './IconButton.vue';

export default defineComponent({
  components: {
    IconButton,
  },
  setup() {
    const { copyText } = injectKey((keys) => keys.useClipboard);
    const { currentCode } = injectKey((keys) => keys.useCurrentCode);

    async function copyCode() {
      await copyText(currentCode.value);
    }

    return {
      copyCode,
    };
  },
});
</script>
