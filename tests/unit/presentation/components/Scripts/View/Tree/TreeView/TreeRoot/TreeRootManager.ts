import { SingleNodeCollectionFocusManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/Focus/SingleNodeCollectionFocusManager';
import { TreeNodeCollection } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeNodeCollection';
import { TreeNodeInitializerAndUpdater } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/NodeCollection/TreeNodeInitializerAndUpdater';
import { TreeRootManager } from '@/presentation/components/Scripts/View/Tree/TreeView/TreeRoot/TreeRootManager';
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
      const sut = new TreeRootManager();
      // act
      const actualCollection = sut.collection;
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
      const factoryMock = (collection) => {
        usedCollection = collection;
        return new SingleNodeFocusManagerStub();
      };
      const sut = new TreeRootManager(new TreeNodeCollectionStub(), factoryMock);
      // act
      const expected = sut.collection;
      // assert
      expect(usedCollection).to.equal(expected);
    });
  });
});
