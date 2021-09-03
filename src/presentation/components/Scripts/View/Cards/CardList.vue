<template>
  <Responsive v-on:widthChanged="width = $event">
    <!-- <div id="responsivity-debug">
      Width: {{ width || 'undefined' }}
      Size: <span v-if="width <= 500">small</span><span v-if="width > 500 && width < 750">medium</span><span v-if="width >= 750">big</span> 
    </div> -->
    <div v-if="categoryIds != null && categoryIds.length > 0"  class="cards">
      <CardListItem
        class="card"
        v-bind:class="{ 
          'small-screen': width <= 500,
          'medium-screen': width > 500 && width < 750,
          'big-screen': width >= 750         
        }"
        v-for="categoryId of categoryIds"
        :data-category="categoryId"
        v-bind:key="categoryId"
        :categoryId="categoryId"
        :activeCategoryId="activeCategoryId"
        v-on:selected="onSelected(categoryId, $event)">
      </CardListItem>
    </div>
    <div v-else class="error">Something went bad 😢</div>
  </Responsive>
</template>

<script lang="ts">
import CardListItem from './CardListItem.vue';
import Responsive from '@/presentation/components/Shared/Responsive.vue';
import { Component } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { ICategory } from '@/domain/ICategory';
import { hasDirective } from './NonCollapsingDirective';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';

@Component({
  components: {
    CardListItem,
    Responsive,
  },
})
export default class CardList extends StatefulVue {
  public width: number = 0;
  public categoryIds: number[] = [];
  public activeCategoryId?: number = null;

  public created() {
    document.addEventListener('click', this.outsideClickListener);
  }

  public destroyed() {
    document.removeEventListener('click', this.outsideClickListener);
  }

  public onSelected(categoryId: number, isExpanded: boolean) {
    this.activeCategoryId = isExpanded ? categoryId : undefined;
  }

  protected handleCollectionState(newState: ICategoryCollectionState, oldState: ICategoryCollectionState): void {
    this.setCategories(newState.collection.actions);
    this.activeCategoryId = undefined;
  }

  private setCategories(categories: ReadonlyArray<ICategory>): void {
    this.categoryIds = categories.map((category) => category.id);
  }

  private onOutsideOfActiveCardClicked(clickedElement: Element): void {
    if (isClickable(clickedElement) || hasDirective(clickedElement)) {
      return;
    }
    this.collapseAllCards();
    if (hasDirective(clickedElement)) {
      return;
    }
    this.activeCategoryId = null;
  }
  private outsideClickListener(event: PointerEvent) {
    if (this.areAllCardsCollapsed()) {
        return;
    }
    const element = document.querySelector(`[data-category="${this.activeCategoryId}"]`);
    const target = event.target as Element;
    if (element && !element.contains(target)) {
      this.onOutsideOfActiveCardClicked(target);
    }
  }

  private collapseAllCards(): void {
    this.activeCategoryId = undefined;
  }
  private areAllCardsCollapsed(): boolean {
    return !this.activeCategoryId;
  }
}

function isClickable(element: Element) {
  const cursorName = window.getComputedStyle(element).cursor;
  return [ 'pointer', 'move', 'grab'].some((name) => cursorName === name)
    || cursorName.includes('resize')
    || [ 'onclick', 'href'].some((attributeName) => element.hasAttribute(attributeName))
    || [ 'a', 'button'].some((tagName) => element.closest(`.${tagName}`));
}

</script>

<style scoped lang="scss">
@import "@/presentation/styles/fonts.scss";
.cards {
  display: flex;
  flex-flow: row wrap;
  font-family: $main-font;
}

.error {
  width: 100%;
  text-align: center;
  font-size: 3.5em;
  font-family: $normal-font;
}
</style>