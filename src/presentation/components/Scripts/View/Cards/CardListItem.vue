<template>
  <div
    ref="cardElement"
    class="card"
    :class="{
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
    <CardExpandTransition>
      <CardExpansionPanel
        v-show="isExpanded"
        :category-id="categoryId"
        @on-collapse="collapse"
        @click.stop
      />
    </CardExpandTransition>
  </div>
</template>

<script lang="ts">
import {
  defineComponent, computed, shallowRef,
  type PropType,
} from 'vue';
import AppIcon from '@/presentation/components/Shared/Icon/AppIcon.vue';
import { injectKey } from '@/presentation/injectionSymbols';
import { sleep } from '@/infrastructure/Threading/AsyncSleep';
import CardSelectionIndicator from './CardSelectionIndicator.vue';
import CardExpandTransition from './CardExpandTransition.vue';
import CardExpansionPanel from './CardExpansionPanel.vue';
import type { CardLayout } from './UseCardLayout';

export default defineComponent({
  components: {
    AppIcon,
    CardSelectionIndicator,
    CardExpansionPanel,
    CardExpandTransition,
  },
  props: {
    categoryId: {
      type: Number,
      required: true,
    },
    cardLayout: {
      type: Object as PropType<CardLayout>,
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
      totalColumns: props.cardLayout.totalColumns,
      collapse,
    };
  },
});

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use "./card-gap" as *;

$card-inner-padding     : $spacing-absolute-xx-large;
$card-horizontal-gap    : $card-gap;

.card {
  .card__inner {
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
    transition: transform 0.2s ease-in-out;

    display:flex;
    flex-direction: column;
    justify-content: center;

    @include hover-or-touch {
      background-color: $color-secondary;
      color: $color-on-secondary;
      transform: scale(1.05);
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
      padding-right: $spacing-absolute-medium;
      display: flex;
      justify-content: flex-end;
    }
    .card__inner__expand-icon {
      width: 100%;
      margin-top: $spacing-relative-x-small;
      vertical-align: middle;
      font-size: $font-size-absolute-normal;
    }
  }

  &.is-expanded {
    .card__inner {
      height: auto;
      background-color: $color-secondary;
      color: $color-on-secondary;
      margin-bottom: $spacing-absolute-xx-large;
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

.card {
  $total-columns: v-bind(totalColumns);
  $total-times-gap-is-used-in-row: calc($total-columns - 1);
  $total-gap-width-in-row: calc($total-times-gap-is-used-in-row * $card-horizontal-gap);
  $available-row-width-for-cards: calc(100% - #{$total-gap-width-in-row});
  $available-width-per-card: calc(#{$available-row-width-for-cards} / $total-columns);
  width:$available-width-per-card;
  :deep(.card__expander) {
    $all-cards-width: calc(100% * $total-columns);
    $additional-padding-width: calc($card-horizontal-gap * ($total-columns - 1));
    width: calc(#{$all-cards-width} + #{$additional-padding-width});
  }
  // @for $nth-card from 2 through $total-columns { // From second card to rest
  //   &:nth-of-type(#{$total-columns}n+#{$nth-card}) {
  //     :deep(.card__expander) {
  //       $card-left: -100% * ($nth-card - 1);
  //       $additional-space: $card-horizontal-gap * ($nth-card - 1);
  //       margin-left: calc(#{$card-left} - #{$additional-space});
  //     }
  //   }
  // }
  // Ensure new line after last row
  $card-after-last: $total-columns + 1;
  &:nth-of-type(#{$total-columns}n+#{$card-after-last}) {
    clear: left;
  }
}
</style>
