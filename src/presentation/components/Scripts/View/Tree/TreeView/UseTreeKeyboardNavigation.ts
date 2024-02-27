import { onMounted, onUnmounted, type Ref } from 'vue';
import { TreeNodeCheckState } from './Node/State/CheckState';
import type { TreeNode } from './Node/TreeNode';
import type { TreeRoot } from './TreeRoot/TreeRoot';
import type { SingleNodeFocusManager } from './TreeRoot/Focus/SingleNodeFocusManager';
import type { QueryableNodes } from './TreeRoot/NodeCollection/Query/QueryableNodes';

type TreeNavigationKeyCodes = 'ArrowLeft' | 'ArrowUp' | 'ArrowRight' | 'ArrowDown' | ' ' | 'Enter';

export function useTreeKeyboardNavigation(
  treeRootRef: Readonly<Ref<TreeRoot>>,
  treeElementRef: Readonly<Ref<HTMLElement | undefined>>,
) {
  useKeyboardListener(treeElementRef, (event) => {
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
    event.stopPropagation();

    action({
      focus: treeRoot.focus,
      nodes: treeRoot.collection.nodes,
    });
  });
}

function useKeyboardListener(
  elementRef: Readonly<Ref<HTMLElement | undefined>>,
  handleKeyboardEvent: (event: KeyboardEvent) => void,
) {
  onMounted(() => {
    elementRef.value?.addEventListener('keydown', handleKeyboardEvent, true);
  });

  onUnmounted(() => {
    elementRef.value?.removeEventListener('keydown', handleKeyboardEvent);
  });
}

interface TreeNavigationContext {
  readonly focus: SingleNodeFocusManager;
  readonly nodes: QueryableNodes;
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
    context.nodes,
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
  const nextVisibleNode = findNextVisibleNode(focusedNode, context.nodes);
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
  if (focusedNode.hierarchy.children.length === 0) {
    return;
  }
  const firstChildNode = focusedNode.hierarchy.children[0];
  if (firstChildNode) {
    context.focus.setSingleFocus(firstChildNode);
  }
}

function findNextVisibleNode(node: TreeNode, nodes: QueryableNodes): TreeNode | undefined {
  if (node.hierarchy.children.length && node.state.current.isExpanded) {
    return node.hierarchy.children[0];
  }
  const nextNode = findNextNode(node, nodes);
  const parentNode = node.hierarchy.parent;
  if (!nextNode && parentNode) {
    const nextSibling = findNextNode(parentNode, nodes);
    return nextSibling;
  }
  return nextNode;
}

function findNextNode(node: TreeNode, nodes: QueryableNodes): TreeNode | undefined {
  const index = nodes.flattenedNodes.indexOf(node);
  return nodes.flattenedNodes[index + 1] || undefined;
}

function findPreviousVisibleNode(
  node: TreeNode,
  nodes: QueryableNodes,
): TreeNode | undefined {
  const previousNode = findPreviousNode(node, nodes);
  if (!previousNode) {
    return node.hierarchy.parent;
  }
  if (previousNode.hierarchy.children.length && previousNode.state.current.isExpanded) {
    return previousNode.hierarchy.children[previousNode.hierarchy.children.length - 1];
  }
  return previousNode;
}

function findPreviousNode(node: TreeNode, nodes: QueryableNodes): TreeNode | undefined {
  const index = nodes.flattenedNodes.indexOf(node);
  return nodes.flattenedNodes[index - 1] || undefined;
}
