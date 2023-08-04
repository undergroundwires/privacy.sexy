<template>
  <span id="container">
    <span v-if="nodes != null && nodes.length > 0">
      <SelectableTree
        :initialNodes="nodes"
        :selectedNodeIds="selectedNodeIds"
        :filterPredicate="filterPredicate"
        :filterText="filterText"
        v-on:nodeSelected="toggleNodeSelection($event)"
      />
    </span>
    <span v-else>Nooo 😢</span>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/components/Shared/StatefulVue';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import {
  parseAllCategories, parseSingleCategory, getScriptNodeId, getCategoryNodeId, getCategoryId,
  getScriptId,
} from './ScriptNodeParser';
import SelectableTree from './SelectableTree/SelectableTree.vue';
import { INode, NodeType } from './SelectableTree/Node/INode';
import { INodeSelectedEvent } from './SelectableTree/INodeSelectedEvent';

@Component({
  components: {
    SelectableTree,
  },
})
export default class ScriptsTree extends StatefulVue {
  @Prop() public categoryId?: number;

  public nodes?: ReadonlyArray<INode> = null;

  public selectedNodeIds?: ReadonlyArray<string> = [];

  public filterText?: string = null;

  private filtered?: IFilterResult;

  public async toggleNodeSelection(event: INodeSelectedEvent) {
    const context = await this.getCurrentContext();
    switch (event.node.type) {
      case NodeType.Category:
        toggleCategoryNodeSelection(event, context.state);
        break;
      case NodeType.Script:
        toggleScriptNodeSelection(event, context.state);
        break;
      default:
        throw new Error(`Unknown node type: ${event.node.id}`);
    }
  }

  @Watch('categoryId', { immediate: true })
  public async setNodes(categoryId?: number) {
    const context = await this.getCurrentContext();
    if (categoryId) {
      this.nodes = parseSingleCategory(categoryId, context.state.collection);
    } else {
      this.nodes = parseAllCategories(context.state.collection);
    }
    this.selectedNodeIds = context.state.selection.selectedScripts
      .map((selected) => getScriptNodeId(selected.script));
  }

  public filterPredicate(node: INode): boolean {
    return this.filtered.scriptMatches
      .some((script: IScript) => node.id === getScriptNodeId(script))
      || this.filtered.categoryMatches
        .some((category: ICategory) => node.id === getCategoryNodeId(category));
  }

  protected async handleCollectionState(newState: ICategoryCollectionState) {
    this.setCurrentFilter(newState.filter.currentFilter);
    if (!this.categoryId) {
      this.nodes = parseAllCategories(newState.collection);
    }
    this.events.unsubscribeAll();
    this.subscribeState(newState);
  }

  private subscribeState(state: ICategoryCollectionState) {
    this.events.register(
      state.selection.changed.on(this.handleSelectionChanged),
      state.filter.filterRemoved.on(this.handleFilterRemoved),
      state.filter.filtered.on(this.handleFiltered),
    );
  }

  private setCurrentFilter(currentFilter: IFilterResult | undefined) {
    if (!currentFilter) {
      this.handleFilterRemoved();
    } else {
      this.handleFiltered(currentFilter);
    }
  }

  private handleSelectionChanged(selectedScripts: ReadonlyArray<SelectedScript>): void {
    this.selectedNodeIds = selectedScripts
      .map((node) => node.id);
  }

  private handleFilterRemoved() {
    this.filterText = '';
  }

  private handleFiltered(result: IFilterResult) {
    this.filterText = result.query;
    this.filtered = result;
  }
}

function toggleCategoryNodeSelection(
  event: INodeSelectedEvent,
  state: ICategoryCollectionState,
): void {
  const categoryId = getCategoryId(event.node.id);
  if (event.isSelected) {
    state.selection.addOrUpdateAllInCategory(categoryId, false);
  } else {
    state.selection.removeAllInCategory(categoryId);
  }
}

function toggleScriptNodeSelection(
  event: INodeSelectedEvent,
  state: ICategoryCollectionState,
): void {
  const scriptId = getScriptId(event.node.id);
  const actualToggleState = state.selection.isSelected(scriptId);
  const targetToggleState = event.isSelected;
  if (targetToggleState && !actualToggleState) {
    state.selection.addSelectedScript(scriptId, false);
  } else if (!targetToggleState && actualToggleState) {
    state.selection.removeSelectedScript(scriptId);
  }
}
</script>

<style scoped lang="scss">

</style>
