<template>
  <div class="container" v-if="hasCode">
    <CodeRunButton class="code-button" />
    <CodeSaveButton class="code-button" />
    <CodeCopyButton class="code-button" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent, computed, inject,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import CodeRunButton from './CodeRunButton.vue';
import CodeCopyButton from './CodeCopyButton.vue';
import CodeSaveButton from './Save/CodeSaveButton.vue';

export default defineComponent({
  components: {
    CodeRunButton,
    CodeCopyButton,
    CodeSaveButton,
  },
  setup() {
    const { currentCode } = inject(InjectionKeys.useCurrentCode)();

    const hasCode = computed<boolean>(() => currentCode.value.length > 0);

    return {
      hasCode,
    };
  },
});
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 30px;
}
.code-button {
  width: 10%;
  min-width: 90px;
}
</style>
