<template>
  <div class="button-wrapper">
    <button
      class="button"
      type="button"
      @click="onClicked"
    >
      <AppIcon
        class="button__icon"
        :icon="iconName"
      />
      <div class="button__text">{{text}}</div>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { IconName } from '@/presentation/components/Shared/Icon/IconName';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';

export default defineComponent({
  components: {
    AppIcon,
  },
  props: {
    text: {
      type: String,
      required: true,
    },
    iconName: {
      type: String as PropType<IconName>,
      required: true,
    },
  },
  emits: [
    'click',
  ],
  setup(_, { emit }) {
    function onClicked() {
      emit('click');
    }

    return {
      onClicked,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.button-wrapper {
  position: relative;
  height: 70px;
  .button {
    position: absolute;
    width: 100%;
    height: 100%;
  }
}

.button {
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: $color-secondary;
  color: $color-on-secondary;

  border: none;
  padding:20px;
  transition-duration: 0.4s;
  overflow: hidden;
  box-shadow: 0 3px 9px $color-primary-darkest;
  border-radius: 4px;

  &__icon {
    font-size: 2em;
  }

  @include clickable;

  @include hover-or-touch {
    background: $color-surface;
    box-shadow: 0px 2px 10px 5px $color-secondary;
    .button__text {
      display: block;
    }
    .button__icon {
      display: none;
    }
  }
  .button__text {
    display: none;
    font-family: $font-artistic;
    font-size: 1.5em;
    color: $color-primary;
    font-weight: 500;
    line-height: 1.1;
    @include hover-or-touch {
      display: block;
    }
  }
}
</style>
