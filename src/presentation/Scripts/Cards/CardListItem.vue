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
        <font-awesome-icon :icon="['far', isExpanded ? 'folder-open' : 'folder']" class="expand-button"  />
      </div>
      <div class="card__expander" v-on:click.stop>
          <font-awesome-icon :icon="['fas', 'times']"  class="close-button" v-on:click="onSelected(false)"/>
          <ScriptsTree :categoryId="categoryId"></ScriptsTree>
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

.card {
  margin: 15px; 
  width: calc((100% / 3) - 30px);
  transition: all 0.2s ease-in-out;

  //media queries for stacking cards
  @media screen and (max-width: 991px) {
    width: calc((100% / 2) - 30px);
  }

  @media screen and (max-width: 767px) {
    width: 100%;
  }
  
  @media screen and (max-width: 380px) {
    width: 90%;
  }

  &:hover {
    .card__inner {
      background-color: $accent;
      transform: scale(1.05);
    }
  }

  &__inner {
    width: 100%;
    padding: 30px;
    position: relative;
    cursor: pointer;
    
    background-color: $gray;
    color: $light-gray;
    font-size: 1.5em;
    text-transform: uppercase;
    text-align: center;

    transition: all 0.2s ease-in-out;
    
    &:after {
      transition: all 0.3s ease-in-out;
    }
    
    .expand-button {
      width: 100%;
      margin-top: .25em;
    }
  }

  //Expander
  &__expander {
    transition: all 0.2s ease-in-out;
    background-color: $slate;
    width: 100%;
    position: relative;
    
    display: flex;
    justify-content: center;
    align-items: center;
    
    .close-button {
      font-size: 0.75em;
      position: absolute;
      top: 10px;
      right: 10px;
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
      margin-top: 0;
      opacity: 0;
    }
  }

  &.is-expanded {

    .card__inner {
      background-color: $accent;
      
      &:after{
        content: "";
        opacity: 1;
        display: block;
        height: 0;
        width: 0;
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


//Expander Widths

//when 3 cards in a row
@media screen and (min-width: 992px) {

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

//when 2 cards in a row
@media screen and (min-width: 768px) and (max-width: 991px) {

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