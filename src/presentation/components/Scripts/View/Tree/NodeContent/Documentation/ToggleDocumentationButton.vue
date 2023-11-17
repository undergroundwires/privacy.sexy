<template>
  <a
    class="button"
    target="_blank"
    :class="{ 'button-on': isOn }"
    @click.stop
    @click="toggle()"
  >
    <AppIcon icon="circle-info" />
  </a>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';

export default defineComponent({
  components: {
    AppIcon,
  },
  emits: [
    'show',
    'hide',
  ],
  setup(_, { emit }) {
    const isOn = ref(false);

    function toggle() {
      isOn.value = !isOn.value;
      if (isOn.value) {
        emit('show');
      } else {
        emit('hide');
      }
    }

    return {
      isOn,
      toggle,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

.button {
  @include clickable;
  vertical-align: middle;
  color: $color-primary;
  @include hover-or-touch {
    color: $color-primary-darker;
  }
  &-on {
    color: $color-primary-light;
  }
}
</style>
