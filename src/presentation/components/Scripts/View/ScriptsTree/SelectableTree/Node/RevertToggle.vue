<template>
        <div class="checkbox-switch" >
            <input type="checkbox" class="input-checkbox" 
                v-model="isReverted"
                @change="onRevertToggledAsync()"
                v-on:click.stop>
            <div class="checkbox-animate">
                <span class="checkbox-off">revert</span>
                <span class="checkbox-on">revert</span>
            </div>
        </div>
</template>


<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { IReverter } from './Reverter/IReverter';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { INode } from './INode';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { getReverter } from './Reverter/ReverterFactory';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';

@Component
export default class RevertToggle extends StatefulVue {
    @Prop() public node: INode;
    public isReverted = false;

    private handler: IReverter;

    @Watch('node', {immediate: true}) public async onNodeChangedAsync(node: INode) {
        const context = await this.getCurrentContextAsync();
        this.handler = getReverter(node, context.state.collection);
    }
    public async onRevertToggledAsync() {
        const context = await this.getCurrentContextAsync();
        this.handler.selectWithRevertState(this.isReverted, context.state.selection);
    }

    protected handleCollectionState(newState: ICategoryCollectionState): void {
        this.updateStatus(newState.selection.selectedScripts);
        this.events.unsubscribeAll();
        this.events.register(newState.selection.changed.on((scripts) => this.updateStatus(scripts)));
    }

    private updateStatus(scripts: ReadonlyArray<SelectedScript>) {
        this.isReverted = this.handler.getState(scripts);
    }
}
</script>


<style scoped lang="scss">
@use 'sass:math';
@import "@/presentation/styles/colors.scss";

$color-unchecked-bullet : $color-primary-darker;
$color-unchecked-text   : $color-on-primary;
$color-unchecked-bg     : $color-primary;
$color-checked-bg       : $color-secondary;
$color-checked-text     : $color-on-secondary;
$color-checked-bullet   : $color-on-secondary;
$size-width             : 85px;
$size-height            : 30px;

// https://www.designlabthemes.com/css-toggle-switch/
.checkbox-switch {
    cursor: pointer;
    display: inline-block;
    overflow: hidden;
    position: relative;
    width: $size-width;
    height: $size-height;
    -webkit-border-radius: $size-height;
    border-radius: $size-height;
    line-height: $size-height;
    font-size: math.div($size-height, 2);
    display: inline-block;

    input.input-checkbox {
        position: absolute;
        left: 0;
        top: 0;
        width: $size-width;
        height: $size-height;
        padding: 0;
        margin: 0;
        opacity: 0;
        z-index: 2;
        cursor: pointer;
    }

    .checkbox-animate {
        position: relative;
        width: $size-width;
        height: $size-height;
        background-color: $color-unchecked-bg;
        -webkit-transition: background-color 0.25s ease-out 0s;
        transition: background-color 0.25s ease-out 0s;

        // Circle
        &:before {
            $circle-size: $size-height * 0.66;

            content: "";
            display: block;
            position: absolute;
            width: $circle-size;
            height: $circle-size;
            border-radius: $circle-size * 2;
            -webkit-border-radius: $circle-size * 2;
            background-color: $color-unchecked-bullet;
            top: $size-height * 0.16;
            left: $size-width * 0.05;
            -webkit-transition: left 0.3s ease-out 0s;
            transition: left 0.3s ease-out 0s;
            z-index: 10;
        }
    }

    input.input-checkbox:checked {
        + .checkbox-animate {
            background-color: $color-checked-bg;
        }
        + .checkbox-animate:before {
            left: ($size-width - math.div($size-width, 3.5));
            background-color: $color-checked-bullet;
        }
        + .checkbox-animate .checkbox-off {
            display: none;
            opacity: 0;
        }
        + .checkbox-animate .checkbox-on {
            display: block;
            opacity: 1;
        }
    }

    .checkbox-off, .checkbox-on {
        float: left;
        font-weight: 700;
            -webkit-transition: all 0.3s ease-out 0s;
        transition: all 0.3s ease-out 0s;
    }

    .checkbox-off {
        margin-left: math.div($size-width, 3);
        opacity: 1;
        color: $color-unchecked-text;
    }

    .checkbox-on {
        display: none;
        float: right;
        margin-right: math.div($size-width, 3);
        opacity: 0;
        color: $color-checked-text;
    }
}
</style>