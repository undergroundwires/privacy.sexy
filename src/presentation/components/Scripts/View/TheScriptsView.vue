<template>
  <div class="scripts">
    <div v-if="!isSearching">
      <template v-if="currentView === ViewType.Cards">
        <CardList />
      </template>
      <template v-else-if="currentView === ViewType.Tree">
        <div class="tree">
          <ScriptsTree />
        </div>
      </template>
    </div>
    <div v-else> <!-- Searching -->
      <div class="search">
        <div class="search__query">
          <div>Searching for "{{ trimmedSearchQuery }}"</div>
          <div
            class="search__query__close-button"
            v-on:click="clearSearchQuery()"
          >
            <AppIcon icon="xmark" />
          </div>
        </div>
        <div v-if="!searchHasMatches" class="search-no-matches">
          <div>Sorry, no matches for "{{ trimmedSearchQuery }}" 😞</div>
          <div>
            Feel free to extend the scripts
            <a :href="repositoryUrl" class="child github" target="_blank" rel="noopener noreferrer">here</a> ✨
          </div>
        </div>
      </div>
      <div v-if="searchHasMatches" class="tree tree--searching">
        <ScriptsTree />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, PropType, ref, computed,
} from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { injectKey } from '@/presentation/injectionSymbols';
import ScriptsTree from '@/presentation/components/Scripts/View/Tree/ScriptsTree.vue';
import CardList from '@/presentation/components/Scripts/View/Cards/CardList.vue';
import { ViewType } from '@/presentation/components/Scripts/Menu/View/ViewType';
import { IReadOnlyUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';

export default defineComponent({
  components: {
    ScriptsTree,
    CardList,
    AppIcon,
  },
  props: {
    currentView: {
      type: Number as PropType<ViewType>,
      required: true,
    },
  },
  setup() {
    const { modifyCurrentState, onStateChange } = injectKey((keys) => keys.useCollectionState);
    const { events } = injectKey((keys) => keys.useAutoUnsubscribedEvents);
    const { info } = injectKey((keys) => keys.useApplication);

    const repositoryUrl = computed<string>(() => info.repositoryWebUrl);
    const searchQuery = ref<string | undefined>();
    const isSearching = computed(() => Boolean(searchQuery.value));
    const searchHasMatches = ref(false);
    const trimmedSearchQuery = computed(() => {
      const query = searchQuery.value;
      const threshold = 30;
      if (query.length <= threshold - 3) {
        return query;
      }
      return `${query.substring(0, threshold)}...`;
    });

    onStateChange((newState) => {
      updateFromInitialFilter(newState.filter.currentFilter);
      events.unsubscribeAllAndRegister([
        subscribeToFilterChanges(newState.filter),
      ]);
    }, { immediate: true });

    function clearSearchQuery() {
      modifyCurrentState((state) => {
        const { filter } = state;
        filter.clearFilter();
      });
    }

    function updateFromInitialFilter(filter?: IFilterResult) {
      searchQuery.value = filter?.query;
      searchHasMatches.value = filter?.hasAnyMatches();
    }

    function subscribeToFilterChanges(filter: IReadOnlyUserFilter) {
      return filter.filterChanged.on((event) => {
        event.visit({
          onApply: (newFilter) => {
            searchQuery.value = newFilter.query;
            searchHasMatches.value = newFilter.hasAnyMatches();
          },
          onClear: () => {
            searchQuery.value = undefined;
          },
        });
      });
    }

    return {
      repositoryUrl,
      trimmedSearchQuery,
      isSearching,
      searchHasMatches,
      clearSearchQuery,
      ViewType,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$margin-inner: 4px;

.scripts {
  margin-top: $margin-inner;
  @media screen and (min-width: $media-vertical-view-breakpoint) {
    // so the current code is always visible
    overflow: auto;
    max-height: 70vh;
  }
  .tree {
    padding-left: 3%;
    padding-top: 15px;
    padding-bottom: 15px;
    &--searching {
      background-color: $color-primary-darker;
      padding-top: 0px;
    }
  }
}

.search {
  display: flex;
  flex-direction: column;
  background-color: $color-primary-darker;
  &__query {
    display: flex;
    justify-content: center;
    flex-direction: row;
    align-items: center;
    margin-top: 1em;
    color: $color-primary;
    &__close-button {
      @include clickable;
      font-size: 1.25em;
      margin-left: 0.25rem;
      @include hover-or-touch {
        color: $color-primary-dark;
      }
    }
  }
  &-no-matches {
    display:flex;
    flex-direction: column;
    word-break:break-word;
    color: $color-on-primary;
    font-size: 1.5em;
    padding:10px;
    text-align:center;
    > div {
      padding-bottom:13px;
    }
    a {
      color: $color-primary;
    }
  }
}
</style>
