<template>
    <button class="button" @click="onClicked">
        <font-awesome-icon
        class="button__icon"
        :icon="[iconPrefix, iconName]" size="2x"  />
        <div class="button__text">{{text}}</div>
    </button>
</template>

<script lang="ts">
import { Component, Prop, Vue, Emit } from 'vue-property-decorator';
import { StatefulVue, IApplicationState } from './StatefulVue';
import { SaveFileDialog } from './../infrastructure/SaveFileDialog';
import { Clipboard } from './../infrastructure/Clipboard';

@Component
export default class IconButton extends StatefulVue {
  @Prop() public text!: number;
  @Prop() public iconPrefix!: string;
  @Prop() public iconName!: string;

  @Emit('click')
  public onClicked() {
      return;
  }

}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";

.button {
    display: flex;
    flex-direction: column;
    align-items: center;

    background-color: $accent;
    border: none;
    color: $white;
    padding:20px;
    transition-duration: 0.4s;
    overflow: hidden;
    box-shadow: 0 3px 9px $dark-slate;
    border-radius: 4px;

    cursor: pointer;
    // border: 0.1em solid $slate;
	// border-radius: 80px;
	// padding: 0.5em;
    width: 10%;
    min-width: 90px;
    &:hover {
        background: $white;
        box-shadow: 0px 2px 10px 5px $accent;
        color: $black;
    }
    &:hover>&__text {
        display: block;
    }
    &:hover>&__icon {
        display: none;
    }
    &__text {
        display: none;
        font-family: 'Yesteryear', cursive;
        font-size: 1.5em;
        color: $gray;
        font-weight: 500;
        line-height: 1.1;
    }
  }

</style>
