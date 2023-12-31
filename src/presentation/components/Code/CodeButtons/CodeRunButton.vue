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
    const { os, isDesktop } = injectKey((keys) => keys.useRuntimeEnvironment);
    const { codeRunner } = injectKey((keys) => keys.useCodeRunner);

    const canRun = computed<boolean>(() => getCanRunState(currentState.value.os, isDesktop, os));

    async function executeCode() {
      if (!codeRunner) { throw new Error('missing code runner'); }
      if (os === undefined) { throw new Error('unidentified host operating system'); }
      await codeRunner.runCode(
        currentContext.state.code.current,
        currentContext.app.info.name,
        os,
      );
    }

    return {
      isDesktopVersion: isDesktop,
      canRun,
      executeCode,
    };
  },
});

function getCanRunState(
  selectedOs: OperatingSystem,
  isDesktopVersion: boolean,
  hostOs: OperatingSystem | undefined,
): boolean {
  const isRunningOnSelectedOs = selectedOs === hostOs;
  return isDesktopVersion && isRunningOnSelectedOs;
}
</script>
