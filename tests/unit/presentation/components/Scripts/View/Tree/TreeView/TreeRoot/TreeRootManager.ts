import { SingleNodeCollectionFocusManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/Focus/SingleNodeCollectionFocusManager';
import type { TreeNodeCollection } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeNodeCollection';
import { TreeNodeInitializerAndUpdater } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeNodeInitializerAndUpdater';
import { TreeRootManager, type FocusManagerFactory } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRootManager';
import { SingleNodeFocusManagerStub } from '@tests/unit/shared/Stubs/SingleNodeFocusManagerStub';
import { TreeNodeCollectionStub } from '@tests/unit/shared/Stubs/TreeNodeCollectionStub';

describe('TreeRootManager', () => {
  describe('collection', () => {
    it(`defaults to ${TreeNodeInitializerAndUpdater.name}`, () => {
      // arrange
      const expectedCollectionType = TreeNodeInitializerAndUpdater;
      const sut = new TreeRootManager();
      // act
      const actualCollection = sut.collection;
      // assert
      expect(actualCollection).to.be.instanceOf(expectedCollectionType);
    });
    it('set by constructor as expected', () => {
      // arrange
      const expectedCollection = new TreeNodeCollectionStub();
      const context = new TestContext()
        .withNodeCollection(expectedCollection);
      // act
      const actualCollection = context
        .build()
        .collection;
      // assert
      expect(actualCollection).to.equal(expectedCollection);
    });
  });
  describe('focus', () => {
    it(`defaults to instance of ${SingleNodeCollectionFocusManager.name}`, () => {
      // arrange
      const expectedFocusType = SingleNodeCollectionFocusManager;
      const sut = new TreeRootManager();
      // act
      const actualFocusType = sut.focus;
      // assert
      expect(actualFocusType).to.be.instanceOf(expectedFocusType);
    });
    it('creates with same collection it uses', () => {
      // arrange
      let usedCollection: TreeNodeCollection | undefined;
      const factoryMock: FocusManagerFactory = (collection) => {
        usedCollection = collection;
        return new SingleNodeFocusManagerStub();
      };
      const context = new TestContext()
        .withFocusManagerFactory(factoryMock);
      // act
      const expected = context
        .build()
        .collection;
      // assert
      expect(usedCollection).to.equal(expected);
    });
  });
});

class TestContext {
  private nodeCollection: TreeNodeCollection = new TreeNodeCollectionStub();

  private focusManagerFactory: FocusManagerFactory = () => new SingleNodeFocusManagerStub();

  public withFocusManagerFactory(focusManagerFactory: FocusManagerFactory): this {
    this.focusManagerFactory = focusManagerFactory;
    return this;
  }

  public withNodeCollection(nodeCollection: TreeNodeCollection): this {
    this.nodeCollection = nodeCollection;
    return this;
  }

  public build(): TreeRootManager {
    return new TreeRootManager(
      this.nodeCollection,
      this.focusManagerFactory,
    );
  }
}
