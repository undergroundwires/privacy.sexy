<template>
  <div id="container">
    <div class="item rows">
      <TheRecommendationSelector class="item" />
      <TheRevertSelector class="item" />
    </div>
    <TheOsChanger class="item" />
    <TheViewChanger
      v-if="!isSearching"
      class="item"
      @view-changed="$emit('viewChanged', $event)"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import type { ReadonlyFilterContext } from '@/application/Context/State/Filter/FilterContext';
import type { IEventSubscription } from '@/infrastructure/Events/IEventSource';
import TheOsChanger from './TheOsChanger.vue';
import TheViewChanger from './View/TheViewChanger.vue';
import { ViewType } from './View/ViewType';
import TheRecommendationSelector from './Recommendation/TheRecommendationSelector.vue';
import TheRevertSelector from './Revert/TheRevertSelector.vue';

export default defineComponent({
  components: {
    TheRecommendationSelector,
    TheOsChanger,
    TheViewChanger,
    TheRevertSelector,
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    viewChanged: (viewType: ViewType) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup() {
    const { onStateChange } = injectKey((keys) => keys.useCollectionState);
    const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);

    const isSearching = ref(false);

    onStateChange((state) => {
      events.unsubscribeAllAndRegister([
        subscribeToFilterChanges(state.filter),
      ]);
    }, { immediate: true });

    function subscribeToFilterChanges(
      filter: ReadonlyFilterContext,
    ): IEventSubscription {
      return filter.filterChanged.on((event) => {
        event.visit({
          onApply: () => { isSearching.value = true; },
          onClear: () => { isSearching.value = false; },
        });
      });
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
  .rows {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
