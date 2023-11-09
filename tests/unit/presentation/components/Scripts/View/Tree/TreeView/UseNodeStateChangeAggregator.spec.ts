import { describe, it, expect } from 'vitest';
import { WatchSource, defineComponent, nextTick } from 'vue';
import { shallowMount } from '@vue/test-utils';
import { TreeRoot } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRoot';
import { useCurrentTreeNodes } from '@/presentation/components/Scripts/View/Tree/TreeView/UseCurrentTreeNodes';
import { NodeStateChangeEventArgs, NodeStateChangeEventCallback, useNodeStateChangeAggregator } from '@/presentation/components/Scripts/View/Tree/TreeView/UseNodeStateChangeAggregator';
import { TreeRootStub } from '@tests/unit/shared/Stubs/TreeRootStub';
import { UseCurrentTreeNodesStub } from '@tests/unit/shared/Stubs/UseCurrentTreeNodesStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { UseAutoUnsubscribedEventsStub } from '@tests/unit/shared/Stubs/UseAutoUnsubscribedEventsStub';
import { InjectionKeys } from '@/presentation/injectionSymbols';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { QueryableNodesStub } from '@tests/unit/shared/Stubs/QueryableNodesStub';
import { TreeNode } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/TreeNode';
import { TreeNodeStateDescriptor } from '@/presentation/components/Scripts/View/Tree/TreeView/Node/State/StateDescriptor';
import { TreeNodeStateDescriptorStub } from '@tests/unit/shared/Stubs/TreeNodeStateDescriptorStub';
import { TreeNodeStateAccessStub } from '@tests/unit/shared/Stubs/TreeNodeStateAccessStub';
import { IEventSubscriptionCollection } from '@/infrastructure/Events/IEventSubscriptionCollection';
import { FunctionKeys } from '@/TypeHelpers';

