<template>
    <div class="scripts">
        <div v-if="!isSearching">
            <CardList v-if="grouping === Grouping.Cards"/>
            <div class="tree" v-if="grouping === Grouping.None">
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
</template>

<script lang="ts">
import TheGrouper from '@/presentation/Scripts/Menu/Grouping/TheGrouper.vue';
import ScriptsTree from '@/presentation/Scripts/ScriptsTree/ScriptsTree.vue';
import CardList from '@/presentation/Scripts/Cards/CardList.vue';
import { Component, Prop } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { Grouping } from '@/presentation/Scripts/Menu/Grouping/Grouping';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
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
export default class TheScriptsList extends StatefulVue {
    @Prop() public grouping: Grouping;

    public repositoryUrl = '';
    public Grouping = Grouping; // Make it accessible from the view
    public searchQuery = '';
    public isSearching = false;
    public searchHasMatches = false;

    public async created() {
        const app = await ApplicationFactory.Current.getAppAsync();
        this.repositoryUrl = app.info.repositoryWebUrl;
    }
    public async clearSearchQueryAsync() {
        const context = await this.getCurrentContextAsync();
        const filter = context.state.filter;
        filter.removeFilter();
    }

    protected handleCollectionState(newState: ICategoryCollectionState): void {
        this.events.unsubscribeAll();
        this.subscribeState(newState);
    }

    private subscribeState(state: ICategoryCollectionState) {
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
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/fonts.scss";
@import "@/presentation/styles/media.scss";

$inner-margin: 4px;

.scripts {
    margin-top: $inner-margin;
    @media screen and (min-width: $vertical-view-breakpoint) { // so the current code is always visible
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

</style>