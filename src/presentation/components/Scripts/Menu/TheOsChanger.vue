<template>
  <MenuOptionList>
    <MenuOptionListItem
      v-for="os in allOses"
      :key="os.name"
      :enabled="currentOs !== os.os"
      :label="os.name"
      @click="changeOs(os.os)"
    />
  </MenuOptionList>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { getOperatingSystemDisplayName } from '@/presentation/components/Shared/OperatingSystemNames';
import MenuOptionList from './MenuOptionList.vue';
import MenuOptionListItem from './MenuOptionListItem.vue';

interface OperatingSystemOption {
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

    const allOses = computed<ReadonlyArray<OperatingSystemOption>>(
      () => application
        .getSupportedOsList()
        .map((os) : OperatingSystemOption => ({
          os,
          name: getOperatingSystemDisplayName(os),
        })),
    );

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
</script>
