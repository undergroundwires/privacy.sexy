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
import { CodeRunner } from '@/infrastructure/CodeRunner';
import { IReadOnlyApplicationContext } from '@/application/Context/IApplicationContext';
import IconButton from './IconButton.vue';

export default defineComponent({
  components: {
    IconButton,
  },
  setup() {
    const { currentState, currentContext } = injectKey((keys) => keys.useCollectionState);
    const { os, isDesktop } = injectKey((keys) => keys.useRuntimeEnvironment);

    const canRun = computed<boolean>(() => getCanRunState(currentState.value.os, isDesktop, os));

    async function executeCode() {
      await runCode(currentContext);
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

async function runCode(context: IReadOnlyApplicationContext) {
  const runner = new CodeRunner();
  await runner.runCode(
    /* code: */ context.state.code.current,
    /* appName: */ context.app.info.name,
    /* fileExtension: */ context.state.collection.scripting.fileExtension,
  );
}
</script>
