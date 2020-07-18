<template>
  <div class="search">
      <input type="search" class="searchTerm" :placeholder="searchPlaceHolder"
        @input="updateFilterAsync($event.target.value)" >
      <div class="iconWrapper">
          <font-awesome-icon :icon="['fas', 'search']" />
      </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { StatefulVue } from './StatefulVue';

@Component
export default class TheSearchBar extends StatefulVue {
  public searchPlaceHolder = 'Search';

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    const totalScripts = state.app.totalScripts;
    const totalCategories = state.app.totalCategories;
    this.searchPlaceHolder = `Search in ${totalScripts} scripts`;
  }

  public async updateFilterAsync(filter: |string) {
    const state = await this.getCurrentStateAsync();
    if (!filter) {
      state.filter.removeFilter();
    } else {
      state.filter.setFilter(filter);
    }
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
