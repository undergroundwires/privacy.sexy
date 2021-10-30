<template>
  <MenuOptionList>
      <MenuOptionListItem
        v-for="os in this.allOses" :key="os.name"
        :enabled="currentOs !== os.os"
        @click="changeOs(os.os)"
        :label="os.name"
        />
  </MenuOptionList>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ApplicationFactory } from '@/application/ApplicationFactory';
import MenuOptionList from './MenuOptionList.vue';
import MenuOptionListItem from './MenuOptionListItem.vue';

@Component({
  components: {
    MenuOptionList,
    MenuOptionListItem,
  },
})
export default class TheOsChanger extends StatefulVue {
  public allOses: Array<{ name: string, os: OperatingSystem }> = [];
  public currentOs?: OperatingSystem = null;

  public async created() {
    const app = await ApplicationFactory.Current.getApp();
    this.allOses = app.getSupportedOsList()
      .map((os) => ({ os, name: renderOsName(os) }));
  }
  public async changeOs(newOs: OperatingSystem) {
    const context = await this.getCurrentContext();
    context.changeContext(newOs);
  }

  protected handleCollectionState(newState: ICategoryCollectionState): void {
    this.currentOs = newState.os;
    this.$forceUpdate(); // v-bind:class is not updated otherwise
  }
}

function renderOsName(os: OperatingSystem): string {
    switch (os) {
      case OperatingSystem.Windows: return 'Windows';
      case OperatingSystem.macOS: return 'macOS';
      default: throw new RangeError(`Cannot render os name: ${OperatingSystem[os]}`);
    }
}
</script>

<style scoped lang="scss">

</style>
