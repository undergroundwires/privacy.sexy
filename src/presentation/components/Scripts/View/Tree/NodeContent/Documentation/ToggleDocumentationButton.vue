<template>
  <a
    class="button"
    target="_blank"
    v-bind:class="{ 'button-on': isOn }"
    v-on:click.stop
    v-on:click="toggle()"
  >
    <font-awesome-icon :icon="['fas', 'info-circle']" />
  </a>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
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
