<template>
    <div class="container">
        <div class="part">Select:</div>
        <div class="part">
            <div class="part">
                <SelectableOption
                    label="None"
                    :enabled="this.currentSelection == SelectionState.None"
                    @click="selectAsync(SelectionState.None)"
                    v-tooltip=" 'Deselect all selected scripts.<br/>' +
                                '💡 Good start to dive deeper into tweaks and select only what you want.'"
                    />
            </div>
            <div class="part"> | </div>
            <div class="part">
                <SelectableOption
                    label="Standard"
                    :enabled="this.currentSelection == SelectionState.Standard"
                    @click="selectAsync(SelectionState.Standard)"
                    v-tooltip=" '🛡️ Balanced for privacy and functionality.<br/>' +
                                'OS and applications will function normally.<br/>' +
                                '💡 Recommended for everyone'"
                    />
                </div>
            <div class="part"> | </div>
            <div class="part">
                <SelectableOption
                    label="Strict"
                    :enabled="this.currentSelection == SelectionState.Strict"
                    @click="selectAsync(SelectionState.Strict)"
                    v-tooltip=" '🚫 Stronger privacy, disables risky functions that may leak your data.<br/>' +
                                '⚠️ Double check to remove sripts where you would trade functionality for privacy<br/>' +
                                '💡 Recommended for daily users that prefers more privacy over non-essential functions'"
                    />
                </div>
            <div class="part"> | </div>
            <div class="part">
                    <SelectableOption
                        label="All"
                        :enabled="this.currentSelection == SelectionState.All"
                        @click="selectAsync(SelectionState.All)"
                        v-tooltip=" '🔒 Strongest privacy, disabling any functionality that may leak your data.<br/>' +
                                    '🛑 Not designed for daily users, it will break important functionalities.<br/>' +
                                    '💡 Only recommended for extreme use-cases like crime labs where no leak is acceptable'"
                    />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import SelectableOption from './SelectableOption.vue';
import { IScript } from '@/domain/IScript';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { RecommendationLevel } from '@/domain/RecommendationLevel';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';

enum SelectionState {
    Standard,
    Strict,
    All,
    None,
    Custom,
}
@Component({
  components: {
    SelectableOption,
  },
})
export default class TheSelector extends StatefulVue {
    public SelectionState = SelectionState;
    public currentSelection = SelectionState.None;

    public async selectAsync(type: SelectionState): Promise<void> {
        if (this.currentSelection === type) {
            return;
        }
        const context = await this.getCurrentContextAsync();
        selectType(context.state, type);
    }

    protected handleCollectionState(newState: ICategoryCollectionState, oldState: ICategoryCollectionState): void {
        this.updateSelections(newState);
        newState.selection.changed.on(() => this.updateSelections(newState));
        if (oldState) {
            oldState.selection.changed.on(() => this.updateSelections(oldState));
        }
    }

    private updateSelections(state: ICategoryCollectionState) {
       this.currentSelection = getCurrentSelectionState(state);
    }
}

interface ITypeSelector {
    isSelected: (state: ICategoryCollectionState) => boolean;
    select: (state: ICategoryCollectionState) => void;
}

const selectors = new Map<SelectionState, ITypeSelector>([
    [SelectionState.None, {
        select: (state) =>
            state.selection.deselectAll(),
        isSelected: (state) =>
            state.selection.totalSelected === 0,
    }],
    [SelectionState.Standard, {
        select: (state) =>
            state.selection.selectOnly(
                state.collection.getScriptsByLevel(RecommendationLevel.Standard)),
        isSelected: (state) =>
            hasAllSelectedLevelOf(RecommendationLevel.Standard, state),
    }],
    [SelectionState.Strict, {
        select: (state) =>
            state.selection.selectOnly(state.collection.getScriptsByLevel(RecommendationLevel.Strict)),
        isSelected: (state) =>
            hasAllSelectedLevelOf(RecommendationLevel.Strict, state),
    }],
    [SelectionState.All, {
        select: (state) =>
            state.selection.selectAll(),
        isSelected: (state) =>
            state.selection.totalSelected === state.collection.totalScripts,
    }],
]);

function selectType(state: ICategoryCollectionState, type: SelectionState) {
    const selector = selectors.get(type);
    selector.select(state);
}

function getCurrentSelectionState(state: ICategoryCollectionState): SelectionState {
    for (const [type, selector] of Array.from(selectors.entries())) {
        if (selector.isSelected(state)) {
            return type;
        }
    }
    return SelectionState.Custom;
}

function hasAllSelectedLevelOf(level: RecommendationLevel, state: ICategoryCollectionState) {
    const scripts = state.collection.getScriptsByLevel(level);
    const selectedScripts = state.selection.selectedScripts;
    return areAllSelected(scripts, selectedScripts);
}

function areAllSelected(
    expectedScripts: ReadonlyArray<IScript>,
    selection: ReadonlyArray<SelectedScript>): boolean {
    selection = selection.filter((selected) => !selected.revert);
    if (expectedScripts.length < selection.length) {
        return false;
    }
    const selectedScriptIds = selection.map((script) => script.id).sort();
    const expectedScriptIds = expectedScripts.map((script) => script.id).sort();
    return selectedScriptIds.every((id, index) => id === expectedScriptIds[index]);
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/fonts.scss";

.container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .part {
        display: flex;
        margin-right:5px;
    }
    font-family: $normal-font;
}
</style>
