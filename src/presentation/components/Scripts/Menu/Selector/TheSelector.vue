<template>
    <div class="container">
        <div class="part">Select:</div>
        <div class="part">
            <div class="part">
                <SelectableOption
                    label="None"
                    :enabled="this.currentSelection == SelectionType.None"
                    @click="selectType(SelectionType.None)"
                    v-tooltip=" 'Deselect all selected scripts.<br/>' +
                                '💡 Good start to dive deeper into tweaks and select only what you want.'"
                    />
            </div>
            <div class="part"> | </div>
            <div class="part">
                <SelectableOption
                    label="Standard"
                    :enabled="this.currentSelection == SelectionType.Standard"
                    @click="selectType(SelectionType.Standard)"
                    v-tooltip=" '🛡️ Balanced for privacy and functionality.<br/>' +
                                'OS and applications will function normally.<br/>' +
                                '💡 Recommended for everyone'"
                    />
                </div>
            <div class="part"> | </div>
            <div class="part">
                <SelectableOption
                    label="Strict"
                    :enabled="this.currentSelection == SelectionType.Strict"
                    @click="selectType(SelectionType.Strict)"
                    v-tooltip=" '🚫 Stronger privacy, disables risky functions that may leak your data.<br/>' +
                                '⚠️ Double check to remove scripts where you would trade functionality for privacy<br/>' +
                                '💡 Recommended for daily users that prefers more privacy over non-essential functions'"
                    />
                </div>
            <div class="part"> | </div>
            <div class="part">
                    <SelectableOption
                        label="All"
                        :enabled="this.currentSelection == SelectionType.All"
                        @click="selectType(SelectionType.All)"
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
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { SelectionType, SelectionTypeHandler } from './SelectionTypeHandler';

@Component({
  components: {
    SelectableOption,
  },
})
export default class TheSelector extends StatefulVue {
    public SelectionType = SelectionType;
    public currentSelection = SelectionType.None;
    private selectionTypeHandler: SelectionTypeHandler;

    public async selectType(type: SelectionType) {
        if (this.currentSelection === type) {
            return;
        }
        this.selectionTypeHandler.selectType(type);
    }

    protected handleCollectionState(newState: ICategoryCollectionState, oldState: ICategoryCollectionState): void {
        this.selectionTypeHandler = new SelectionTypeHandler(newState);
        this.updateSelections();
        newState.selection.changed.on(() => this.updateSelections());
        if (oldState) {
            oldState.selection.changed.on(() => this.updateSelections());
        }
    }

    private updateSelections() {
       this.currentSelection = this.selectionTypeHandler.getCurrentSelectionType();
    }
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
