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
import ScriptsTree from '@/presentation/components/Scripts/ScriptsTree/ScriptsTree.vue';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';

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

  public async mounted() {
    const context = await this.getCurrentContextAsync();
    this.events.register(context.state.selection.changed.on(
      () => this.updateSelectionIndicatorsAsync(this.categoryId)));
    await this.updateStateAsync(this.categoryId);
  }
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
  @Watch('categoryId')
  public async updateStateAsync(value: |number) {
    const context = await this.getCurrentContextAsync();
    const category = !value ? undefined : context.state.collection.findCategory(value);
    this.cardTitle = category ? category.name : undefined;
    await this.updateSelectionIndicatorsAsync(value);
  }

  protected handleCollectionState(): void {
    return;
  }

  private async updateSelectionIndicatorsAsync(categoryId: number) {
    const context = await this.getCurrentContextAsync();
    const selection = context.state.selection;
    const category = context.state.collection.findCategory(categoryId);
    this.isAnyChildSelected = category ? selection.isAnySelected(category) : false;
    this.areAllChildrenSelected = category ? selection.areAllSelected(category) : false;
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
  transition: all 0.2s ease-in-out;

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
@mixin adaptive-card($cards-in-row) {
  &.card {
    width: calc((100% / #{$cards-in-row}) - #{$card-line-break-width});
    @for $nth-card from 2 through $cards-in-row {
      &:nth-of-type(#{$cards-in-row}n+#{$nth-card}) {
        .card__expander {
          $card-left: -100% * ($nth-card - 1);
          $additional-space: $card-line-break-width * ($nth-card - 1);
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
  .card__expander {
    $all-cards-width: 100% * $cards-in-row;
    $card-padding: $card-line-break-width * ($cards-in-row - 1);
    width: calc(#{$all-cards-width} + #{$card-padding});
  }
}

.big-screen     {   @include adaptive-card(3);  }
.medium-screen  {   @include adaptive-card(2);  }
.small-screen   {   @include adaptive-card(1);  }
</style>