<template>
  <div
    class="handle"
    :style="{ cursor: cursorCssValue }"
    @mousedown="startResize">
    <div class="line" />
    <font-awesome-icon
        class="icon"
        :icon="['fas', 'arrows-alt-h']"
    />
    <div class="line" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Handle extends Vue {
  public readonly cursorCssValue = 'ew-resize';

  private initialX: number = undefined;

  public startResize(event: MouseEvent): void {
    this.initialX = event.clientX;
    document.body.style.setProperty('cursor', this.cursorCssValue);
    document.addEventListener('mousemove', this.resize);
    window.addEventListener('mouseup', this.stopResize);
    event.stopPropagation();
    event.preventDefault();
  }

  public resize(event: MouseEvent): void {
    const displacementX = event.clientX - this.initialX;
    this.$emit('resized', displacementX);
    this.initialX = event.clientX;
  }

  public stopResize(): void {
    document.body.style.removeProperty('cursor');
    document.removeEventListener('mousemove', this.resize);
    window.removeEventListener('mouseup', this.stopResize);
  }
}

</script>

<style lang="scss" scoped>
@use "@/presentation/assets/styles/main" as *;

$color          : $color-primary-dark;
$color-hover    : $color-primary;

.handle {
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  &:hover {
    .line {
      background: $color-hover;
    }
    .image {
      color: $color-hover;
    }
  }
  .line {
    flex: 1;
    background: $color;
    width: 3px;
  }
  .icon {
    color: $color;
  }
  margin-right: 5px;
  margin-left: 5px;
}
</style>
