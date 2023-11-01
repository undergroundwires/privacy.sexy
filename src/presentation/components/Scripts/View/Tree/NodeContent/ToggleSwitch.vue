<template>
  <div
    class="toggle-switch"
    @click="handleClickPropagation"
  >
    <input
      type="checkbox"
      class="toggle-input"
      v-model="isChecked"
    >
    <div class="toggle-animation">
      <span class="label-off">{{ label }}</span>
      <span class="label-on">{{ label }}</span>
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

    function handleClickPropagation(event: Event): void {
      if (props.stopClickPropagation) {
        event.stopPropagation();
      }
    }

    return {
      isChecked,
      handleClickPropagation,
    };
  },
});
</script>

<style scoped lang="scss">
@use 'sass:math';
@use "@/presentation/assets/styles/main" as *;

$color-toggle-unchecked : $color-primary-darker;
$color-toggle-checked   : $color-on-secondary;
$color-text-unchecked   : $color-on-primary;
$color-text-checked     : $color-on-secondary;
$color-bg-unchecked     : $color-primary;
$color-bg-checked       : $color-secondary;
$size-height            : 30px;
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

@mixin setVisibility($isVisible: true) {
  @if $isVisible {
    display: block;
    opacity: 1;
  } @else {
    display: none;
    opacity: 0;
  }
}

.toggle-switch {
  display: flex;
  overflow: hidden;
  position: relative;
  width: auto;
  height: $size-height;
  border-radius: $size-height;
  line-height: $size-height;
  font-size: math.div($size-height, 2);

  input.toggle-input {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    z-index: 2;
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

    &:before {
      content: "";
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
      z-index: 10;
    }
  }

  input.toggle-input:checked + .toggle-animation {
    background-color: $color-bg-checked;
    flex-direction: row-reverse;

    &:before {
      $left-offset: calc(100% - #{$size-circle});
      $padded-left-offset: calc(#{$left-offset} - #{$padding-horizontal});
      left: $padded-left-offset;
      background-color: $color-toggle-checked;
    }

    .label-off {
      @include setVisibility(false);
    }

    .label-on {
      @include setVisibility(true);
    }
  }

  .label-off, .label-on {
    text-transform: uppercase;
    font-weight: 700;
    transition: all 0.3s ease-out;
  }

  .label-off {
    @include setVisibility(true);
    @include locateNearCircle('left');
    padding-right: $padding-horizontal;
  }

  .label-on {
    @include setVisibility(false);
    color: $color-text-checked;

    @include locateNearCircle('right');
    padding-left: $padding-horizontal;
  }
}
</style>
