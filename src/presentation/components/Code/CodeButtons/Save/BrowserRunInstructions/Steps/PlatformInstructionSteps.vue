<template>
  <component
    :is="component"
    v-if="component"
    :filename="filename"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import MacOsInstructions from './Platforms/MacOsInstructions.vue';
import LinuxInstructions from './Platforms/LinuxInstructions.vue';
import WindowsInstructions from './Platforms/WindowsInstructions.vue';
import type { Component } from 'vue';

export default defineComponent({
  props: {
    filename: {
      type: String,
      required: true,
    },
  },
  setup() {
    const { currentState } = injectKey((keys) => keys.useCollectionState);

    const component = computed<Component>(() => getInstructionsComponent(
      currentState.value.collection.os,
    ));

    return {
      component,
    };
  },
});

function getInstructionsComponent(operatingSystem: OperatingSystem): Component {
  switch (operatingSystem) {
    case OperatingSystem.macOS:
      return MacOsInstructions;
    case OperatingSystem.Linux:
      return LinuxInstructions;
    case OperatingSystem.Windows:
      return WindowsInstructions;
    default:
      throw new Error(`No instructions for the operating system: ${OperatingSystem[operatingSystem]}`);
  }
}
</script>
