<template>
  <div class="scripts">
    <div v-if="!isSearching">
      <CardList v-if="currentView === ViewType.Cards"/>
      <div class="tree" v-else-if="currentView === ViewType.Tree">
        <ScriptsTree />
      </div>
    </div>
    <div v-else> <!-- Searching -->
      <div class="search">
        <div class="search__query">
          <div>Searching for "{{this.searchQuery | threeDotsTrim}}"</div>
          <div class="search__query__close-button">
            <font-awesome-icon
              :icon="['fas', 'times']"
              v-on:click="clearSearchQuery()"/>
          </div>
        </div>
        <div v-if="!searchHasMatches" class="search-no-matches">
          <div>Sorry, no matches for "{{this.searchQuery | threeDotsTrim}}" 😞</div>
          <div>
            Feel free to extend the scripts
            <a :href="repositoryUrl" target="_blank" class="child github" >here</a> ✨
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
import { Component, Prop } from 'vue-property-decorator';
import TheGrouper from '@/presentation/components/Scripts/Menu/View/TheViewChanger.vue';
import ScriptsTree from '@/presentation/components/Scripts/View/ScriptsTree/ScriptsTree.vue';
import CardList from '@/presentation/components/Scripts/View/Cards/CardList.vue';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { ViewType } from '@/presentation/components/Scripts/Menu/View/ViewType';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { ApplicationFactory } from '@/application/ApplicationFactory';

/** Shows content of single category or many categories */
@Component({
  components: {
    TheGrouper,
    ScriptsTree,
    CardList,
  },
  filters: {
    threeDotsTrim(query: string) {
      const threshold = 30;
      if (query.length <= threshold - 3) {
        return query;
      }
      return `${query.substr(0, threshold)}...`;
    },
  },
})
export default class TheScriptsView extends StatefulVue {
  public repositoryUrl = '';

  public searchQuery = '';

  public isSearching = false;

  public searchHasMatches = false;

  @Prop() public currentView: ViewType;

  public ViewType = ViewType; // Make it accessible from the view

  public async created() {
    const app = await ApplicationFactory.Current.getApp();
    this.repositoryUrl = app.info.repositoryWebUrl;
  }

  public async clearSearchQuery() {
    const context = await this.getCurrentContext();
    const { filter } = context.state;
    filter.removeFilter();
  }

  protected handleCollectionState(newState: IReadOnlyCategoryCollectionState): void {
    this.events.unsubscribeAll();
    this.subscribeState(newState);
  }

  private subscribeState(state: IReadOnlyCategoryCollectionState) {
    this.events.register(
      state.filter.filterRemoved.on(() => {
        this.isSearching = false;
      }),
      state.filter.filtered.on((result: IFilterResult) => {
        this.searchQuery = result.query;
        this.isSearching = true;
        this.searchHasMatches = result.hasAnyMatches();
      }),
    );
  }
}
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
      cursor: pointer;
      font-size: 1.25em;
      margin-left: 0.25rem;
      &:hover {
        color: $color-primary-dark;
      }
    }
  }
  &-no-matches {
    display:flex;
    flex-direction: column;
    word-break:break-word;
    text-transform: uppercase;
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
