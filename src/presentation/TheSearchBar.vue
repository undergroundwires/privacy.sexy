<template>
  <div class="search" v-non-collapsing>
      <input type="search" class="searchTerm"
        :placeholder="searchPlaceHolder"
        v-model="searchQuery" >
      <div class="iconWrapper">
          <font-awesome-icon :icon="['fas', 'search']" />
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Watch } from 'vue-property-decorator';
import { StatefulVue } from './StatefulVue';
import { NonCollapsing } from '@/presentation/Scripts/Cards/NonCollapsingDirective';
import { IUserFilter } from '@/application/Context/State/Filter/IUserFilter';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { IApplication } from '@/domain/IApplication';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IEventSubscription } from '@/infrastructure/Events/ISubscription';

@Component( {
    directives: { NonCollapsing },
  },
)
export default class TheSearchBar extends StatefulVue {
  public searchPlaceHolder = 'Search';
  public searchQuery = '';

  private readonly listeners = new Array<IEventSubscription>();

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
  public destroyed() {
    this.unsubscribeAll();
  }

  protected initialize(app: IApplication): void {
    return;
  }
  protected handleCollectionState(newState: ICategoryCollectionState, oldState: ICategoryCollectionState | undefined) {
    const totalScripts = newState.collection.totalScripts;
    this.searchPlaceHolder = `Search in ${totalScripts} scripts`;
    this.searchQuery = newState.filter.currentFilter ? newState.filter.currentFilter.query : '';
    this.unsubscribeAll();
    this.subscribe(newState.filter);
  }

  private subscribe(filter: IUserFilter) {
    this.listeners.push(filter.filtered.on((result) => this.handleFiltered(result)));
    this.listeners.push(filter.filterRemoved.on(() => this.handleFilterRemoved()));
  }
  private unsubscribeAll() {
    this.listeners.forEach((listener) => listener.unsubscribe());
    this.listeners.splice(0, this.listeners.length);
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
}

.searchTerm {
  width: 100%;
  min-width: 60px;
  border: 1.5px solid $gray;
  border-right: none;
  height: 36px;
  border-radius: 3px 0 0 3px;
  padding-left:10px;
  padding-right:10px;
  outline: none;
  color: $gray;
    font-family: $normal-font;
    font-size:1em;
}

.searchTerm:focus{
  color: $slate;
}

.iconWrapper {
  width: 40px;
  height: 36px;
  border: 1px solid $gray;
  background: $gray;
  text-align: center;
  color: $white;
  border-radius: 0 5px 5px 0;
  font-size: 20px;
  padding:5px;
}
</style>
