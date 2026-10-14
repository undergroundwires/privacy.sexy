import { type Ref } from 'vue';
import { useAutoUnsubscribedEventListener, type UseEventListener } from '@/presentation/components/Shared/Hooks/UseAutoUnsubscribedEventListener';
import { TreeNodeCheckState } from './Node/State/CheckState';
import type { TreeNode } from './Node/TreeNode';
import type { TreeRoot } from './TreeRoot/TreeRoot';
import type { SingleNodeFocusManager } from './TreeRoot/Focus/SingleNodeFocusManager';
import type { QueryableNodes } from './TreeRoot/NodeCollection/Query/QueryableNodes';

type TreeNavigationKeyCodes = 'ArrowLeft' | 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | ' ' | 'Enter';

export function useTreeKeyboardNavigation(
  treeRootRef: Readonly<Ref<TreeRoot>>,
  treeElementRef: Readonly<Ref<HTMLElement | undefined>>,
  useEventListener: UseEventListener = useAutoUnsubscribedEventListener,
) {
  const { startListening } = useEventListener();
  startListening(treeElementRef, 'keydown', (event) => {
    if (!treeElementRef.value) {
      return; // Not yet initialized?
    }

    const treeRoot = treeRootRef.value;

    const keyCode = event.key as TreeNavigationKeyCodes;

    if (!treeRoot.focus.currentSingleFocusedNode) {
      return;
    }

    const action = KeyToActionMapping[keyCode];

    if (!action) {
      return;
    }

    event.preventDefault();

    action({
      focus: treeRoot.focus,
      renderedNodes: getRenderedNodes(
        treeElementRef.value,
        treeRoot.collection.nodes,
      ),
    });
  });
}

interface TreeNavigationContext {
  readonly focus: SingleNodeFocusManager;
  readonly renderedNodes: readonly TreeNode[];
}

const KeyToActionMapping: Record<
  TreeNavigationKeyCodes,
  (context: TreeNavigationContext) => void
> = {
  ArrowLeft: collapseNodeOrFocusParent,
  ArrowUp: focusPreviousVisibleNode,
  ArrowRight: expandNodeOrFocusFirstChild,
  ArrowDown: focusNextVisibleNode,
  ' ': toggleTreeNodeCheckStatus,
  Enter: toggleTreeNodeCheckStatus,
};

function focusPreviousVisibleNode(context: TreeNavigationContext): void {
  const focusedNode = context.focus.currentSingleFocusedNode;
  if (!focusedNode) {
    return;
  }
  const previousVisibleNode = findPreviousVisibleNode(
    focusedNode,
    context.renderedNodes,
  );
  if (!previousVisibleNode) {
    return;
  }
  context.focus.setSingleFocus(previousVisibleNode);
}

function focusNextVisibleNode(context: TreeNavigationContext): void {
  const focusedNode = context.focus.currentSingleFocusedNode;
  if (!focusedNode) {
    return;
  }
  const nextVisibleNode = findNextVisibleNode(focusedNode, context.renderedNodes);
  if (!nextVisibleNode) {
    return;
  }
  context.focus.setSingleFocus(nextVisibleNode);
}

function toggleTreeNodeCheckStatus(context: TreeNavigationContext): void {
  const focusedNode = context.focus.currentSingleFocusedNode;
  if (!focusedNode) {
    return;
  }
  const nodeState = focusedNode.state;
  let transaction = nodeState.beginTransaction();
  if (nodeState.current.checkState === TreeNodeCheckState.Checked) {
    transaction = transaction.withCheckState(TreeNodeCheckState.Unchecked);
  } else {
    transaction = transaction.withCheckState(TreeNodeCheckState.Checked);
  }
  nodeState.commitTransaction(transaction);
}

function collapseNodeOrFocusParent(context: TreeNavigationContext): void {
  const focusedNode = context.focus.currentSingleFocusedNode;
  if (!focusedNode) {
    return;
  }
  const nodeState = focusedNode.state;
  if (focusedNode.hierarchy.isBranchNode && nodeState.current.isExpanded) {
    nodeState.commitTransaction(
      nodeState.beginTransaction().withExpansionState(false),
    );
  } else {
    const parentNode = focusedNode.hierarchy.parent;
    if (!parentNode) {
      return;
    }
    context.focus.setSingleFocus(parentNode);
  }
}

function expandNodeOrFocusFirstChild(context: TreeNavigationContext): void {
  const focusedNode = context.focus.currentSingleFocusedNode;
  if (!focusedNode) {
    return;
  }
  const nodeState = focusedNode.state;
  if (focusedNode.hierarchy.isBranchNode && !nodeState.current.isExpanded) {
    nodeState.commitTransaction(
      nodeState.beginTransaction().withExpansionState(true),
    );
    return;
  }
  const firstChildNode = context.renderedNodes.find(
    (node) => node.hierarchy.parent === focusedNode,
  );
  if (firstChildNode) {
    context.focus.setSingleFocus(firstChildNode);
  }
}

function findNextVisibleNode(
  node: TreeNode,
  renderedNodes: readonly TreeNode[],
): TreeNode | undefined {
  const index = renderedNodes.indexOf(node);
  return renderedNodes[index + 1];
}

function findPreviousVisibleNode(
  node: TreeNode,
  renderedNodes: readonly TreeNode[],
): TreeNode | undefined {
  const index = renderedNodes.indexOf(node);
  return renderedNodes[index - 1];
}

function getRenderedNodes(
  treeElement: HTMLElement,
  nodes: QueryableNodes,
): readonly TreeNode[] {
  return Array
    .from(treeElement.querySelectorAll<HTMLElement>('[data-tree-node-id]'))
    .map((nodeElement) => nodeElement.dataset.treeNodeId)
    .filter((nodeId): nodeId is string => nodeId !== undefined)
    .map((nodeId) => nodes.getNodeById(nodeId))
    .filter((node) => {
      if (!node.state.current.isVisible) {
        return false;
      }
      for (let { parent } = node.hierarchy; parent; parent = parent.hierarchy.parent) {
        if (!parent.state.current.isVisible || !parent.state.current.isExpanded) {
          return false;
        }
      }
      return true;
    });
}
