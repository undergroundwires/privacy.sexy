<template>
  <div class="search" v-non-collapsing>
    <input
      type="search"
      class="search-term"
      :placeholder="searchPlaceholder"
      v-model="searchQuery"
    >
    <div class="icon-wrapper">
      <font-awesome-icon :icon="['fas', 'search']" />
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, ref, watch, computed,
  inject,
} from 'vue';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { NonCollapsing } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';
import { IReadOnlyUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IEventSubscription } from '@/infrastructure/Events/IEventSource';

export default defineComponent({
  directives: {
    NonCollapsing,
  },
  setup() {
    const {
      modifyCurrentState, onStateChange, currentState,
    } = inject(InjectionKeys.useCollectionState)();
    const { events } = inject(InjectionKeys.useAutoUnsubscribedEvents)();

    const searchPlaceholder = computed<string>(() => {
      const { totalScripts } = currentState.value.collection;
      return `Search in ${totalScripts} scripts`;
    });
    const searchQuery = ref<string>();

    watch(searchQuery, (newFilter) => updateFilter(newFilter));

    function updateFilter(newFilter: string) {
      modifyCurrentState((state) => {
        const { filter } = state;
        if (!newFilter) {
          filter.clearFilter();
        } else {
          filter.applyFilter(newFilter);
        }
      });
    }

    onStateChange((newState) => {
      updateFromInitialFilter(newState.filter.currentFilter);
      events.unsubscribeAllAndRegister([
        subscribeToFilterChanges(newState.filter),
      ]);
    }, { immediate: true });

    function updateFromInitialFilter(filter?: IFilterResult) {
      searchQuery.value = filter?.query || '';
    }

    function subscribeToFilterChanges(
      filter: IReadOnlyUserFilter,
    ): IEventSubscription {
      return filter.filterChanged.on((event) => {
        event.visit({
          onApply: (result) => {
            searchQuery.value = result.query;
          },
          onClear: () => {
            searchQuery.value = '';
          },
        });
      });
    }

    return {
      searchPlaceholder,
      searchQuery,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.search {
  width: 100%;
  position: relative;
  display: flex;
  input {
    background: inherit;
  }
}

.search-term {
  width: 100%;
  min-width: 60px;
  border: 1.5px solid $color-primary;
  border-right: none;
  height: 36px;
  border-radius: 3px 0 0 3px;
  padding-left:10px;
  padding-right:10px;
  outline: none;
  color: $color-primary;
  font-family: $font-normal;
  font-size:1em;
  &:focus {
    color: $color-primary-darker;
  }
}

.icon-wrapper {
  width: 40px;
  height: 36px;
  border: 1px solid $color-primary;
  background: $color-primary;
  text-align: center;
  color: $color-on-primary;
  border-radius: 0 5px 5px 0;
  font-size: 20px;
  padding:5px;
}
</style>
