<template>
  <MenuOptionList
    label="View"
    class="part">
    <MenuOptionListItem
      v-for="view in this.viewOptions" :key="view.type"
      :label="view.displayName"
      :enabled="currentView !== view.type"
      @click="setView(view.type)"
    />
  </MenuOptionList>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import { ViewType } from './ViewType';

const DefaultView = ViewType.Cards;

@Component({
  components: {
    MenuOptionList,
    MenuOptionListItem,
  },
})
export default class TheViewChanger extends Vue {
  public readonly viewOptions: IViewOption[] = [
    { type: ViewType.Cards, displayName: 'Cards' },
    { type: ViewType.Tree, displayName: 'Tree' },
  ];

  public ViewType = ViewType;

  public currentView?: ViewType = null;

  public mounted() {
    this.setView(DefaultView);
  }

  public groupBy(type: ViewType) {
    this.setView(type);
  }

  private setView(view: ViewType) {
    if (this.currentView === view) {
      throw new Error(`View is already "${ViewType[view]}"`);
    }
    this.currentView = view;
    this.$emit('viewChanged', this.currentView);
  }
}

interface IViewOption {
  readonly type: ViewType;
  readonly displayName: string;
}

</script>

<style scoped lang="scss">

</style>
