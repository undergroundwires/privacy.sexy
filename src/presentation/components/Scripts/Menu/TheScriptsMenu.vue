<template>
  <div id="container">
    <TheSelector class="item" />
    <TheOsChanger class="item" />
    <TheViewChanger
      class="item"
      v-on:viewChanged="$emit('viewChanged', $event)"
      v-if="!isSearching" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, onUnmounted, inject,
} from 'vue';
import { useCollectionStateKey } from '@/presentation/injectionSymbols';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import TheOsChanger from './TheOsChanger.vue';
import TheSelector from './Selector/TheSelector.vue';
import TheViewChanger from './View/TheViewChanger.vue';

export default defineComponent({
  components: {
    TheSelector,
    TheOsChanger,
    TheViewChanger,
  },
  setup() {
    const { onStateChange, events } = inject(useCollectionStateKey)();

    const isSearching = ref(false);

    onStateChange((state) => {
      subscribe(state);
    }, { immediate: true });

    onUnmounted(() => {
      unsubscribeAll();
    });

    function subscribe(state: IReadOnlyCategoryCollectionState) {
      events.register(state.filter.filterRemoved.on(() => {
        isSearching.value = false;
      }));
      events.register(state.filter.filtered.on(() => {
        isSearching.value = true;
      }));
    }

    function unsubscribeAll() {
      events.unsubscribeAll();
    }

    return {
      isSearching,
    };
  },
});
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
