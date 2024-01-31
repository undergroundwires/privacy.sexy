<template>
  <div
    class="documentation-button"
    :class="{ expanded: isOn }"
    @click.stop
  >
    <FlatButton
      icon="circle-info"
      @click="toggle()"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';

export default defineComponent({
  components: {
    FlatButton,
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

.documentation-button {
  vertical-align: middle;
  color: $color-primary;
  font-size: $font-size-large;
  :deep() { // This override leads to inconsistent highlight color, it should be re-styled.
    @include hover-or-touch {
      color: $color-primary-darker;
    }
  }
  &.expanded {
    color: $color-primary-light;
  }
}
</style>
