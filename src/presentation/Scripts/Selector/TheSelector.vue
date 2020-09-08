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
import { IApplicationContext } from '../../../application/State/IApplicationContext';

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
        const context = await this.getCurrentContextAsync();
        this.updateSelections(context);
        this.beginReactingToChanges(context);
    }
    public async selectAsync(type: SelectionState): Promise<void> {
        if (this.currentSelection === type) {
            return;
        }
        const context = await this.getCurrentContextAsync();
        selectType(context, type);
    }

    private updateSelections(context: IApplicationContext) {
       this.currentSelection = getCurrentSelectionState(context);
    }

    private beginReactingToChanges(context: IApplicationContext) {
        context.state.selection.changed.on(() => {
            this.updateSelections(context);
        });
    }
}

interface ITypeSelector {
    isSelected: (context: IApplicationContext) => boolean;
    select: (context: IApplicationContext) => void;
}

const selectors = new Map<SelectionState, ITypeSelector>([
    [SelectionState.None, {
        select: (context) =>
            context.state.selection.deselectAll(),
        isSelected: (context) =>
            context.state.selection.totalSelected === 0,
    }],
    [SelectionState.Standard, {
        select: (context) =>
            context.state.selection.selectOnly(
                context.app.getScriptsByLevel(RecommendationLevel.Standard)),
        isSelected: (context) =>
            hasAllSelectedLevelOf(RecommendationLevel.Standard, context),
    }],
    [SelectionState.Strict, {
        select: (context) =>
            context.state.selection.selectOnly(context.app.getScriptsByLevel(RecommendationLevel.Strict)),
        isSelected: (context) =>
            hasAllSelectedLevelOf(RecommendationLevel.Strict, context),
    }],
    [SelectionState.All, {
        select: (context) =>
            context.state.selection.selectAll(),
        isSelected: (context) =>
            context.state.selection.totalSelected === context.app.totalScripts,
    }],
]);

function selectType(context: IApplicationContext, type: SelectionState) {
    const selector = selectors.get(type);
    selector.select(context);
}

function getCurrentSelectionState(context: IApplicationContext): SelectionState {
    for (const [type, selector] of Array.from(selectors.entries())) {
        if (selector.isSelected(context)) {
            return type;
        }
    }
    return SelectionState.Custom;
}

function hasAllSelectedLevelOf(level: RecommendationLevel, context: IApplicationContext) {
    const scripts = context.app.getScriptsByLevel(level);
    const selectedScripts = context.state.selection.selectedScripts;
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
