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
} from 'vue';
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import { NonCollapsing } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';
import { IReadOnlyUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';

export default defineComponent({
  directives: {
    NonCollapsing,
  },
  setup() {
    const {
      modifyCurrentState, onStateChange, events, currentState,
    } = useCollectionState();

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
          filter.removeFilter();
        } else {
          filter.setFilter(newFilter);
        }
      });
    }

    onStateChange((newState) => {
      events.unsubscribeAll();
      subscribeSearchQuery(newState);
    }, { immediate: true });

    function subscribeSearchQuery(newState: IReadOnlyCategoryCollectionState) {
      searchQuery.value = newState.filter.currentFilter ? newState.filter.currentFilter.query : '';
      subscribeFilter(newState.filter);
    }

    function subscribeFilter(filter: IReadOnlyUserFilter) {
      events.register(
        filter.filtered.on((result) => handleFiltered(result)),
        filter.filterRemoved.on(() => handleFilterRemoved()),
      );
    }

    function handleFilterRemoved() {
      searchQuery.value = '';
    }

    function handleFiltered(result: IFilterResult) {
      searchQuery.value = result.query;
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
