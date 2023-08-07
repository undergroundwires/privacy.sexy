<template>
  <modal
    :name="name"
    :adaptive="true"
    height="auto">
    <div class="dialog">
      <div class="dialog__content">
        <slot />
      </div>
      <div class="dialog__close-button">
        <font-awesome-icon
          :icon="['fas', 'times']"
          @click="hide"
        />
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

let idCounter = 0;

export default defineComponent({
  setup() {
    const name = (++idCounter).toString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let modal: any;

    onMounted(async () => {
      // Hack until Vue 3, so we can use vue-js-modal
      const main = await import('@/presentation/main');
      const { getVue } = main;
      modal = getVue().$modal;
    });

    function show(): void {
      modal.show(name);
    }

    function hide(): void {
      modal.hide();
    }

    return {
      name,
      modal,
      hide,
      show,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

@mixin scrollable() {
  overflow-y: auto;
  max-height: 100vh;
}

.dialog {
  color: $color-surface;
  font-family: $font-normal;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  @include scrollable;

  &__content {
    color: $color-on-surface;
    width: 100%;
    margin: 5%;
  }

  &__close-button {
    color: $color-primary-dark;
    width: auto;
    font-size: 1.5em;
    margin-right: 0.25em;
    align-self: flex-start;
    @include clickable;
    @include hover-or-touch {
      color: $color-primary;
    }
  }
}
</style>
