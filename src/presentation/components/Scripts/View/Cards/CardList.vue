<template>
  <SizeObserver
    @width-changed="width = $event"
  >
    <transition name="fade-transition">
      <div v-if="width">
        <!-- <div id="responsivity-debug">
          Width: {{ width || 'undefined' }}
          Size:
            <span v-if="width <= 500">small</span>
            <span v-if="width > 500 && width < 750">medium</span>
            <span v-if="width >= 750">big</span>
        </div> -->
        <div
          v-if="categoryIds.length > 0"
          class="cards"
        >
          <CardListItem
            v-for="categoryId of categoryIds"
            :key="categoryId"
            class="card"
            :class="{
              'small-screen': width <= 500,
              'medium-screen': width > 500 && width < 750,
              'big-screen': width >= 750,
            }"
            :data-category="categoryId"
            :category-id="categoryId"
            :active-category-id="activeCategoryId"
            @card-expansion-changed="onSelected(categoryId, $event)"
          />
        </div>
        <div v-else class="error">
          Something went bad 😢
        </div>
      </div>
    </transition>
  </SizeObserver>
</template>

<script lang="ts">
import {
  defineComponent, ref, onMounted, onUnmounted, computed,
} from 'vue';
import { injectKey } from '@/presentation/injectionSymbols';
import SizeObserver from '@/presentation/components/Shared/SizeObserver.vue';
import { hasDirective } from './NonCollapsingDirective';
import CardListItem from './CardListItem.vue';

export default defineComponent({
  components: {
    CardListItem,
    SizeObserver,
  },
  setup() {
    const { currentState, onStateChange } = injectKey((keys) => keys.useCollectionState);

    const width = ref<number | undefined>();

    const categoryIds = computed<readonly number[]>(
      () => currentState.value.collection.actions.map((category) => category.id),
    );
    const activeCategoryId = ref<number | undefined>(undefined);

    function onSelected(categoryId: number, isExpanded: boolean) {
      activeCategoryId.value = isExpanded ? categoryId : undefined;
    }

    onStateChange(() => {
      collapseAllCards();
    }, { immediate: true });

    const outsideClickListener = (event: PointerEvent): void => {
      if (areAllCardsCollapsed()) {
        return;
      }
      const element = document.querySelector(`[data-category="${activeCategoryId.value}"]`);
      const target = event.target as Element;
      if (element && !element.contains(target)) {
        onOutsideOfActiveCardClicked(target);
      }
    };

    onMounted(() => {
      document.addEventListener('click', outsideClickListener);
    });

    onUnmounted(() => {
      document.removeEventListener('click', outsideClickListener);
    });

    function onOutsideOfActiveCardClicked(clickedElement: Element): void {
      if (isClickable(clickedElement) || hasDirective(clickedElement)) {
        return;
      }
      collapseAllCards();
    }

    function areAllCardsCollapsed(): boolean {
      return !activeCategoryId.value;
    }

    function collapseAllCards(): void {
      activeCategoryId.value = undefined;
    }

    return {
      width,
      categoryIds,
      activeCategoryId,
      onSelected,
    };
  },
});

function isClickable(element: Element) {
  const cursorName = window.getComputedStyle(element).cursor;
  return ['pointer', 'move', 'grab'].some((name) => cursorName === name)
    || cursorName.includes('resize')
    || ['onclick', 'href'].some((attributeName) => element.hasAttribute(attributeName))
    || ['a', 'button'].some((tagName) => element.closest(`.${tagName}`));
}

</script>

<style scoped lang="scss">
@use "@/presentation/assets/styles/main" as *;
@use "./card-gap" as *;

.cards {
  display: flex;
  flex-flow: row wrap;
  gap: $card-gap;
  /*
    Padding is used to allow scale animation (growing size) for cards on hover.
    It ensures that there's room to grow, so the animation is shown without overflowing
    with scrollbars.
  */
  padding: $spacing-absolute-medium;
}

.error {
  width: 100%;
  text-align: center;
  font-size: $font-size-absolute-xx-large;
}

@include fade-transition('fade-transition');
</style>
