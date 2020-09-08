<template>
    <div>
        <div class="help-container">
            <TheSelector />
            <TheGrouper
                v-on:groupingChanged="onGroupingChanged($event)"
                v-show="!this.isSearching" />
        </div>
        <div class="scripts">
            <div v-if="!isSearching">
                <CardList v-if="currentGrouping === Grouping.Cards"/>
                <div class="tree" v-if="currentGrouping === Grouping.None">
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
                                v-on:click="clearSearchQueryAsync()"/>
                        </div>
                    </div>
                    <div v-if="!searchHasMatches" class="search-no-matches">
                        <div>Sorry, no matches for "{{this.searchQuery | threeDotsTrim}}" 😞</div>
                        <div>Feel free to extend the scripts <a :href="repositoryUrl" target="_blank" class="child github" >here</a> ✨</div>
                    </div>
                </div>
                <div v-if="searchHasMatches" class="tree tree--searching">
                    <ScriptsTree />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Component } from 'vue-property-decorator';
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
        public repositoryUrl = '';
        public Grouping = Grouping; // Make it accessible from view
        public currentGrouping = Grouping.Cards;
        public searchQuery = '';
        public isSearching = false;
        public searchHasMatches = false;

        public async mounted() {
            const context = await this.getCurrentContextAsync();
            this.repositoryUrl = context.app.info.repositoryWebUrl;
            const filter = context.state.filter;
            filter.filterRemoved.on(() => {
                this.isSearching = false;
            });
            filter.filtered.on((result: IFilterResult) => {
                this.searchQuery = result.query;
                this.isSearching = true;
                this.searchHasMatches = result.hasAnyMatches();
            });
        }

        public async clearSearchQueryAsync() {
            const context = await this.getCurrentContextAsync();
            const filter = context.state.filter;
            filter.removeFilter();
        }

        public onGroupingChanged(group: Grouping) {
            this.currentGrouping = group;
        }
    }
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";
.scripts {
    margin-top:10px;
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
    background-color: $slate;
    &__query {
        display: flex;
        justify-content: center;
        flex-direction: row;
        align-items: center;
        margin-top: 1em;
        color: $gray;
        &__close-button {
            cursor: pointer;
            font-size: 1.25em;
            margin-left: 0.25rem;
            &:hover {
                opacity: 0.9;
            }
        }
    }
    &-no-matches {
        display:flex;
        flex-direction: column;
        word-break:break-word;
        text-transform: uppercase;
        color: $light-gray;
        font-size: 1.5em;
        padding:10px;
        text-align:center;
        > div {
            padding-bottom:13px;
        }
        a {
            color: $gray;
        }
    }
}

.help-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}
</style>
