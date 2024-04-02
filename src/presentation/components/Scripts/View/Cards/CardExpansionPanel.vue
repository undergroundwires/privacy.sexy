<template>
  <div>
    <CardExpansionArrow />
    <div class="card__expander">
      <div class="card__expander__close-button">
        <FlatButton
          icon="xmark"
          @click="collapse()"
        />
      </div>
      <div class="card__expander__content">
        <ScriptsTree
          :category-id="categoryId"
          :has-top-padding="false"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
} from 'vue';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';
import ScriptsTree from '@/presentation/components/Scripts/View/Tree/ScriptsTree.vue';
import CardExpansionArrow from './CardExpansionArrow.vue';

export default defineComponent({
  components: {
    ScriptsTree,
    FlatButton,
    CardExpansionArrow,
  },
  props: {
    categoryId: {
      type: Number,
      required: true,
    },
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    onCollapse: () => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(_, { emit }) {
    function collapse() {
      emit('onCollapse');
    }

    return {
      collapse,
    };
  },
});
</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use "./card-gap" as *;

.card__expander {
  position: relative;
  background-color: $color-primary-darker;
  color: $color-on-primary;
  margin-top: $spacing-absolute-xx-large;

  display: flex;
  align-items: center;
  flex-direction: column;

  .card__expander__content {
    display: flex;
    justify-content: center;
    word-break: break-word;
    max-width: 100%; // Prevents horizontal expansion of inner content (e.g., when a code block is shown)
    width: 100%; // Expands the container to fill available horizontal space, enabling alignment of child items.
  }

  .card__expander__close-button {
    font-size: $font-size-absolute-large;
    align-self: flex-end;
    margin-right: $spacing-absolute-small;
    @include clickable;
    color: $color-primary-light;
    @include hover-or-touch {
      color: $color-primary;
    }
  }
}
</style>
