<template>
    <div class="card"
          v-on:click="onSelected(!isExpanded)"
          v-bind:class="{ 
                    'is-collapsed': !isExpanded,
                    'is-inactive': activeCategoryId && activeCategoryId != categoryId,
                    'is-expanded': isExpanded
                    }"
          ref="cardElement">
        <div class="card__inner">
          <span v-if="cardTitle && cardTitle.length > 0">
            <span>{{cardTitle}}</span>
          </span>
          <span v-else>Oh no 😢</span>
          <!-- Expand icon -->
          <font-awesome-icon :icon="['far', isExpanded ? 'folder-open' : 'folder']" class="card__inner__expand-icon" />
          <!-- Indeterminate and full states -->
          <div class="card__inner__state-icons">
            <font-awesome-icon v-if="isAnyChildSelected && !areAllChildrenSelected" :icon="['fa', 'battery-half']" />
            <font-awesome-icon v-if="areAllChildrenSelected" :icon="['fa', 'battery-full']" />
          </div>
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
import { Component, Prop, Watch, Emit } from 'vue-property-decorator';
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
  public cardTitle = '';
  public isExpanded = false;
  public isAnyChildSelected = false;
  public areAllChildrenSelected = false;

@Emit('selected')
  public onSelected(isExpanded: boolean) {
    this.isExpanded = isExpanded;
  }

  @Watch('activeCategoryId')
  public async onActiveCategoryChanged(value: |number) {
    this.isExpanded = value === this.categoryId;
  }

  @Watch('isExpanded')
  public async onExpansionChangedAsync(newValue: number, oldValue: number) {
    if (!oldValue && newValue) {
      await new Promise((r) => setTimeout(r, 400));
      const focusElement = this.$refs.cardElement as HTMLElement;
      (focusElement as HTMLElement).scrollIntoView({behavior: 'smooth'});
    }
  }

  public async mounted() {
    const context = await this.getCurrentContextAsync();
    context.state.selection.changed.on(() => {
      this.updateStateAsync(this.categoryId);
    });
    this.updateStateAsync(this.categoryId);
  }

  @Watch('categoryId')
  public async updateStateAsync(value: |number) {
    const context = await this.getCurrentContextAsync();
    const category = !value ? undefined : context.app.findCategory(this.categoryId);
    this.cardTitle = category ? category.name : undefined;
    const currentSelection = context.state.selection;
    this.isAnyChildSelected = category ? currentSelection.isAnySelected(category) : false;
    this.areAllChildrenSelected = category ? currentSelection.areAllSelected(category) : false;
  }
}

</script>

<style scoped lang="scss">
@import "@/presentation/styles/colors.scss";
@import "@/presentation/styles/media.scss";

$card-padding: 30px;
$card-margin: 15px;
$card-line-break-width: 30px;
$arrow-size: 15px;
$expanded-margin-top: 30px;

.card {
  margin: 15px; 
  width: calc((100% / 3) - #{$card-line-break-width});
  transition: all 0.2s ease-in-out;
  // Media queries for stacking cards
  @media screen and (max-width: $big-screen-width) {  width: calc((100% / 2) - #{$card-line-break-width}); }
  @media screen and (max-width: $medium-screen-width) {  width: 100%; }
  @media screen and (max-width: $small-screen-width) {  width: 90%; }

  &__inner {  
    padding: $card-padding $card-padding 0 $card-padding;
    position: relative;
    cursor: pointer;
    background-color: $gray;
    color: $light-gray;
    font-size: 1.5em;
    height: 100%;
    text-transform: uppercase;
    text-align: center;
    transition: all 0.2s ease-in-out;

    display:flex;
    flex-direction: column;
    justify-content: center;

    &:hover {
      background-color: $accent;
      transform: scale(1.05);
    }
    &:after {
      transition: all 0.3s ease-in-out;
    }

    &__state-icons {
      height: $card-padding;
      margin-right: -$card-padding;
      padding-right: 10px;
      display: flex;
      justify-content: flex-end;
    }
  
    &__expand-icon {
      width: 100%;
      margin-top: .25em;
      vertical-align: middle;
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
      height: auto;
      background-color: $accent;
      &:after { // arrow
        content: "";
        display: block;
        position: absolute;
        bottom: calc(-1 * #{$expanded-margin-top});
        left: calc(50% - #{$arrow-size});
        border-left: #{$arrow-size} solid transparent;
        border-right: #{$arrow-size} solid transparent;
        border-bottom: #{$arrow-size} solid #333a45;
      }
    }

    .card__expander {
      min-height: 200px;
      // max-height: 1000px;
      // overflow-y: auto;
      margin-top: $expanded-margin-top;
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
      height: auto;
      opacity: 0.5;
      transform: scale(0.95);
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
    margin-left: calc(-100% - #{$card-line-break-width});
  }
  .card:nth-of-type(3n+3) .card__expander {
    margin-left: calc(-200% - (#{$card-line-break-width} * 2));
  }
  .card:nth-of-type(3n+4) {
    clear: left;
  }
  .card__expander {
    width: calc(300% + (#{$card-line-break-width} * 2));
  }
}

@media screen and (min-width: $medium-screen-width) and (max-width: $big-screen-width) { // when 2 cards in a row
  .card:nth-of-type(2n+2) .card__expander {
    margin-left: calc(-100% - #{$card-line-break-width});
  }
  .card:nth-of-type(2n+3) {
    clear: left;
  }
  .card__expander {
    width: calc(200% + #{$card-line-break-width});
  }
}
</style>