<template>
    <div class="card"
          v-on:click="onSelected(!isExpanded)"
          v-bind:class="{ 
                    'is-collapsed': !isExpanded,
                    'is-inactive': activeCategoryId && activeCategoryId != categoryId,
                    'is-expanded': isExpanded}">
      <div class="card__inner">
        <span v-if="cardTitle && cardTitle.length > 0">{{cardTitle}}</span>
        <span v-else>Oh no 😢</span>
        <font-awesome-icon :icon="['far', isExpanded ? 'folder-open' : 'folder']" class="card__inner__expand-icon" />
      </div>
      <div class="card__expander" v-on:click.stop>
        <div class="card__expander__content">
          <ScriptsTree :categoryId="categoryId"></ScriptsTree>
        </div>
        <div class="card__expander__close-button">
          <font-awesome-icon :icon="['fas', 'times']"  v-on:click="onSelected(false)"/>
        </div>
    </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Emit } from 'vue-property-decorator';
import ScriptsTree from '@/presentation/Scripts/ScriptsTree/ScriptsTree.vue';
import { StatefulVue } from '@/presentation/StatefulVue';

@Component({
  components: {
    ScriptsTree,
  },
})
export default class CardListItem extends StatefulVue {
  @Prop() public categoryId!: number;
  @Prop() public activeCategoryId!: number;
  public cardTitle?: string = '';
  public isExpanded: boolean = false;

  @Emit('selected')
  public onSelected(isExpanded: boolean) {
    this.isExpanded = isExpanded;
  }

  @Watch('activeCategoryId')
  public async onActiveCategoryChanged(value: |number) {
    this.isExpanded = value === this.categoryId;
  }

  public async mounted() {
    this.cardTitle = this.categoryId ? await this.getCardTitleAsync(this.categoryId) : undefined;
  }

  @Watch('categoryId')
  public async onCategoryIdChanged(value: |number) {
    this.cardTitle = value ? await this.getCardTitleAsync(value) : undefined;
  }

  private async getCardTitleAsync(categoryId: number): Promise<string | undefined> {
      const state = await this.getCurrentStateAsync();
      const category = state.app.findCategory(this.categoryId);
      return category ? category.name : undefined;
  }
}
</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";

$big-screen-width: 991px;
$medium-screen-width: 767px;
$small-screen-width: 380px;

.card {
  margin: 15px; 
  width: calc((100% / 3) - 30px);
  transition: all 0.2s ease-in-out;

  // Media queries for stacking cards
  @media screen and (max-width: $big-screen-width) {  width: calc((100% / 2) - 30px); }
  @media screen and (max-width: $medium-screen-width) {  width: 100%; }
  @media screen and (max-width: $small-screen-width) {  width: 90%; }

  &__inner {  
    padding: 30px;
    position: relative;
    cursor: pointer;
    background-color: $gray;
    color: $light-gray;
    font-size: 1.5em;
    text-transform: uppercase;
    text-align: center;
    transition: all 0.2s ease-in-out;

    &:hover {
      background-color: $accent;
      transform: scale(1.05);
    }
    &:after {
      transition: all 0.3s ease-in-out;
    }
  
    &__expand-icon {
      width: 100%;
      margin-top: .25em;
    }
  }

  &__expander {
    transition: all 0.2s ease-in-out;
    position: relative;
    background-color: $slate;
    color: $light-gray;
    display: flex;
    align-items: center;

    &__content {
      width: 100%;
      display: flex;
      justify-content: center;
      word-break: break-word;
    }
    
    &__close-button {
      width: auto;
      font-size: 1.5em;
      align-self: flex-start;
      margin-right:0.25em;
      cursor: pointer;
      &:hover {
        opacity: 0.9;
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
      background-color: $accent;
      &:after{
        content: "";
        display: block;
        position: absolute;
        bottom: -30px;
        left: calc(50% - 15px);
        border-left: 15px solid transparent;
        border-right: 15px solid transparent;
        border-bottom: 15px solid #333a45;
      }
    }

    .card__expander {
      min-height: 200px;
      // max-height: 1000px;
      // overflow-y: auto;
      margin-top: 30px;
      opacity: 1;
    }

    &:hover {
      .card__inner {
        transform: scale(1);
      }
    }
  }
  
  &.is-inactive {
    .card__inner {
      pointer-events: none;
      opacity: 0.5;
    }
    
    &:hover {
      .card__inner {
        background-color: $gray;
        transform: scale(1);
      }
    }
  }
}

@media screen and (min-width: $big-screen-width) { // when 3 cards in a row
  .card:nth-of-type(3n+2) .card__expander {
    margin-left: calc(-100% - 30px);
  }
  .card:nth-of-type(3n+3) .card__expander {
    margin-left: calc(-200% - 60px);
  }
  .card:nth-of-type(3n+4) {
    clear: left;
  }
  .card__expander {
    width: calc(300% + 60px);
  }
}

@media screen and (min-width: $medium-screen-width) and (max-width: $big-screen-width) { // when 2 cards in a row
  .card:nth-of-type(2n+2) .card__expander {
    margin-left: calc(-100% - 30px);
  }
  .card:nth-of-type(2n+3) {
    clear: left;
  }
  .card__expander {
    width: calc(200% + 30px);
  }
}
</style>