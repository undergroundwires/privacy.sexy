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
          @click="$modal.hide(name)"
        />
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class Dialog extends Vue {
  private static idCounter = 0;

  public name = (++Dialog.idCounter).toString();

  public show(): void {
    this.$modal.show(this.name);
  }
}
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
