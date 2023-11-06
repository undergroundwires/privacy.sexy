<template>
  <IconButton
    text="Copy"
    @click="copyCode"
    icon-name="copy"
  />
</template>

<script lang="ts">
import {
  defineComponent, inject,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import IconButton from './IconButton.vue';

export default defineComponent({
  components: {
    IconButton,
  },
  setup() {
    const { copyText } = inject(InjectionKeys.useClipboard)();
    const { currentCode } = inject(InjectionKeys.useCurrentCode)();

    async function copyCode() {
      await copyText(currentCode.value);
    }

    return {
      copyCode,
    };
  },
});
</script>
