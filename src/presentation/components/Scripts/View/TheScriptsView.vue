<template>
  <div class="scripts">
    <div v-if="!isSearching">
      <CardList v-if="currentView === ViewType.Cards" />
      <div class="tree" v-else-if="currentView === ViewType.Tree">
        <ScriptsTree />
      </div>
    </div>
    <div v-else> <!-- Searching -->
      <div class="search">
        <div class="search__query">
          <div>Searching for "{{ trimmedSearchQuery }}"</div>
          <div class="search__query__close-button">
            <font-awesome-icon
              :icon="['fas', 'times']"
              v-on:click="clearSearchQuery()" />
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
import { useCollectionState } from '@/presentation/components/Shared/Hooks/UseCollectionState';
import ScriptsTree from '@/presentation/components/Scripts/View/ScriptsTree/ScriptsTree.vue';
import CardList from '@/presentation/components/Scripts/View/Cards/CardList.vue';
import { ViewType } from '@/presentation/components/Scripts/Menu/View/ViewType';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { useApplication } from '@/presentation/components/Shared/Hooks/UseApplication';

/** Shows content of single category or many categories */
export default defineComponent({
  components: {
    ScriptsTree,
    CardList,
  },
  props: {
    currentView: {
      type: Number as PropType<ViewType>,
      required: true,
    },
  },
  setup() {
    const { modifyCurrentState, onStateChange, events } = useCollectionState();
    const { info } = useApplication();

    const repositoryUrl = computed<string>(() => info.repositoryWebUrl);
    const searchQuery = ref<string>();
    const isSearching = ref(false);
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
      events.unsubscribeAll();
      subscribeState(newState);
    });

    function clearSearchQuery() {
      modifyCurrentState((state) => {
        const { filter } = state;
        filter.removeFilter();
      });
    }

    function subscribeState(state: IReadOnlyCategoryCollectionState) {
      events.register(
        state.filter.filterRemoved.on(() => {
          isSearching.value = false;
        }),
        state.filter.filtered.on((result: IFilterResult) => {
          searchQuery.value = result.query;
          isSearching.value = true;
          searchHasMatches.value = result.hasAnyMatches();
        }),
      );
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
