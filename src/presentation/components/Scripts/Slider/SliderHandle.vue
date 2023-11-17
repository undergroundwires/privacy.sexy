<template>
  <div
    class="handle"
    :style="{ cursor: cursorCssValue }"
    @mousedown="startResize"
  >
    <div class="line" />
    <AppIcon
      class="icon"
      icon="left-right"
    />
    <div class="line" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';

export default defineComponent({
  components: {
    AppIcon,
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    resized: (displacementX: number) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(_, { emit }) {
    const cursorCssValue = 'ew-resize';
    let initialX: number | undefined;

    const resize = (event: MouseEvent) => {
      if (initialX === undefined) {
        throw new Error('Resize action started without an initial X coordinate.');
      }
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

    onUnmounted(() => {
      stopResize();
    });

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
