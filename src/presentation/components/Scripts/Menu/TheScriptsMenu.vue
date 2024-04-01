<template>
  <div class="scripts-menu">
    <div class="scripts-menu-item scripts-menu-rows">
      <TheRecommendationSelector class="scripts-menu-item" />
      <TheRevertSelector class="scripts-menu-item" />
    </div>
    <TheOsChanger class="scripts-menu-item" />
    <TheViewChanger
      v-if="!isSearching"
      class="scripts-menu-item"
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
@use "@/presentation/assets/styles/main" as *;
@use 'sass:math';

$spacing-small: math.div($base-spacing, 2);

@mixin center-middle-flex-item {
  &:first-child, &:last-child {
    flex-grow: 1;
    flex-basis: 0;
  }
  &:last-child {
    justify-content: flex-end;
  }
}

$responsive-alignment-breakpoint: $media-screen-medium-width;

.scripts-menu {
  display: flex;
  flex-wrap: wrap;
  column-gap: $base-spacing;
  row-gap: $base-spacing;
  flex-wrap: wrap;
  align-items: center;
  margin-left: $spacing-small;
  margin-right: $spacing-small;
  @media screen and (max-width: $responsive-alignment-breakpoint) {
    justify-content: space-around;
  }
  .scripts-menu-item {
    display: flex;
    @media screen and (min-width: $responsive-alignment-breakpoint) {
      @include center-middle-flex-item;
    }
  }
  .scripts-menu-rows {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 0.5em;
  }
}
</style>
