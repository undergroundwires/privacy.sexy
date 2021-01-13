<template>
    <span id="container">
        <span v-if="nodes != null && nodes.length > 0">
            <SelectableTree 
                :initialNodes="nodes"
                :selectedNodeIds="selectedNodeIds"
                :filterPredicate="filterPredicate"
                :filterText="filterText"
                v-on:nodeSelected="toggleNodeSelectionAsync($event)"
                >
            </SelectableTree>
        </span>
        <span v-else>Nooo 😢</span>
    </span>
</template>

<script lang="ts">
import { Component, Prop, Watch } from 'vue-property-decorator';
import { StatefulVue } from '@/presentation/StatefulVue';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { ICategoryCollectionState } from '@/application/Context/State/ICategoryCollectionState';
import { IFilterResult } from '@/application/Context/State/Filter/IFilterResult';
import {  parseAllCategories, parseSingleCategory, getScriptNodeId,
          getCategoryNodeId, getCategoryId, getScriptId } from './ScriptNodeParser';
import SelectableTree from './SelectableTree/SelectableTree.vue';
import { INode, NodeType } from './SelectableTree/Node/INode';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { INodeSelectedEvent } from './SelectableTree/INodeSelectedEvent';
import { IApplication } from '@/domain/IApplication';
import { IEventSubscription } from '@/infrastructure/Events/ISubscription';

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
  private listeners = new Array<IEventSubscription>();

  public async toggleNodeSelectionAsync(event: INodeSelectedEvent) {
      const context = await this.getCurrentContextAsync();
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
  public async setNodesAsync(categoryId?: number) {
    const context = await this.getCurrentContextAsync();
    if (categoryId) {
      this.nodes = parseSingleCategory(categoryId, context.state.collection);
    } else {
      this.nodes = parseAllCategories(context.state.collection);
    }
    this.selectedNodeIds = context.state.selection.selectedScripts
      .map((selected) => getScriptNodeId(selected.script));
  }
  public filterPredicate(node: INode): boolean {
    return this.filtered.scriptMatches.some(
      (script: IScript) => node.id === getScriptNodeId(script))
      || this.filtered.categoryMatches.some(
        (category: ICategory) => node.id === getCategoryNodeId(category));
  }
  public destroyed() {
    this.unsubscribeAll();
  }

  protected initialize(app: IApplication): void {
    return;
  }
  protected async handleCollectionState(newState: ICategoryCollectionState) {
    this.setCurrentFilter(newState.filter.currentFilter);
    if (!this.categoryId) {
      this.nodes = parseAllCategories(newState.collection);
    }
    this.unsubscribeAll();
    this.subscribe(newState);
  }

  private subscribe(state: ICategoryCollectionState) {
    this.listeners.push(state.selection.changed.on(this.handleSelectionChanged));
    this.listeners.push(state.filter.filterRemoved.on(this.handleFilterRemoved));
    this.listeners.push(state.filter.filtered.on(this.handleFiltered));
  }
  private unsubscribeAll() {
    this.listeners.forEach((listener) => listener.unsubscribe());
    this.listeners.splice(0, this.listeners.length);
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

function toggleCategoryNodeSelection(event: INodeSelectedEvent, state: ICategoryCollectionState): void {
  const categoryId = getCategoryId(event.node.id);
  if (event.isSelected) {
    state.selection.addOrUpdateAllInCategory(categoryId, false);
  } else {
    state.selection.removeAllInCategory(categoryId);
  }
}
function toggleScriptNodeSelection(event: INodeSelectedEvent, state: ICategoryCollectionState): void {
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
