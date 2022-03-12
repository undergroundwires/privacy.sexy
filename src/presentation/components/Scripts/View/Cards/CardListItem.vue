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
        <font-awesome-icon
          class="card__inner__expand-icon"
          :icon="['far', isExpanded ? 'folder-open' : 'folder']"
        />
        <!-- Indeterminate and full states -->
        <div class="card__inner__state-icons">
          <font-awesome-icon
            :icon="['fa', 'battery-half']"
            v-if="isAnyChildSelected && !areAllChildrenSelected"
          />
          <font-awesome-icon
            :icon="['fa', 'battery-full']"
            v-if="areAllChildrenSelected"
          />
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
import {
  Component, Prop, Watch, Emit,
} from 'vue-property-decorator';
import ScriptsTree from '@/presentation/components/Scripts/View/ScriptsTree/ScriptsTree.vue';
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
    const context = await this.getCurrentContext();
    this.events.register(context.state.selection.changed.on(
      () => this.updateSelectionIndicators(this.categoryId),
    ));
    await this.updateState(this.categoryId);
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
  public async onExpansionChanged(newValue: number, oldValue: number) {
    if (!oldValue && newValue) {
      await new Promise((resolve) => { setTimeout(resolve, 400); });
      const focusElement = this.$refs.cardElement as HTMLElement;
      focusElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  @Watch('categoryId')
  public async updateState(value: |number) {
    const context = await this.getCurrentContext();
    const category = !value ? undefined : context.state.collection.findCategory(value);
    this.cardTitle = category ? category.name : undefined;
    await this.updateSelectionIndicators(value);
  }

  protected handleCollectionState(): void { /* do nothing */ }

  private async updateSelectionIndicators(categoryId: number) {
    const context = await this.getCurrentContext();
    const { selection } = context.state;
    const category = context.state.collection.findCategory(categoryId);
    this.isAnyChildSelected = category ? selection.isAnySelected(category) : false;
    this.areAllChildrenSelected = category ? selection.areAllSelected(category) : false;
  }
}

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
    cursor: pointer;
    background-color: $color-primary;
    color: $color-on-primary;
    font-size: 1.5em;
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

    &__state-icons {
      height: $card-inner-padding;
      margin-right: -$card-inner-padding;
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
    background-color: $color-primary-darker;
    color: $color-on-primary;
    display: flex;
    align-items: center;

    &__content {
      flex: 1;
      display: flex;
      justify-content: center;
      word-break: break-word;
    }

    &__close-button {
      width: auto;
      font-size: 1.5em;
      align-self: flex-start;
      margin-right: 0.25em;
      cursor: pointer;
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
      min-height: 200px;
      // max-height: 1000px;
      // overflow-y: auto;
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
