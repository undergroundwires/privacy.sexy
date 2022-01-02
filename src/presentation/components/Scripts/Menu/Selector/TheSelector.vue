<template>
  <MenuOptionList label="Select">
    <MenuOptionListItem
      label="None"
      :enabled="this.currentSelection !== SelectionType.None"
      @click="selectType(SelectionType.None)"
      v-tooltip=" 'Deselect all selected scripts.<br/>' +
                  '💡 Good start to dive deeper into tweaks and select only what you want.'"
      />
    <MenuOptionListItem
      label="Standard"
      :enabled="this.currentSelection !== SelectionType.Standard"
      @click="selectType(SelectionType.Standard)"
      v-tooltip=" '🛡️ Balanced for privacy and functionality.<br/>' +
                  'OS and applications will function normally.<br/>' +
                  '💡 Recommended for everyone'"
      />
    <MenuOptionListItem
      label="Strict"
      :enabled="this.currentSelection !== SelectionType.Strict"
      @click="selectType(SelectionType.Strict)"
      v-tooltip=" '🚫 Stronger privacy, disables risky functions that may leak your data.<br/>' +
        + '⚠️ Double check to remove scripts where you would trade functionality for privacy<br/>'
        + '💡 Recommended for daily users that prefers more privacy over non-essential functions'"
      />
    <MenuOptionListItem
        label="All"
        :enabled="this.currentSelection !== SelectionType.All"
        @click="selectType(SelectionType.All)"
        v-tooltip=" '🔒 Strongest privacy, disabling any functionality that may leak your data.<br/>'
          + '🛑 Not designed for daily users, it will break important functionalities.<br/>'
          + '💡 Only recommended for extreme use-cases like crime labs where no leak is acceptable'"
    />
  </MenuOptionList>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import MenuOptionList from '../MenuOptionList.vue';
import MenuOptionListItem from '../MenuOptionListItem.vue';
import { SelectionType, SelectionTypeHandler } from './SelectionTypeHandler';

@Component({
  components: {
    MenuOptionList,
    MenuOptionListItem,
  },
})
export default class TheSelector extends StatefulVue {
  public SelectionType = SelectionType;

  public currentSelection = SelectionType.None;

  private selectionTypeHandler: SelectionTypeHandler;

  public async selectType(type: SelectionType) {
    if (this.currentSelection === type) {
      return;
    }
    this.selectionTypeHandler.selectType(type);
  }

  protected handleCollectionState(newState: ICategoryCollectionState): void {
    this.events.unsubscribeAll();
    this.selectionTypeHandler = new SelectionTypeHandler(newState);
    this.updateSelections();
    this.events.register(newState.selection.changed.on(() => this.updateSelections()));
  }

  private updateSelections() {
    this.currentSelection = this.selectionTypeHandler.getCurrentSelectionType();
  }
}

</script>

<style scoped lang="scss">

</style>
