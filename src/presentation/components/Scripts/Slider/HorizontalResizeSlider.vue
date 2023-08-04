<template>
  <div
    class="slider"
    v-bind:style="{
      '--vertical-margin': this.verticalMargin,
      '--first-min-width': this.firstMinWidth,
      '--first-initial-width': this.firstInitialWidth,
      '--second-min-width': this.secondMinWidth,
    }"
  >
    <div class="first" ref="firstElement">
      <slot name="first" />
    </div>
    <Handle class="handle" @resized="onResize($event)" />
    <div class="second">
      <slot name="second" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import Handle from './Handle.vue';

@Component({
  components: {
    Handle,
  },
})
export default class HorizontalResizeSlider extends Vue {
  @Prop() public verticalMargin: string;

  @Prop() public firstMinWidth: string;

  @Prop() public firstInitialWidth: string;

  @Prop() public secondMinWidth: string;

  private get left(): HTMLElement { return this.$refs.firstElement as HTMLElement; }

  public onResize(displacementX: number): void {
    const leftWidth = this.left.offsetWidth + displacementX;
    this.left.style.width = `${leftWidth}px`;
  }
}
</script>

<style lang="scss" scoped>
@use "@/presentation/assets/styles/main" as *;

.slider {
  display: flex;
  flex-direction: row;
  .first {
    min-width: var(--first-min-width);
    width: var(--first-initial-width);
  }
  .second {
    flex: 1;
    min-width: var(--second-min-width);
  }
  @media screen and (max-width: $media-vertical-view-breakpoint) {
    flex-direction: column;
    .first {
      width: auto !important;
    }
    .second {
      margin-top: var(--vertical-margin);
    }
    .handle {
      display: none;
    }
  }
}
</style>
