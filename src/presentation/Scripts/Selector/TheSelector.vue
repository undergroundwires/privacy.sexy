<template>
    <div class="container">
        <div class="part select">Select:</div>
        <div class="part">
            <div class="part">
                <SelectableOption
                    label="None"
                    :enabled="this.currentSelection == SelectionState.None"
                    @click="selectAsync(SelectionState.None)"
                    v-tooltip="'Deselect all selected scripts. Good start to dive deeper into tweaks and select only what you want.'"
                    />
            </div>
            <div class="part"> | </div>
            <div class="part">
                <SelectableOption
                    label="Standard"
                    :enabled="this.currentSelection == SelectionState.Standard"
                    @click="selectAsync(SelectionState.Standard)"
                    v-tooltip="'🛡️ Balanced for privacy and functionality. OS and applications will function normally.'"
                    />
                </div>
            <div class="part"> | </div>
            <div class="part">
                <SelectableOption
                    label="Strict"
                    :enabled="this.currentSelection == SelectionState.Strict"
                    @click="selectAsync(SelectionState.Strict)"
                    v-tooltip="'🚫 Stronger privacy, disables risky functions that may leak your data. Double check selected tweaks!'"
                    />
                </div>
            <div class="part"> | </div>
            <div class="part">
                    <SelectableOption
                        label="All"
                        :enabled="this.currentSelection == SelectionState.All"
                        @click="selectAsync(SelectionState.All)"
                        v-tooltip="'🔒 Strongest privacy. Disables any functionality that may leak your data. ⚠️ Not recommended for inexperienced users'"
                    />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import SelectableOption from './SelectableOption.vue';
import { IApplicationState } from '@/application/State/IApplicationState';
import { IScript } from '@/domain/IScript';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { RecommendationLevel } from '@/domain/RecommendationLevel';

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

    public async mounted() {
        const state = await this.getCurrentStateAsync();
        this.updateSelections(state);
        state.selection.changed.on(() => {
            this.updateSelections(state);
        });
    }
    public async selectAsync(type: SelectionState): Promise<void> {
        if (this.currentSelection === type) {
            return;
        }
        const state = await this.getCurrentStateAsync();
        selectType(state, type);
    }

    private updateSelections(state: IApplicationState) {
       this.currentSelection = getCurrentSelectionState(state);
    }
}

interface ITypeSelector {
    isSelected: (state: IApplicationState) => boolean;
    select: (state: IApplicationState) => void;
}

const selectors = new Map<SelectionState, ITypeSelector>([
    [SelectionState.None, {
        select: (state) => state.selection.deselectAll(),
        isSelected: (state) => state.selection.totalSelected === 0,
    }],
    [SelectionState.Standard, {
        select: (state) => state.selection.selectOnly(state.app.getScriptsByLevel(RecommendationLevel.Standard)),
        isSelected: (state) => hasAllSelectedLevelOf(RecommendationLevel.Standard, state),
    }],
    [SelectionState.Strict, {
        select: (state) => state.selection.selectOnly(state.app.getScriptsByLevel(RecommendationLevel.Strict)),
        isSelected: (state) => hasAllSelectedLevelOf(RecommendationLevel.Strict, state),
    }],
    [SelectionState.All, {
        select: (state) => state.selection.selectAll(),
        isSelected: (state) => state.selection.totalSelected === state.app.totalScripts,
    }],
]);

function selectType(state: IApplicationState, type: SelectionState) {
    const selector = selectors.get(type);
    selector.select(state);
}

function getCurrentSelectionState(state: IApplicationState): SelectionState {
    for (const [type, selector] of Array.from(selectors.entries())) {
        if (selector.isSelected(state)) {
            return type;
        }
    }
    return SelectionState.Custom;
}

function hasAllSelectedLevelOf(level: RecommendationLevel, state: IApplicationState) {
    const scripts = state.app.getScriptsByLevel(level);
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
