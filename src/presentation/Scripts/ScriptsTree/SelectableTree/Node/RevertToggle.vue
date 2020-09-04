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
    import { StatefulVue } from '@/presentation/StatefulVue';
    import { INode } from './INode';
    import { SelectedScript } from '@/application/State/Selection/SelectedScript';
    import { getReverter } from './Reverter/ReverterFactory';

    @Component
    export default class RevertToggle extends StatefulVue {
        @Prop() public node: INode;
        public isReverted = false;

        private handler: IReverter;

        public async mounted() {
            await this.onNodeChangedAsync(this.node);
            const state = await this.getCurrentStateAsync();
            this.updateState(state.selection.selectedScripts);
            state.selection.changed.on((scripts) => this.updateState(scripts));
        }

        @Watch('node') public async onNodeChangedAsync(node: INode) {
            const state = await this.getCurrentStateAsync();
            this.handler = getReverter(node, state.app);
        }

        public async onRevertToggledAsync() {
            const state = await this.getCurrentStateAsync();
            this.handler.selectWithRevertState(this.isReverted, state.selection);
        }

        private updateState(scripts: ReadonlyArray<SelectedScript>) {
            this.isReverted = this.handler.getState(scripts);
        }
    }
</script>


<style scoped lang="scss">
    @import "@/presentation/styles/colors.scss";
    $width: 85px;
    $height: 30px;
    // https://www.designlabthemes.com/css-toggle-switch/
    .checkbox-switch {
        cursor: pointer;
        display: inline-block;
        overflow: hidden;
        position: relative;
        width: $width;
        height: $height;
        -webkit-border-radius: $height;
        border-radius: $height;
        line-height: $height;
        font-size: $height / 2;
        display: inline-block;

        input.input-checkbox {
            position: absolute;
            left: 0;
            top: 0;
            width: $width;
            height: $height;
            padding: 0;
            margin: 0;
            opacity: 0;
            z-index: 2;
            cursor: pointer;
        }

        .checkbox-animate {
            position: relative;
            width: $width;
            height: $height;
            background-color: $gray;
            -webkit-transition: background-color 0.25s ease-out 0s;
            transition: background-color 0.25s ease-out 0s;

            // Circle
            &:before {
                $circle-size: $height * 0.66;

                content: "";
                display: block;
                position: absolute;
                width: $circle-size;
                height: $circle-size;
                border-radius: $circle-size * 2;
                -webkit-border-radius: $circle-size * 2;
                background-color: $slate;
                top: $height * 0.16;
                left: $width * 0.05;
                -webkit-transition: left 0.3s ease-out 0s;
                transition: left 0.3s ease-out 0s;
                z-index: 10;
            }
        }

        input.input-checkbox:checked {
            + .checkbox-animate {
                background-color: $accent;
            }
            + .checkbox-animate:before {
                left: ($width - $width/3.5);
                background-color: $light-gray;
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
            color: $white;
            font-weight: 700;
                -webkit-transition: all 0.3s ease-out 0s;
            transition: all 0.3s ease-out 0s;
        }

        .checkbox-off {
            margin-left: $width / 3;
            opacity: 1;
        }

        .checkbox-on {
            display: none;
            float: right;
            margin-right: $width / 3;
            opacity: 0;
        }
    }
</style>