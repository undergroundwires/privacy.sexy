<template>
  <div class="search" v-non-collapsing>
      <input type="search" class="search-term"
        :placeholder="searchPlaceHolder"
        v-model="searchQuery" >
      <div class="icon-wrapper">
          <font-awesome-icon :icon="['fas', 'search']" />
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { NonCollapsing } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';

@Component( {
    directives: { NonCollapsing },
  },
)
export default class TheSearchBar extends StatefulVue {
  public searchPlaceHolder = 'Search';
  public searchQuery = '';

  @Watch('searchQuery')
  public async updateFilterAsync(newFilter: |string) {
    const context = await this.getCurrentContextAsync();
    const filter = context.state.filter;
    if (!newFilter) {
      filter.removeFilter();
    } else {
      filter.setFilter(newFilter);
    }
  }

  protected handleCollectionState(newState: ICategoryCollectionState, oldState: ICategoryCollectionState | undefined) {
    const totalScripts = newState.collection.totalScripts;
    this.searchPlaceHolder = `Search in ${totalScripts} scripts`;
    this.searchQuery = newState.filter.currentFilter ? newState.filter.currentFilter.query : '';
    this.events.unsubscribeAll();
    this.subscribeFilter(newState.filter);
  }

  private subscribeFilter(filter: IUserFilter) {
    this.events.register(filter.filtered.on((result) => this.handleFiltered(result)));
    this.events.register(filter.filterRemoved.on(() => this.handleFilterRemoved()));
  }
  private handleFiltered(result: IFilterResult) {
    this.searchQuery = result.query;
  }
  private handleFilterRemoved() {
    this.searchQuery = '';
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";

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
  font-family: $normal-font;
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
