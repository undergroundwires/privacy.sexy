import {
  afterEach, describe, expect, it,
} from 'vitest';
import { shallowRef } from 'vue';
import { useTreeKeyboardNavigation } from '@/presentation/components/Scripts/View/Tree/TreeView/UseTreeKeyboardNavigation';
import { TreeRootManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRootManager';
import { UseEventListenerStub } from '@tests/unit/shared/Stubs/UseEventListenerStub';
import type { TreeInputNodeData } from '@/presentation/components/Scripts/View/Tree/TreeView/Bindings/TreeInputNodeData';
import type { TreeNodeId } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import type { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';

describe('useTreeKeyboardNavigation', () => {
  describe('ArrowDown', () => {
    it('skips a collapsed child that is absent from the rendered tree', () => {
      // arrange
      const context = createTestContext({
        nodes: [
          {
            id: 'branch',
            children: [{ id: 'collapsed-child' }],
          },
          { id: 'next-root' },
        ],
        renderedNodeIds: ['branch', 'next-root'],
      });
      context.focusNode('branch');
      const expectedFocusedNodeId = 'next-root';
      // act
      context.pressKey('ArrowDown');
      // assert
      expect(context.focusedNodeId).to.equal(expectedFocusedNodeId);
    });

    it('skips a filtered node that is absent from the rendered tree', () => {
      // arrange
      const context = createTestContext({
        nodes: [
          { id: 'first-root' },
          { id: 'filtered-root' },
          { id: 'next-root' },
        ],
        renderedNodeIds: ['first-root', 'next-root'],
      });
      context.focusNode('first-root');
      const expectedFocusedNodeId = 'next-root';
      // act
      context.pressKey('ArrowDown');
      // assert
      expect(context.focusedNodeId).to.equal(expectedFocusedNodeId);
    });

    it('skips collapsed descendants that remain in the DOM during a transition', () => {
      const context = createTestContext({
        nodes: [
          { id: 'branch', children: [{ id: 'leaving-child' }] },
          { id: 'next-root' },
        ],
        renderedNodeIds: ['branch', 'leaving-child', 'next-root'],
      });
      context.focusNode('branch');
      context.pressKey('ArrowDown');
      expect(context.focusedNodeId).to.equal('next-root');
    });

    it('skips filtered nodes before their DOM removal completes', () => {
      const context = createTestContext({
        nodes: [{ id: 'first' }, { id: 'filtered' }, { id: 'next' }],
        renderedNodeIds: ['first', 'filtered', 'next'],
      });
      const filtered = context.treeRoot.collection.nodes.getNodeById('filtered');
      filtered.state.commitTransaction(
        filtered.state.beginTransaction().withVisibilityState(false),
      );
      context.focusNode('first');
      context.pressKey('ArrowDown');
      expect(context.focusedNodeId).to.equal('next');
    });
  });

  describe('ArrowRight', () => {
    it('does not focus an expanded child that has not been rendered', () => {
      // arrange
      const context = createTestContext({
        nodes: [
          {
            id: 'branch',
            children: [{ id: 'unrendered-child' }],
          },
        ],
        renderedNodeIds: ['branch'],
      });
      context.expandNode('branch');
      context.focusNode('branch');
      const expectedFocusedNodeId = 'branch';
      // act
      context.pressKey('ArrowRight');
      // assert
      expect(context.focusedNodeId).to.equal(expectedFocusedNodeId);
    });
  });

  it('preserves keyboard event bubbling after handling a tree action', () => {
    // arrange
    const context = createTestContext({
      nodes: [{ id: 'root' }],
      renderedNodeIds: ['root'],
    });
    context.focusNode('root');
    let didReceiveDocumentKeydown = false;
    const onDocumentKeydown = () => {
      didReceiveDocumentKeydown = true;
    };
    document.addEventListener('keydown', onDocumentKeydown);
    // act
    const event = context.pressKey('ArrowDown');
    document.removeEventListener('keydown', onDocumentKeydown);
    // assert
    expect(event.defaultPrevented).to.equal(true);
    expect(didReceiveDocumentKeydown).to.equal(true);
  });
});

const activeContexts: TestContext[] = [];

afterEach(() => {
  activeContexts.forEach((context) => context.dispose());
  activeContexts.length = 0;
});

function createTestContext(options: {
  readonly nodes: readonly TreeInputNodeData[];
  readonly renderedNodeIds: readonly TreeNodeId[];
}): TestContext {
  const context = new TestContext(options);
  activeContexts.push(context);
  return context;
}

class TestContext {
  public readonly treeRoot = new TreeRootManager();

  private readonly treeElement = document.createElement('div');

  public get focusedNodeId(): TreeNodeId | undefined {
    return this.treeRoot.focus.currentSingleFocusedNode?.id;
  }

  public constructor(options: {
    readonly nodes: readonly TreeInputNodeData[];
    readonly renderedNodeIds: readonly TreeNodeId[];
  }) {
    this.treeRoot.collection.updateRootNodes(options.nodes);
    options.renderedNodeIds.forEach((nodeId) => {
      const nodeElement = document.createElement('div');
      nodeElement.dataset.treeNodeId = nodeId;
      this.treeElement.append(nodeElement);
    });
    document.body.append(this.treeElement);
    useTreeKeyboardNavigation(
      shallowRef<TreeRoot>(this.treeRoot),
      shallowRef<HTMLElement | undefined>(this.treeElement),
      new UseEventListenerStub().get(),
    );
  }

  public focusNode(nodeId: TreeNodeId): void {
    this.treeRoot.focus.setSingleFocus(
      this.treeRoot.collection.nodes.getNodeById(nodeId),
    );
  }

  public expandNode(nodeId: TreeNodeId): void {
    const node = this.treeRoot.collection.nodes.getNodeById(nodeId);
    node.state.commitTransaction(
      node.state.beginTransaction().withExpansionState(true),
    );
  }

  public pressKey(key: string): KeyboardEvent {
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key,
    });
    this.treeElement.dispatchEvent(event);
    return event;
  }

  public dispose(): void {
    this.treeElement.remove();
  }
}
