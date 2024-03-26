<template>
  <div
    ref="cardElement"
    class="card"
    :class="{
      'is-collapsed': !isExpanded,
      'is-inactive': activeCategoryId && activeCategoryId !== categoryId,
      'is-expanded': isExpanded,
    }"
    @click="isExpanded = !isExpanded"
  >
    <div class="card__inner">
      <!-- Title -->
      <span
        v-if="cardTitle.length > 0"
        class="card__inner__title"
      >
        <span>{{ cardTitle }}</span>
      </span>
      <span v-else>Oh no 😢</span>
      <!-- Expand icon -->
      <AppIcon
        class="card__inner__expand-icon"
        :icon="isExpanded ? 'folder-open' : 'folder'"
      />
      <!-- Indeterminate and full states -->
      <CardSelectionIndicator
        class="card__inner__selection_indicator"
        :category-id="categoryId"
      />
    </div>
    <div class="card__expander" @click.stop>
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
  defineComponent, computed, shallowRef,
} from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import FlatButton from '@/presentation/components/Shared/FlatButton.vue';
import { injectKey } from '@/presentation/injectionSymbols';
import ScriptsTree from '@/presentation/components/Scripts/View/Tree/ScriptsTree.vue';
import { sleep } from '@/infrastructure/Threading/AsyncSleep';
import CardSelectionIndicator from './CardSelectionIndicator.vue';

export default defineComponent({
  components: {
    ScriptsTree,
    AppIcon,
    CardSelectionIndicator,
    FlatButton,
  },
  props: {
    categoryId: {
      type: Number,
      required: true,
    },
    activeCategoryId: {
      type: Number,
      default: undefined,
    },
  },
  emits: {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    cardExpansionChanged: (isExpanded: boolean) => true,
    /* eslint-enable @typescript-eslint/no-unused-vars */
  },
  setup(props, { emit }) {
    const { currentState } = injectKey((keys) => keys.useCollectionState);

    const isExpanded = computed({
      get: () => {
        return props.activeCategoryId === props.categoryId;
      },
      set: (newValue) => {
        if (newValue) {
          scrollToCard();
        }
        emit('cardExpansionChanged', newValue);
      },
    });

    const cardElement = shallowRef<HTMLElement>();

    const cardTitle = computed<string>(() => {
      const category = currentState.value.collection.getCategory(props.categoryId);
      return category.name;
    });

    function collapse() {
      isExpanded.value = false;
    }

    async function scrollToCard() {
      const card = cardElement.value;
      if (!card) {
        throw new Error('Card is not found');
      }
      await sleep(400); // wait a bit to allow GUI to render the expanded card
      card.scrollIntoView({ behavior: 'smooth' });
    }

    return {
      cardTitle,
      isExpanded,
      cardElement,
      collapse,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;

$card-inner-padding     : 30px;
$arrow-size             : 15px;
$expanded-margin-top    : 30px;
$card-horizontal-gap    : $card-gap;

.card {
  transition: all 0.2s ease-in-out;

  &__inner {
    padding-top: $card-inner-padding;
    padding-right: $card-inner-padding;
    padding-bottom: 0;
    padding-left: $card-inner-padding;
    position: relative;
    @include clickable;
    background-color: $color-primary;
    color: $color-on-primary;
    height: 100%;
    width: 100%;
    text-transform: uppercase;
    text-align: center;
    transition: all 0.2s ease-in-out;

    display:flex;
    flex-direction: column;
    justify-content: center;

    @include hover-or-touch {
      background-color: $color-secondary;
      color: $color-on-secondary;
      transform: scale(1.05);
    }
    &:after {
      transition: all 0.3s ease-in-out;
    }
    .card__inner__title {
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: center;
      font-size: $font-size-absolute-large;
    }
    .card__inner__selection_indicator {
      height: $card-inner-padding;
      margin-right: -$card-inner-padding;
      padding-right: 10px;
      display: flex;
      justify-content: flex-end;
    }
    .card__inner__expand-icon {
      width: 100%;
      margin-top: .25em;
      vertical-align: middle;
      font-size: $font-size-absolute-normal;
    }
  }
  .card__expander {
    transition: all 0.2s ease-in-out;
    position: relative;
    background-color: $color-primary-darker;
    color: $color-on-primary;

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
      margin-right: 0.25em;
      @include clickable;
      color: $color-primary-light;
      @include hover-or-touch {
        color: $color-primary;
      }
    }
  }

  &.is-collapsed {
    .card__inner {
      &:after {
        content: "";
        opacity: 0;
      }
    }

    .card__expander {
      max-height: 0;
      min-height: 0;
      overflow: hidden;
      opacity: 0;
    }
  }

  &.is-expanded {
    .card__inner {
      height: auto;
      background-color: $color-secondary;
      color: $color-on-secondary;
      &:after { // arrow
        content: "";
        display: block;
        position: absolute;
        bottom: calc(-1 * #{$expanded-margin-top});
        left: calc(50% - #{$arrow-size});
        border-left: #{$arrow-size} solid transparent;
        border-right: #{$arrow-size} solid transparent;
        border-bottom: #{$arrow-size} solid $color-primary-darker;
      }
    }

    .card__expander {
      margin-top: $expanded-margin-top;
      opacity: 1;
    }

    @include hover-or-touch {
      .card__inner {
        transform: scale(1);
      }
    }
  }

  &.is-inactive {
    .card__inner {
      pointer-events: none;
      height: auto;
      background-color: $color-primary-light;
      transform: scale(0.95);
    }

    @include hover-or-touch {
      .card__inner {
        background-color: $color-primary;
        transform: scale(1);
      }
    }
  }
}
@mixin adaptive-card($cards-in-row) {
  &.card {
    $total-times-gap-is-used-in-row: $cards-in-row - 1;
    $total-gap-width-in-row: $total-times-gap-is-used-in-row * $card-horizontal-gap;
    $available-row-width-for-cards: calc(100% - #{$total-gap-width-in-row});
    $available-width-per-card: calc(#{$available-row-width-for-cards} / #{$cards-in-row});
    width:$available-width-per-card;
    .card__expander {
      $all-cards-width: 100% * $cards-in-row;
      $additional-padding-width: $card-horizontal-gap * ($cards-in-row - 1);
      width: calc(#{$all-cards-width} + #{$additional-padding-width});
    }
    @for $nth-card from 2 through $cards-in-row { // From second card to rest
      &:nth-of-type(#{$cards-in-row}n+#{$nth-card}) {
        .card__expander {
          $card-left: -100% * ($nth-card - 1);
          $additional-space: $card-horizontal-gap * ($nth-card - 1);
          margin-left: calc(#{$card-left} - #{$additional-space});
        }
      }
    }
    // Ensure new line after last row
    $card-after-last: $cards-in-row + 1;
    &:nth-of-type(#{$cards-in-row}n+#{$card-after-last}) {
      clear: left;
    }
  }
}

.big-screen     {   @include adaptive-card(3);  }
.medium-screen  {   @include adaptive-card(2);  }
.small-screen   {   @include adaptive-card(1);  }
</style>
