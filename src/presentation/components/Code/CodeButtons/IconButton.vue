<template>
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

.button {
  display: flex;
  flex-direction: column;
  align-items: center;

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

  width: 10%;
  min-width: 90px;
  @include hover-or-touch {
    background: $color-surface;
    box-shadow: 0px 2px 10px 5px $color-secondary;
  }
  @include hover-or-touch('>&__text') {
    display: block;
  }
  @include hover-or-touch('>&__icon') {
    display: none;
  }
  &__text {
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
