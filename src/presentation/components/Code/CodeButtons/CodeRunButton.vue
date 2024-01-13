<template>
  <IconButton
    v-if="canRun"
    text="Run"
    icon-name="play"
    @click="executeCode"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import IconButton from './IconButton.vue';

export default defineComponent({
  components: {
    IconButton,
  },
  setup() {
    const { currentState, currentContext } = injectKey((keys) => keys.useCollectionState);
    const { os, isRunningAsDesktopApplication } = injectKey((keys) => keys.useRuntimeEnvironment);
    const { codeRunner } = injectKey((keys) => keys.useCodeRunner);

    const canRun = computed<boolean>(() => getCanRunState(
      currentState.value.os,
      isRunningAsDesktopApplication,
      os,
    ));

    async function executeCode() {
      if (!codeRunner) { throw new Error('missing code runner'); }
      await codeRunner.runCode(
        currentContext.state.code.current,
        currentContext.state.collection.scripting.fileExtension,
      );
    }

    return {
      canRun,
      executeCode,
    };
  },
});

function getCanRunState(
  selectedOs: OperatingSystem,
  isRunningAsDesktopApplication: boolean,
  hostOs: OperatingSystem | undefined,
): boolean {
  const isRunningOnSelectedOs = selectedOs === hostOs;
  return isRunningAsDesktopApplication && isRunningOnSelectedOs;
}
</script>
