<template>
  <div
    class="toggle-switch"
    @click="onClick"
  >
    <input
      v-model="isChecked"
      type="checkbox"
      class="toggle-input"
    >
    <div class="toggle-animation">
      <div class="circle" />
      <span
        class="label"
        :class="{
          'label-off': !isChecked,
          'label-on': isChecked,
        }"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  props: {
    modelValue: Boolean,
    label: {
      type: String,
      required: true,
    },
    stopClickPropagation: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    'update:modelValue': (isChecked: boolean) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(props, { emit }) {
    const isChecked = computed({
      get() {
        return props.modelValue;
      },
      set(value: boolean) {
        if (value === props.modelValue) {
          return;
        }
        emit('update:modelValue', value);
      },
    });

    function onClick(event: Event): void {
      if (props.stopClickPropagation) {
        event.stopPropagation();
      }
      isChecked.value = !isChecked.value;
    }

    return {
      isChecked,
      onClick,
    };
  },
});
</script>

<style scoped lang="scss">
@use 'sass:math';
@use "@/presentation/assets/styles/main" as *;

$font-size              : $font-size-absolute-small;

$color-toggle-unchecked : $color-primary-darker;
$color-toggle-checked   : $color-on-secondary;
$color-text-unchecked   : $color-on-primary;
$color-text-checked     : $color-on-secondary;
$color-bg-unchecked     : $color-primary;
$color-bg-checked       : $color-secondary;
$size-height            : $font-size + 8px;
$size-circle            : math.div($size-height * 2, 3);
$padding-horizontal     : 0.40em;
$gap                    : 0.25em;

@mixin locateNearCircle($direction: 'left') {
  $circle-width: calc(#{$size-circle} + #{$padding-horizontal});
  $circle-space: calc(#{$circle-width} + #{$gap});
  @if $direction == 'left' {
    margin-left: $circle-space;
  } @else {
    margin-right: $circle-space;
  }
}

.toggle-switch {
  display: flex;
  overflow: hidden;
  position: relative;
  width: auto;
  height: $size-height;
  border-radius: $size-height;
  font-size: $font-size;

  input.toggle-input {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    @include clickable;
  }

  .toggle-animation {
    display: flex;
    align-items: center;
    gap: $gap;
    width: 100%;
    height: 100%;
    background-color: $color-bg-unchecked;
    transition: background-color 0.25s ease-out;

    .circle {
      display: block;
      position: absolute;
      left: $padding-horizontal;
      $initial-top: 50%;
      $centered-top-offset: math.div($size-circle, 2);
      $centered-top: calc(#{$initial-top} - #{$centered-top-offset});
      top: $centered-top;
      width: $size-circle;
      height: $size-circle;
      border-radius: 50%;
      background-color: $color-toggle-unchecked;
      transition: left 0.3s ease-out;
    }
  }

  input.toggle-input:checked + .toggle-animation {
    background-color: $color-bg-checked;
    flex-direction: row-reverse;

    .circle {
      $left-offset: calc(100% - #{$size-circle});
      $padded-left-offset: calc(#{$left-offset} - #{$padding-horizontal});
      left: $padded-left-offset;
      background-color: $color-toggle-checked;
    }
  }

  .label {
    font-weight: bold;
    transition: all 0.3s ease-out, color 0s;
    &.label-off {
      @include locateNearCircle('left');
      padding-right: $padding-horizontal;
    }

    &.label-on {
      color: $color-text-checked;

      @include locateNearCircle('right');
      padding-left: $padding-horizontal;
    }
  }
}
</style>
