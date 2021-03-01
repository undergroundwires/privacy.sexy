<template>
  <div class="container">
    <!-- <div>OS:</div> -->
    <div class="os-list">
      <div v-for="os in this.allOses" :key="os.name">
        <span
          class="os-name"
          v-bind:class="{ 'current': currentOs === os.os }"
          v-on:click="changeOsAsync(os.os)">
          {{ os.name }}
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { StatefulVue } from '@/presentation/StatefulVue';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ApplicationFactory } from '@/application/ApplicationFactory';

@Component
export default class TheOsChanger extends StatefulVue {
  public allOses: Array<{ name: string, os: OperatingSystem }> = [];
  public currentOs: OperatingSystem = OperatingSystem.Unknown;

  public async created() {
    const app = await ApplicationFactory.Current.getAppAsync();
    this.allOses = app.getSupportedOsList()
      .map((os) => ({ os, name: renderOsName(os) }));
  }
  public async changeOsAsync(newOs: OperatingSystem) {
    const context = await this.getCurrentContextAsync();
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
@import "@/presentation/styles/fonts.scss";
@import "@/presentation/styles/colors.scss";
.container {
  font-family: $normal-font;
  display: flex;
  align-items: center;
  .os-list {
    display: flex;
    margin-left: 0.25rem;
    div + div::before {
        content: "|";
        margin-left: 0.5rem;
    }
    .os-name {
      &:not(.current) {
        cursor: pointer;
        &:hover {
            font-weight: bold;
            text-decoration: underline;
        }
      }
      &.current {
        color: $gray;
      }
    }
  }
}
</style>
