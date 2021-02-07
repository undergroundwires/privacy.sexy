<template>
  <div>
    <div v-if="categoryIds != null && categoryIds.length > 0" class="cards">
      <CardListItem
        class="card"
        v-for="categoryId of categoryIds"
        :data-category="categoryId"
        v-bind:key="categoryId"
        :categoryId="categoryId"
        :activeCategoryId="activeCategoryId"
        v-on:selected="onSelected(categoryId, $event)">
      </CardListItem>
    </div>
    <div v-else class="error">Something went bad 😢</div>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import CardListItem from './CardListItem.vue';
import { StatefulVue } from '@/presentation/StatefulVue';
import { ICategory } from '@/domain/ICategory';
import { hasDirective } from './NonCollapsingDirective';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';

@Component({
  components: {
    CardListItem,
  },
})
export default class CardList extends StatefulVue {
  public categoryIds: number[] = [];
  public activeCategoryId?: number = null;

  public created() {
    this.onOutsideOfActiveCardClicked((element) => {
      if (hasDirective(element)) {
        return;
      }
      this.activeCategoryId = null;
    });
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
  private onOutsideOfActiveCardClicked(callback: (clickedElement: Element) => void) {
    const outsideClickListener = (event) => {
      if (!this.activeCategoryId) {
        return;
      }
      const element = document.querySelector(`[data-category="${this.activeCategoryId}"]`);
      if (element && !element.contains(event.target)) {
          callback(event.target);
      }
    };
    document.addEventListener('click', outsideClickListener);
  }
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