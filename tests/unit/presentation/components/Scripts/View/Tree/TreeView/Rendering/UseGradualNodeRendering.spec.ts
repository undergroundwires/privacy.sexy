import { describe, it, expect } from 'vitest';
import { type Ref, shallowRef } from 'vue';
import { useGradualNodeRendering } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/UseGradualNodeRendering';
import { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import { TreeRootStub } from '@tests/unit/shared/Stubs/TreeRootStub';
import { UseNodeStateChangeAggregatorStub } from '@tests/unit/shared/Stubs/UseNodeStateChangeAggregatorStub';
import { UseCurrentTreeNodesStub } from '@tests/unit/shared/Stubs/UseCurrentTreeNodesStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { QueryableNodesStub } from '@tests/unit/shared/Stubs/QueryableNodesStub';
import { NodeStateChangeEventArgsStub } from '@tests/unit/shared/Stubs/NodeStateChangeEventArgsStub';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import { DelaySchedulerStub } from '@tests/unit/shared/Stubs/DelaySchedulerStub';
import { DelayScheduler } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/DelayScheduler';
import { ReadOnlyTreeNode, TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { RenderQueueOrdererStub } from '@tests/unit/shared/Stubs/RenderQueueOrdererStub';
import { RenderQueueOrderer } from '@/presentation/components/Scripts/View/Tree/TreeView/Rendering/Ordering/RenderQueueOrderer';

describe('useGradualNodeRendering', () => {
  it('tracks nodes on specified tree', () => {
    // arrange
    const expectedTreeRootRef = shallowRef(new TreeRootStub());
    const currentTreeNodesStub = new UseCurrentTreeNodesStub();
    const builder = new UseGradualNodeRenderingBuilder()
      .withCurrentTreeNodes(currentTreeNodesStub)
      .withTreeRootRef(expectedTreeRootRef);
    // act
    builder.call();
    // assert
    const actualTreeRootRef = currentTreeNodesStub.treeRootRef;
    expect(actualTreeRootRef).to.equal(expectedTreeRootRef);
  });
  describe('shouldRender', () => {
    describe('on visibility toggle', () => {
      const scenarios: ReadonlyArray<{
        readonly description: string;
        readonly oldVisibilityState: boolean;
        readonly newVisibilityState: boolean;
        readonly expectedRenderStatus: boolean;
      }> = [
        {
          description: 'renders node when made visible',
          oldVisibilityState: false,
          newVisibilityState: true,
          expectedRenderStatus: true,
        },
        {
          description: 'does not render node when hidden',
          oldVisibilityState: true,
          newVisibilityState: false,
          expectedRenderStatus: false,
        },
      ];
      scenarios.forEach(({
        description, newVisibilityState, oldVisibilityState, expectedRenderStatus,
      }) => {
        it(description, () => {
          // arrange
          const node = createNodeWithVisibility(oldVisibilityState);
          const nodesStub = new UseCurrentTreeNodesStub()
            .withQueryableNodes(new QueryableNodesStub().withFlattenedNodes([node]));
          const aggregatorStub = new UseNodeStateChangeAggregatorStub();
          const delaySchedulerStub = new DelaySchedulerStub();
          const builder = new UseGradualNodeRenderingBuilder()
            .withCurrentTreeNodes(nodesStub)
            .withChangeAggregator(aggregatorStub)
            .withDelayScheduler(delaySchedulerStub);
          const change = new NodeStateChangeEventArgsStub()
            .withNode(node)
            .withOldState(new TreeNodeStateDescriptorStub().withVisibility(oldVisibilityState))
            .withNewState(new TreeNodeStateDescriptorStub().withVisibility(newVisibilityState));
          // act
          const strategy = builder.call();
          aggregatorStub.notifyChange(change);
          const actualRenderStatus = strategy.shouldRender(node);
          // assert
          expect(actualRenderStatus).to.equal(expectedRenderStatus);
        });
      });
    });
    describe('on initial nodes', () => {
      const scenarios: ReadonlyArray<{
        readonly description: string;
        readonly schedulerTicks: number;
        readonly initialBatchSize: number;
        readonly subsequentBatchSize: number;
        readonly nodes: readonly TreeNode[];
        readonly expectedRenderStatuses: readonly number[],
      }> = [
        (() => {
          const totalNodes = 10;
          return {
            description: 'does not render if all nodes are hidden',
            schedulerTicks: 0,
            initialBatchSize: 5,
            subsequentBatchSize: 2,
            nodes: createNodesWithVisibility(false, totalNodes),
            expectedRenderStatuses: new Array(totalNodes).fill(false),
          };
        })(),
        (() => {
          const expectedRenderStatuses = [
            false, false, true, true, false,
          ];
          const nodes = expectedRenderStatuses.map((status) => createNodeWithVisibility(status));
          return {
            description: 'renders only visible nodes',
            schedulerTicks: 0,
            initialBatchSize: nodes.length,
            subsequentBatchSize: 2,
            nodes,
            expectedRenderStatuses,
          };
        })(),
        (() => {
          const initialBatchSize = 5;
          return {
            description: 'renders initial nodes immediately',
            schedulerTicks: 0,
            initialBatchSize,
            subsequentBatchSize: 2,
            nodes: createNodesWithVisibility(true, initialBatchSize),
            expectedRenderStatuses: new Array(initialBatchSize).fill(true),
          };
        })(),
        (() => {
          const initialBatchSize = 5;
          const subsequentBatchSize = 2;
          const totalNodes = initialBatchSize + subsequentBatchSize * 2;
          return {
            description: 'does not render subsequent node batches immediately',
            schedulerTicks: 0,
            initialBatchSize,
            subsequentBatchSize,
            nodes: createNodesWithVisibility(true, totalNodes),
            expectedRenderStatuses: [
              ...new Array(initialBatchSize).fill(true),
              ...new Array(totalNodes - initialBatchSize).fill(false),
            ],
          };
        })(),
        (() => {
          const initialBatchSize = 5;
          const subsequentBatchSize = 2;
          const totalNodes = initialBatchSize + subsequentBatchSize * 2;
          return {
            description: 'eventually renders next subsequent node batch',
            schedulerTicks: 1,
            initialBatchSize,
            subsequentBatchSize,
            nodes: createNodesWithVisibility(true, totalNodes),
            expectedRenderStatuses: [
              ...new Array(initialBatchSize).fill(true),
              ...new Array(subsequentBatchSize).fill(true), // first batch
              ...new Array(subsequentBatchSize).fill(false), // second batch
            ],
          };
        })(),
        (() => {
          const initialBatchSize = 5;
          const totalSubsequentBatches = 2;
          const subsequentBatchSize = 2;
          const totalNodes = initialBatchSize + subsequentBatchSize * totalSubsequentBatches;
          return {
            description: 'eventually renders all subsequent node batches',
            schedulerTicks: subsequentBatchSize,
            initialBatchSize,
            subsequentBatchSize,
            nodes: createNodesWithVisibility(true, totalNodes),
            expectedRenderStatuses: new Array(totalNodes).fill(true),
          };
        })(),
      ];
      scenarios.forEach(({
        description, nodes, schedulerTicks, initialBatchSize,
        subsequentBatchSize, expectedRenderStatuses,
      }) => {
        it(description, () => {
          // arrange
          const delaySchedulerStub = new DelaySchedulerStub();
          const nodesStub = new UseCurrentTreeNodesStub()
            .withQueryableNodes(new QueryableNodesStub().withFlattenedNodes(nodes));
          const builder = new UseGradualNodeRenderingBuilder()
            .withCurrentTreeNodes(nodesStub)
            .withInitialBatchSize(initialBatchSize)
            .withSubsequentBatchSize(subsequentBatchSize)
            .withDelayScheduler(delaySchedulerStub);
          // act
          const strategy = builder.call();
          Array.from({ length: schedulerTicks }).forEach(
            () => delaySchedulerStub.runNextScheduled(),
          );
          const actualRenderStatuses = nodes.map((node) => strategy.shouldRender(node));
          // expect
          expect(actualRenderStatuses).to.deep.equal(expectedRenderStatuses);
        });
      });
    });
    it('orders nodes before rendering', async () => {
      // arrange
      const delaySchedulerStub = new DelaySchedulerStub();
      const allNodes = Array.from({ length: 3 }).map(() => createNodeWithVisibility(true));
      const expectedNodes = [
        /* initial render */ [allNodes[2]],
        /* first subsequent render */ [allNodes[1]],
        /* second subsequent render */ [allNodes[0]],
      ];
      const ordererStub = new RenderQueueOrdererStub();
      const nodesStub = new UseCurrentTreeNodesStub().withQueryableNodes(
        new QueryableNodesStub().withFlattenedNodes(allNodes),
      );
      const builder = new UseGradualNodeRenderingBuilder()
        .withCurrentTreeNodes(nodesStub)
        .withInitialBatchSize(1)
        .withSubsequentBatchSize(1)
        .withDelayScheduler(delaySchedulerStub)
        .withOrderer(ordererStub);
      const actualOrder = new Set<ReadOnlyTreeNode>();
      // act
      ordererStub.orderNodes = () => expectedNodes[0];
      const strategy = builder.call();
      const updateOrder = () => allNodes
        .filter((node) => strategy.shouldRender(node))
        .forEach((node) => actualOrder.add(node));
      updateOrder();
      for (let i = 1; i < expectedNodes.length; i++) {
        ordererStub.orderNodes = () => expectedNodes[i];
        delaySchedulerStub.runNextScheduled();
        updateOrder();
      }
      // assert
      const expectedOrder = expectedNodes.flat();
      expect([...actualOrder]).to.deep.equal(expectedOrder);
    });
  });
  it('skips scheduling when no nodes to render', () => {
    // arrange
    const nodes = [];
    const nodesStub = new UseCurrentTreeNodesStub()
      .withQueryableNodes(new QueryableNodesStub().withFlattenedNodes(nodes));
    const delaySchedulerStub = new DelaySchedulerStub();
    const builder = new UseGradualNodeRenderingBuilder()
      .withCurrentTreeNodes(nodesStub)
      .withDelayScheduler(delaySchedulerStub);
    // act
    builder.call();
    // assert
    expect(delaySchedulerStub.nextCallback).toBeUndefined();
  });
});

function createNodesWithVisibility(
  isVisible: boolean,
  count: number,
): readonly TreeNodeStub[] {
  return Array.from({ length: count })
    .map(() => createNodeWithVisibility(isVisible));
}

function createNodeWithVisibility(
  isVisible: boolean,
): TreeNodeStub {
  return new TreeNodeStub()
    .withState(
      new TreeNodeStateAccessStub().withCurrentVisibility(isVisible),
    );
}

class UseGradualNodeRenderingBuilder {
  private changeAggregator = new UseNodeStateChangeAggregatorStub();

  private treeRootRef: Readonly<Ref<TreeRoot>> = shallowRef(new TreeRootStub());

  private currentTreeNodes = new UseCurrentTreeNodesStub();

  private delayScheduler: DelayScheduler = new DelaySchedulerStub();

  private initialBatchSize = 5;

  private subsequentBatchSize = 3;

  private orderer: RenderQueueOrderer = new RenderQueueOrdererStub();

  public withChangeAggregator(changeAggregator: UseNodeStateChangeAggregatorStub): this {
    this.changeAggregator = changeAggregator;
    return this;
  }

  public withCurrentTreeNodes(treeNodes: UseCurrentTreeNodesStub): this {
    this.currentTreeNodes = treeNodes;
    return this;
  }

  public withTreeRootRef(treeRootRef: Readonly<Ref<TreeRoot>>): this {
    this.treeRootRef = treeRootRef;
    return this;
  }

  public withDelayScheduler(delayScheduler: DelayScheduler): this {
    this.delayScheduler = delayScheduler;
    return this;
  }

  public withInitialBatchSize(initialBatchSize: number): this {
    this.initialBatchSize = initialBatchSize;
    return this;
  }

  public withSubsequentBatchSize(subsequentBatchSize: number): this {
    this.subsequentBatchSize = subsequentBatchSize;
    return this;
  }

  public withOrderer(orderer: RenderQueueOrderer) {
    this.orderer = orderer;
    return this;
  }

  public call(): ReturnType<typeof useGradualNodeRendering> {
    return useGradualNodeRendering(
      this.treeRootRef,
      this.changeAggregator.get(),
      this.currentTreeNodes.get(),
      this.delayScheduler,
      this.initialBatchSize,
      this.subsequentBatchSize,
      this.orderer,
    );
  }
}
