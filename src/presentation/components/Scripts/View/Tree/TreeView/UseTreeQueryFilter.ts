import { type Ref, watch } from 'vue';
import { TreeViewFilterAction, TreeViewFilterEvent, TreeViewFilterPredicate } from './Bindings/TreeInputFilterEvent';
import { ReadOnlyTreeNode, TreeNode } from './Node/TreeNode';
import { TreeRoot } from './TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from './UseCurrentTreeNodes';
import { QueryableNodes, ReadOnlyQueryableNodes } from './TreeRoot/NodeCollection/Query/QueryableNodes';
import { TreeNodeStateTransaction } from './Node/State/StateAccess';
import { TreeNodeStateDescriptor } from './Node/State/StateDescriptor';

export function useTreeQueryFilter(
  latestFilterEventRef: Readonly<Ref<TreeViewFilterEvent | undefined>>,
  treeRootRef: Readonly<Ref<TreeRoot>>,
) {
  const { nodes } = useCurrentTreeNodes(treeRootRef);

  let isFiltering = false;
  const statesBeforeFiltering = new NodeStateRestorer();
  statesBeforeFiltering.saveStateBeforeFilter(nodes.value);

  setupWatchers({
    filterEventRef: latestFilterEventRef,
    nodesRef: nodes,
    onFilterTrigger: (predicate, newNodes) => runFilter(
      newNodes,
      predicate,
    ),
    onFilterReset: () => resetFilter(nodes.value),
  });

  function resetFilter(currentNodes: QueryableNodes) {
    if (!isFiltering) {
      return;
    }
    isFiltering = false;
    currentNodes.flattenedNodes.forEach((node: TreeNode) => {
      let transaction = node.state.beginTransaction()
        .withMatchState(false);
      transaction = statesBeforeFiltering.applyOriginalState(node, transaction);
      node.state.commitTransaction(transaction);
    });
    statesBeforeFiltering.clear();
  }

  function runFilter(currentNodes: QueryableNodes, predicate: TreeViewFilterPredicate) {
    if (!isFiltering) {
      statesBeforeFiltering.saveStateBeforeFilter(currentNodes);
      isFiltering = true;
    }
    const { matchedNodes, unmatchedNodes } = partitionNodesByMatchCriteria(currentNodes, predicate);
    const nodeTransactions = getNodeChangeTransactions(matchedNodes, unmatchedNodes);

    nodeTransactions.forEach((transaction, node) => {
      node.state.commitTransaction(transaction);
    });
  }
}

function getNodeChangeTransactions(
  matchedNodes: Iterable<TreeNode>,
  unmatchedNodes: Iterable<TreeNode>,
) {
  const transactions = new Map<TreeNode, TreeNodeStateTransaction>();

  for (const unmatchedNode of unmatchedNodes) {
    addOrUpdateTransaction(unmatchedNode, (builder) => builder
      .withVisibilityState(false)
      .withMatchState(false));
  }

  for (const matchedNode of matchedNodes) {
    addOrUpdateTransaction(matchedNode, (builder) => {
      let transaction = builder
        .withVisibilityState(true)
        .withMatchState(true);
      if (matchedNode.hierarchy.isBranchNode) {
        transaction = transaction.withExpansionState(false);
      }
      return transaction;
    });

    traverseAllChildren(matchedNode, (childNode) => {
      addOrUpdateTransaction(childNode, (builder) => builder
        .withVisibilityState(true));
    });

    traverseAllParents(matchedNode, (parentNode) => {
      addOrUpdateTransaction(parentNode, (builder) => builder
        .withVisibilityState(true)
        .withExpansionState(true));
    });
  }

  function addOrUpdateTransaction(
    node: TreeNode,
    builder: (transaction: TreeNodeStateTransaction) => TreeNodeStateTransaction,
  ) {
    let transaction = transactions.get(node) ?? node.state.beginTransaction();
    transaction = builder(transaction);
    transactions.set(node, transaction);
  }

  return transactions;
}

function partitionNodesByMatchCriteria(
  currentNodes: QueryableNodes,
  predicate: TreeViewFilterPredicate,
) {
  const matchedNodes = new Set<TreeNode>();
  const unmatchedNodes = new Set<TreeNode>();
  currentNodes.flattenedNodes.forEach((node) => {
    if (predicate(node)) {
      matchedNodes.add(node);
    } else {
      unmatchedNodes.add(node);
    }
  });
  return {
    matchedNodes,
    unmatchedNodes,
  };
}

function traverseAllParents(node: TreeNode, handler: (node: TreeNode) => void) {
  const parentNode = node.hierarchy.parent;
  if (parentNode) {
    handler(parentNode);
    traverseAllParents(parentNode, handler);
  }
}

function traverseAllChildren(node: TreeNode, handler: (node: TreeNode) => void) {
  node.hierarchy.children.forEach((childNode) => {
    handler(childNode);
    traverseAllChildren(childNode, handler);
  });
}

class NodeStateRestorer {
  private readonly originalStates = new Map<ReadOnlyTreeNode, Partial<TreeNodeStateDescriptor>>();

  public saveStateBeforeFilter(nodes: ReadOnlyQueryableNodes) {
    nodes
      .flattenedNodes
      .forEach((node) => {
        this.originalStates.set(node, {
          isExpanded: node.state.current.isExpanded,
          isVisible: node.state.current.isVisible,
        });
      });
  }

  public applyOriginalState(
    node: TreeNode,
    transaction: TreeNodeStateTransaction,
  ): TreeNodeStateTransaction {
    if (!this.originalStates.has(node)) {
      return transaction;
    }
    const originalState = this.originalStates.get(node);
    if (originalState.isExpanded !== undefined) {
      transaction = transaction.withExpansionState(originalState.isExpanded);
    }
    transaction = transaction.withVisibilityState(originalState.isVisible);
    return transaction;
  }

  public clear() {
    this.originalStates.clear();
  }
}

function setupWatchers(options: {
  readonly filterEventRef: Readonly<Ref<TreeViewFilterEvent | undefined>>,
  readonly nodesRef: Readonly<Ref<QueryableNodes>>,
  readonly onFilterReset: () => void,
  readonly onFilterTrigger: (
    predicate: TreeViewFilterPredicate,
    nodes: QueryableNodes,
  ) => void,
}) {
  watch(
    [
      options.filterEventRef,
      options.nodesRef,
    ],
    ([filterEvent, nodes]) => {
      if (!filterEvent) {
        return;
      }
      switch (filterEvent.action) {
        case TreeViewFilterAction.Triggered:
          options.onFilterTrigger(filterEvent.predicate, nodes);
          break;
        case TreeViewFilterAction.Removed:
          options.onFilterReset();
          break;
        default:
          throw new Error(`Unknown action: ${TreeViewFilterAction[filterEvent.action]}`);
      }
    },
    { immediate: true },
  );
}
