<template>
    <div class="container">
        <div class="part select">Select:</div>
        <div class="part">
            <SelectableOption
                label="None"
                :enabled="isNoneSelected"
                @click="selectNoneAsync()">
            </SelectableOption>
        </div>
        <div class="part"> | </div>
        <div class="part">
            <SelectableOption
                label="Recommended"
                :enabled="isRecommendedSelected"
                @click="selectRecommendedAsync()" />
        </div>
        <div class="part"> | </div>
       <div class="part">
            <SelectableOption
            label="All"
            :enabled="isAllSelected"
            @click="selectAllAsync()" />
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import SelectableOption from './SelectableOption.vue';
import { IApplicationState } from '@/application/State/IApplicationState';
import { IScript } from '@/domain/Script';

@Component({
  components: {
    SelectableOption,
  },
})
export default class TheSelector extends StatefulVue {
    public isAllSelected = false;
    public isNoneSelected = false;
    public isRecommendedSelected = false;

    public async mounted() {
        const state = await this.getCurrentStateAsync();
        this.updateSelections(state);
        state.selection.changed.on(() => {
            this.updateSelections(state);
        });
    }

    public async selectAllAsync(): Promise<void> {
        if (this.isAllSelected) {
            return;
        }
        const state = await this.getCurrentStateAsync();
        state.selection.selectAll();
    }

    public async selectRecommendedAsync(): Promise<void> {
        if (this.isRecommendedSelected) {
            return;
        }
        const state = await this.getCurrentStateAsync();
        state.selection.selectOnly(state.app.getRecommendedScripts());
    }

    public async selectNoneAsync(): Promise<void> {
        if (this.isNoneSelected) {
            return;
        }
        const state = await this.getCurrentStateAsync();
        state.selection.deselectAll();
    }

    private updateSelections(state: IApplicationState) {
        this.isNoneSelected = state.selection.totalSelected === 0;
        this.isAllSelected = state.selection.totalSelected === state.app.totalScripts;
        this.isRecommendedSelected = this.areSame(state.app.getRecommendedScripts(), state.selection.selectedScripts);
    }

    private areSame(scripts: ReadonlyArray<IScript>, other: ReadonlyArray<IScript>): boolean {
        return (scripts.length === other.length) &&
            scripts.every((script) => other.some((s) => s.id === script.id));
    }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/fonts.scss";

.container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items:flex-start;
    .part {
        display: flex;
        margin-right:5px;
    }
    font-family: $normal-font;
}

</style>
