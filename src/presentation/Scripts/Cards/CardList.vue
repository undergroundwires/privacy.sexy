<template>
  <div>
    <div v-if="categoryIds != null && categoryIds.length > 0" class="cards">
      <CardListItem
        class="card"
        v-for="categoryId of categoryIds"
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import CardListItem from './CardListItem.vue';
import { StatefulVue, IApplicationState } from '@/presentation/StatefulVue';
import { ICategory } from '@/domain/ICategory';

@Component({
  components: {
    CardListItem,
  },
})
export default class CardList extends StatefulVue {
  public categoryIds: number[] = [];
  public activeCategoryId?: number = null;

  public async mounted() {
    const state = await this.getCurrentStateAsync();
    this.setCategories(state.app.categories);
  }

  public onSelected(categoryId: number, isExpanded: boolean) {
    this.activeCategoryId = isExpanded ? categoryId : undefined;
  }

  private setCategories(categories: ReadonlyArray<ICategory>): void {
    this.categoryIds = categories.map((category) => category.id);
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/fonts.scss";
.cards {
  display: flex;
  flex-flow: row wrap;
  .card {

  }
}
.error {
  width: 100%;
  text-align: center;
  font-size: 3.5em;
  font: $default-font;
}
</style>