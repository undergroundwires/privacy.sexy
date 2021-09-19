<template>
    <div id="container">
        <TheSelector class="item" />
        <TheOsChanger class="item"  />
        <TheViewChanger
            class="item"
            v-on:viewChanged="$emit('viewChanged', $event)"
            v-if="!this.isSearching" />
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import TheOsChanger from './TheOsChanger.vue';
import TheSelector from './Selector/TheSelector.vue';
import TheViewChanger from './View/TheViewChanger.vue';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

@Component({
  components: {
    TheSelector,
    TheOsChanger,
    TheViewChanger,
  },
})
export default class TheScriptsMenu extends StatefulVue {
  public isSearching = false;

  private listeners = new Array<IEventSubscription>();

  public destroyed() {
    this.unsubscribeAll();
  }

  protected initialize(): void {
    return;
  }
  protected handleCollectionState(newState: ICategoryCollectionState): void {
    this.subscribe(newState);
  }

  private subscribe(state: ICategoryCollectionState) {
      this.listeners.push(state.filter.filterRemoved.on(() => {
          this.isSearching = false;
      }));
      state.filter.filtered.on(() => {
          this.isSearching = true;
      });
  }
  private unsubscribeAll() {
      this.listeners.forEach((listener) => listener.unsubscribe());
      this.listeners.splice(0, this.listeners.length);
  }
}
</script>

<style scoped lang="scss">
$margin-between-lines: 7px;
#container {
  display: flex;
  flex-wrap: wrap;
  margin-top: -$margin-between-lines;
  .item {
      flex: 1;
      white-space: nowrap;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: $margin-between-lines 5px 0 5px;
      &:first-child {
          justify-content: flex-start;
      }
      &:last-child {
          justify-content: flex-end;
      }
  }
}
</style>
