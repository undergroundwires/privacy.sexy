<template>
    <modal
        :name="name"
        :scrollable="true"
        :adaptive="true"
        height="auto">
    <div class="dialog">
      <div class="dialog__content">
          <slot></slot>
      </div>
      <div class="dialog__close-button">
        <font-awesome-icon :icon="['fas', 'times']"  @click="$modal.hide(name)"/>
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
@import "@/presentation/styles/fonts.scss";

.dialog {
  font-family: $normal-font;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;

  &__content {
    width: 100%;
    margin: 5%;
  }

  &__close-button {
    width: auto;
    font-size: 1.5em;
    margin-right: 0.25em;
    align-self: flex-start;
    cursor: pointer;
    &:hover {
      opacity: 0.9;
    }
  }
}
</style>
