<template>
  <div ref="containerElement" class="container">
    <slot ref="containerElement"></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator';
import ResizeObserver from 'resize-observer-polyfill';
import { throttle } from './Throttle';

@Component
export default class Responsive extends Vue {
  private width: number;
  private height: number;
  private observer: ResizeObserver;
  private get container(): HTMLElement { return this.$refs.containerElement as HTMLElement; }

  public mounted() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    const resizeCallback = throttle(() => this.updateSize(), 200);
    this.observer = new ResizeObserver(resizeCallback);
    this.observer.observe(this.container);
    this.fireChangeEvents();
  }
  public updateSize() {
    let sizeChanged = false;
    if (this.isWidthChanged()) {
      this.updateWidth(this.container.offsetWidth);
      sizeChanged = true;
    }
    if (this.isHeightChanged()) {
      this.updateHeight(this.container.offsetHeight);
      sizeChanged = true;
    }
    if (sizeChanged) {
      this.$emit('sizeChanged');
    }
  }
  @Emit('widthChanged') public updateWidth(width: number) {
    this.width = width;
  }
  @Emit('heightChanged') public updateHeight(height: number) {
    this.height = height;
  }
  public destroyed() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private fireChangeEvents() {
    this.updateWidth(this.container.offsetWidth);
    this.updateHeight(this.container.offsetHeight);
    this.$emit('sizeChanged');
  }
  private isWidthChanged(): boolean {
    return this.width !== this.container.offsetWidth;
  }
  private isHeightChanged(): boolean {
    return this.height !== this.container.offsetHeight;
  }
}

</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  display: inline-block; // if inline then it has no height or weight
}
</style>

