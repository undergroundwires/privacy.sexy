<template>
  <MenuOptionList>
    <MenuOptionListItem
      v-for="os in allOses"
      :key="os.name"
      :enabled="currentOs !== os.os"
      @click="changeOs(os.os)"
      :label="os.name"
    />
  </MenuOptionList>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import MenuOptionList from './MenuOptionList.vue';
import MenuOptionListItem from './MenuOptionListItem.vue';

interface IOsViewModel {
  readonly name: string;
  readonly os: OperatingSystem;
}

export default defineComponent({
  components: {
    MenuOptionList,
    MenuOptionListItem,
  },
  setup() {
    const { modifyCurrentContext, currentState } = injectKey((keys) => keys.useCollectionState);
    const { application } = injectKey((keys) => keys.useApplication);

    const allOses = computed<ReadonlyArray<IOsViewModel>>(() => (
      application.getSupportedOsList() ?? [])
      .map((os) : IOsViewModel => (
        {
          os,
          name: renderOsName(os),
        }
      )));

    const currentOs = computed<OperatingSystem>(() => {
      return currentState.value.os;
    });

    function changeOs(newOs: OperatingSystem) {
      modifyCurrentContext((context) => {
        context.changeContext(newOs);
      });
    }

    return {
      allOses,
      currentOs,
      changeOs,
    };
  },
});

function renderOsName(os: OperatingSystem): string {
  switch (os) {
    case OperatingSystem.Windows: return 'Windows';
    case OperatingSystem.macOS: return 'macOS';
    case OperatingSystem.Linux: return 'Linux (preview)';
    default: throw new RangeError(`Cannot render os name: ${OperatingSystem[os]}`);
  }
}
</script>
