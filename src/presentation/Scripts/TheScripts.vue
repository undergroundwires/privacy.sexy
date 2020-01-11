<template>
    <div>
        <div class="help-container">
            <TheSelector class="left" />
            <TheGrouper class="right"
                v-on:groupingChanged="onGroupingChanged($event)"
                v-show="!this.isSearching" />
        </div>
        <div class="scripts">
            <div v-if="!isSearching || searchHasMatches">
                    <CardList v-if="this.showCards" />
                    <div v-else-if="this.showList" class="tree">
                        <div v-if="this.isSearching" class="search-query">
                            Searching for "{{this.searchQuery | threeDotsTrim}}"</div>
                        <ScriptsTree />
                    </div>
                    </div>
                    <div v-else class="search-no-matches">
                        Sorry, no matches for "{{this.searchQuery | threeDotsTrim}}" 😞
                        Feel free to extend the scripts <a :href="repositoryUrl" target="_blank" class="child github" >here</a>.
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
    import { Category } from '@/domain/Category';
    import { StatefulVue } from '@/presentation/StatefulVue';
    import { Grouping } from './Grouping/Grouping';
    import { IFilterResult } from '@/application/State/Filter/IFilterResult';
    import TheGrouper from '@/presentation/Scripts/Grouping/TheGrouper.vue';
    import TheSelector from '@/presentation/Scripts/Selector/TheSelector.vue';
    import ScriptsTree from '@/presentation/Scripts/ScriptsTree/ScriptsTree.vue';
    import CardList from '@/presentation/Scripts/Cards/CardList.vue';


    /** Shows content of single category or many categories */
    @Component({
    components: {
        TheGrouper,
        TheSelector,
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
    export default class TheScripts extends StatefulVue {
        public showCards = false;
        public showList = false;
        public repositoryUrl = '';
        private searchQuery = '';
        private isSearching = false;
        private searchHasMatches = false;

        private currentGrouping: Grouping;

        public async mounted() {
            const state = await this.getCurrentStateAsync();
            this.repositoryUrl = state.app.repositoryUrl;
            state.filter.filterRemoved.on(() => {
                this.isSearching = false;
                this.updateGroups();
            });
            state.filter.filtered.on((result: IFilterResult) => {
                this.searchQuery = result.query;
                this.isSearching = true;
                this.searchHasMatches = result.hasAnyMatches();
                this.updateGroups();
            });
        }

        public onGroupingChanged(group: Grouping) {
            this.currentGrouping = group;
            this.updateGroups();
        }

        private updateGroups(): void {
            this.showCards = !this.isSearching && this.currentGrouping === Grouping.Cards;
            this.showList = this.isSearching || this.currentGrouping === Grouping.None;
        }
    }
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";
.scripts {
    margin-top:10px;
    .search-no-matches {
        word-break:break-word;
        color: $white;
        text-transform: uppercase;
        color: $light-gray;
        font-size: 1.5em;
        background-color: $slate;
        padding:5%;
        text-align:center;
        > a {
            color: $gray;
        }
    }
    .tree {
        padding-left: 3%;
        padding-top: 15px;
        padding-bottom: 15px;
        .search-query {
            display: flex;
            justify-content: center;
            color: $gray;
        }
    }
}
.help-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .center {
      justify-content: center;
  }
  .left {
      justify-content: flex-start;
  }
  .right {
      justify-content: flex-end;
  }
}

</style>
