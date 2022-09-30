<template>
  <div class="checkbox-switch" >
    <input type="checkbox" class="input-checkbox"
      v-model="isReverted"
      @change="onRevertToggled()"
      v-on:click.stop>
    <div class="checkbox-animate">
      <span class="checkbox-off">revert</span>
      <span class="checkbox-on">revert</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { IReadOnlyCategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IReverter } from './Reverter/IReverter';
import { INode } from './INode';
import { getReverter } from './Reverter/ReverterFactory';

@Component
export default class RevertToggle extends StatefulVue {
  @Prop() public node: INode;

  public isReverted = false;

  private handler: IReverter;

  @Watch('node', { immediate: true }) public async onNodeChanged(node: INode) {
    const context = await this.getCurrentContext();
    this.handler = getReverter(node, context.state.collection);
  }

  public async onRevertToggled() {
    const context = await this.getCurrentContext();
    this.handler.selectWithRevertState(this.isReverted, context.state.selection);
  }

  protected handleCollectionState(newState: IReadOnlyCategoryCollectionState): void {
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
@use "@/presentation/assets/styles/main" as *;

$color-bullet-unchecked : $color-primary-darker;
$color-bullet-checked   : $color-on-secondary;
$color-text-unchecked   : $color-on-primary;
$color-text-checked     : $color-on-secondary;
$color-bg-unchecked     : $color-primary;
$color-bg-checked       : $color-secondary;
$size-width             : 85px;
$size-height            : 30px;

// https://www.designlabthemes.com/css-toggle-switch/
.checkbox-switch {
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
    @include clickable;
  }

  .checkbox-animate {
    position: relative;
    width: $size-width;
    height: $size-height;
    background-color: $color-bg-unchecked;
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
      background-color: $color-bullet-unchecked;
      top: $size-height * 0.16;
      left: $size-width * 0.05;
      -webkit-transition: left 0.3s ease-out 0s;
      transition: left 0.3s ease-out 0s;
      z-index: 10;
    }
  }

  input.input-checkbox:checked {
    + .checkbox-animate {
        background-color: $color-bg-checked;
    }
    + .checkbox-animate:before {
        left: ($size-width - math.div($size-width, 3.5));
        background-color: $color-bullet-checked;
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
    text-transform: uppercase;
    float: left;
    font-weight: 700;
    -webkit-transition: all 0.3s ease-out 0s;
    transition: all 0.3s ease-out 0s;
  }

  .checkbox-off {
    margin-left: math.div($size-width, 3);
    opacity: 1;
    color: $color-text-unchecked;
  }

  .checkbox-on {
    display: none;
    float: right;
    margin-right: math.div($size-width, 3);
    opacity: 0;
    color: $color-text-checked;
  }
}
</style>