describe('useNodeStateChangeAggregator', () => {
  it('watches nodes on specified tree', () => {
    // arrange
    const expectedWatcher = () => new TreeRootStub();
    const currentTreeNodesStub = new UseCurrentTreeNodesStub();
    const builder = new UseNodeStateChangeAggregatorBuilder()
      .withCurrentTreeNodes(currentTreeNodesStub.get())
      .withTreeWatcher(expectedWatcher);
    // act
    builder.mountWrapperComponent();
    // assert
    const actualWatcher = currentTreeNodesStub.treeWatcher;
    expect(actualWatcher).to.equal(expectedWatcher);
  });
  describe('onNodeStateChange', () => {
    describe('throws if callback is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing callback';
        const { returnObject } = new UseNodeStateChangeAggregatorBuilder()
          .mountWrapperComponent();
        // act
        const act = () => returnObject.onNodeStateChange(absentValue);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('notifies current node states', () => {
      const scenarios: ReadonlyArray<{
        readonly description: string;
        readonly expectedNodes: readonly TreeNode[];
      }> = [
        {
          description: 'given single node',
          expectedNodes: [
            new TreeNodeStub().withId('expected-single-node'),
          ],
        },
        {
          description: 'given multiple nodes',
          expectedNodes: [
            new TreeNodeStub().withId('expected-first-node'),
            new TreeNodeStub().withId('expected-second-node'),
          ],
        },
      ];
      scenarios.forEach(({
        description, expectedNodes,
      }) => {
        describe('initially', () => {
          it(description, async () => {
            // arrange
            const nodesStub = new UseCurrentTreeNodesStub()
              .withQueryableNodes(createFlatCollection(expectedNodes));
            const { returnObject } = new UseNodeStateChangeAggregatorBuilder()
              .withCurrentTreeNodes(nodesStub.get())
              .mountWrapperComponent();
            const { callback, calledArgs } = createSpyingCallback();
            // act
            returnObject.onNodeStateChange(callback);
            await nextTick();
            // assert
            assertCurrentNodeCalls({
              actualArgs: calledArgs,
              expectedNodes,
              expectedNewStates: expectedNodes.map((n) => n.state.current),
              expectedOldStates: new Array(expectedNodes.length).fill(undefined),
            });
          });
        });
        describe('when the tree changes', () => {
          it(description, async () => {
            // arrange
            const nodesStub = new UseCurrentTreeNodesStub();
            const { returnObject } = new UseNodeStateChangeAggregatorBuilder()
              .withCurrentTreeNodes(nodesStub.get())
              .mountWrapperComponent();
            const { callback, calledArgs } = createSpyingCallback();
            // act
            returnObject.onNodeStateChange(callback);
            calledArgs.length = 0;
            nodesStub.triggerNewNodes(createFlatCollection(expectedNodes));
            await nextTick();
            // assert
            assertCurrentNodeCalls({
              actualArgs: calledArgs,
              expectedNodes,
              expectedNewStates: expectedNodes.map((n) => n.state.current),
              expectedOldStates: new Array(expectedNodes.length).fill(undefined),
            });
          });
        });
        describe('when the callback changes', () => {
          it(description, async () => {
            // arrange
            const nodesStub = new UseCurrentTreeNodesStub()
              .withQueryableNodes(createFlatCollection(expectedNodes));
            const { returnObject } = new UseNodeStateChangeAggregatorBuilder()
              .withCurrentTreeNodes(nodesStub.get())
              .mountWrapperComponent();
            const { callback, calledArgs } = createSpyingCallback();
            // act
            returnObject.onNodeStateChange(() => { /* NOOP */ });
            await nextTick();
            returnObject.onNodeStateChange(callback);
            await nextTick();
            // assert
            assertCurrentNodeCalls({
              actualArgs: calledArgs,
              expectedNodes,
              expectedNewStates: expectedNodes.map((n) => n.state.current),
              expectedOldStates: new Array(expectedNodes.length).fill(undefined),
            });
          });
        });
      });
    });
    describe('notifies future node states', () => {
      const scenarios: ReadonlyArray<{
        readonly description: string;
        readonly initialNodes: readonly TreeNode[];
        readonly changedNode: TreeNodeStub;
        readonly expectedOldState: TreeNodeStateDescriptor;
        readonly expectedNewState: TreeNodeStateDescriptor;
      }> = [
        (() => {
          const changedNode = new TreeNodeStub().withId('expected-single-node');
          return {
            description: 'given single node state change',
            initialNodes: [changedNode],
            changedNode,
            expectedOldState: new TreeNodeStateDescriptorStub().withFocus(false),
            expectedNewState: new TreeNodeStateDescriptorStub().withFocus(true),
          };
        })(),
        (() => {
          const changedNode = new TreeNodeStub().withId('changed-second-node');
          return {
            description: 'given multiple nodes with a state change in one of them',
            initialNodes: [
              new TreeNodeStub().withId('unchanged-first-node'),
              changedNode,
            ],
            changedNode,
            expectedOldState: new TreeNodeStateDescriptorStub().withFocus(false),
            expectedNewState: new TreeNodeStateDescriptorStub().withFocus(true),
          };
        })(),
      ];

      scenarios.forEach(({
        description, initialNodes, changedNode, expectedOldState, expectedNewState,
      }) => {
        describe('when the state change event is triggered', () => {
          it(description, async () => {
            // arrange
            const nodesStub = new UseCurrentTreeNodesStub()
              .withQueryableNodes(createFlatCollection(initialNodes));
            const nodeState = new TreeNodeStateAccessStub();
            changedNode.withState(nodeState);
            const { returnObject } = new UseNodeStateChangeAggregatorBuilder()
              .withCurrentTreeNodes(nodesStub.get())
              .mountWrapperComponent();
            const { callback, calledArgs } = createSpyingCallback();
            returnObject.onNodeStateChange(callback);
            // act
            await nextTick();
            calledArgs.length = 0;
            nodeState.triggerStateChangedEvent({
              oldState: expectedOldState,
              newState: expectedNewState,
            });
            await nextTick();
            // assert
            assertCurrentNodeCalls({
              actualArgs: calledArgs,
              expectedNodes: [changedNode],
              expectedNewStates: [expectedNewState],
              expectedOldStates: [expectedOldState],
            });
          });
        });
      });
    });
  });
  describe('unsubscribes correctly', () => {
    const scenarios: ReadonlyArray<{
      readonly description: string;
      readonly newNodes: readonly TreeNode[];
      readonly expectedMethodName: FunctionKeys<IEventSubscriptionCollection>;
    }> = [
      {
        description: 'unsubscribe and re-register events when nodes change',
        newNodes: [new TreeNodeStub().withId('subsequent-node')],
        expectedMethodName: 'unsubscribeAllAndRegister',
      },
      {
        description: 'unsubscribes all when nodes change to empty',
        newNodes: [],
        expectedMethodName: 'unsubscribeAll',
      },
    ];
    scenarios.forEach(({ description, expectedMethodName, newNodes }) => {
      it(description, async () => {
        // arrange
        const initialNodes = [new TreeNodeStub().withId('initial-node')];
        const nodesStub = new UseCurrentTreeNodesStub()
          .withQueryableNodes(createFlatCollection(initialNodes));
        const eventsStub = new UseAutoUnsubscribedEventsStub();
        const { returnObject } = new UseNodeStateChangeAggregatorBuilder()
          .withCurrentTreeNodes(nodesStub.get())
          .withEventsStub(eventsStub)
          .mountWrapperComponent();
        // act
        returnObject.onNodeStateChange(() => { /* NOOP */ });
        await nextTick();
        eventsStub.events.callHistory.length = 0;
        nodesStub.triggerNewNodes(createFlatCollection(newNodes));
        await nextTick();
        // assert
        const calls = eventsStub.events.callHistory;
        expect(eventsStub.events.callHistory).has.lengthOf(1, calls.map((call) => call.methodName).join(', '));
        const actualMethodName = calls[0].methodName;
        expect(actualMethodName).to.equal(expectedMethodName);
      });
    });
  });
});

function createSpyingCallback() {
  const calledArgs = new Array<NodeStateChangeEventArgs>();
  const callback: NodeStateChangeEventCallback = (args: NodeStateChangeEventArgs) => {
    calledArgs.push(args);
  };
  return {
    calledArgs,
    callback,
  };
}

function assertCurrentNodeCalls(context: {
  readonly actualArgs: readonly NodeStateChangeEventArgs[];
  readonly expectedNodes: readonly TreeNode[];
  readonly expectedOldStates: readonly TreeNodeStateDescriptor[];
  readonly expectedNewStates: readonly TreeNodeStateDescriptor[];
}) {
  const assertionMessage = buildAssertionMessage(
    context.actualArgs,
    context.expectedNodes,
  );

  expect(context.actualArgs).to.have.lengthOf(context.expectedNodes.length, assertionMessage);

  const actualNodeIds = context.actualArgs.map((c) => c.node.id);
  const expectedNodeIds = context.expectedNodes.map((node) => node.id);
  expect(actualNodeIds).to.have.members(expectedNodeIds, assertionMessage);

  const actualOldStates = context.actualArgs.map((c) => c.oldState);
  expect(actualOldStates).to.have.deep.members(context.expectedOldStates, assertionMessage);

  const actualNewStates = context.actualArgs.map((c) => c.newState);
  expect(actualNewStates).to.have.deep.members(context.expectedNewStates, assertionMessage);
}

function buildAssertionMessage(
  calledArgs: readonly NodeStateChangeEventArgs[],
  nodes: readonly TreeNode[],
): string {
  return [
    '\n',
    `Expected nodes (${nodes.length}):`,
    nodes.map((node) => `\tid: ${node.id}\n\tstate: ${JSON.stringify(node.state.current)}`).join('\n-\n'),
    '\n',
    `Actual called args (${calledArgs.length}):`,
    calledArgs.map((args) => `\tid: ${args.node.id}\n\tnewState: ${JSON.stringify(args.newState)}`).join('\n-\n'),
    '\n',
  ].join('\n');
}

function createFlatCollection(nodes: readonly TreeNode[]): QueryableNodesStub {
  return new QueryableNodesStub().withFlattenedNodes(nodes);
}

class UseNodeStateChangeAggregatorBuilder {
  private treeWatcher: WatchSource<TreeRoot | undefined> = () => new TreeRootStub();

  private currentTreeNodes: typeof useCurrentTreeNodes = new UseCurrentTreeNodesStub().get();

  private events: UseAutoUnsubscribedEventsStub = new UseAutoUnsubscribedEventsStub();

  public withTreeWatcher(treeWatcher: WatchSource<TreeRoot | undefined>): this {
    this.treeWatcher = treeWatcher;
    return this;
  }

  public withCurrentTreeNodes(treeNodes: typeof useCurrentTreeNodes): this {
    this.currentTreeNodes = treeNodes;
    return this;
  }

  public withEventsStub(events: UseAutoUnsubscribedEventsStub): this {
    this.events = events;
    return this;
  }

  public mountWrapperComponent() {
    let returnObject: ReturnType<typeof useNodeStateChangeAggregator>;
    const { treeWatcher, currentTreeNodes } = this;
    const wrapper = shallowMount(
      defineComponent({
        setup() {
          returnObject = useNodeStateChangeAggregator(treeWatcher, currentTreeNodes);
        },
        template: '<div></div>',
      }),
      {
        global: {
          provide: {
            [InjectionKeys.useAutoUnsubscribedEvents.key]:
              () => this.events.get(),
          },
        },
      },
    );
    return {
      wrapper,
      returnObject,
    };
  }
}
