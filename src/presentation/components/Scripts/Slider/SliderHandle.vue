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
import { defineComponent } from 'vue';

export default defineComponent({
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    resized: (displacementX: number) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(_, { emit }) {
    const cursorCssValue = 'ew-resize';
    let initialX: number | undefined;

    const resize = (event) => {
      const displacementX = event.clientX - initialX;
      emit('resized', displacementX);
      initialX = event.clientX;
    };

    const stopResize = () => {
      document.body.style.removeProperty('cursor');
      document.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResize);
    };

    function startResize(event: MouseEvent): void {
      initialX = event.clientX;
      document.body.style.setProperty('cursor', cursorCssValue);
      document.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResize);
      event.stopPropagation();
      event.preventDefault();
    }

    return {
      cursorCssValue,
      startResize,
    };
  },
});
</script>

<style lang="scss" scoped>
@use "@/presentation/assets/styles/main" as *;

$color          : $color-primary-dark;
$color-hover    : $color-primary;

.handle {
  @include clickable($cursor: 'ew-resize');
  display: flex;
  flex-direction: column;
  align-items: center;
  @include hover-or-touch {
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
