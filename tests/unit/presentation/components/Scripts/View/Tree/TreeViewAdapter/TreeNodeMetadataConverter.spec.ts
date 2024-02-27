import { describe, it, expect } from 'vitest';
import { getNodeMetadata, convertToNodeInput } from '@/presentation/components/Scripts/View/Tree/TreeViewAdapter/TreeNodeMetadataConverter';
import { NodeMetadataStub } from '@tests/unit/shared/Stubs/NodeMetadataStub';
import { TreeNodeStub } from '@tests/unit/shared/Stubs/TreeNodeStub';
import { itEachAbsentObjectValue } from '@tests/unit/shared/TestCases/AbsentTests';
import type { NodeMetadata } from '@/presentation/components/Scripts/View/Tree/NodeContent/NodeMetadata';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';

describe('TreeNodeMetadataConverter', () => {
  describe('getNodeMetadata', () => {
    it('retrieves node metadata as expected', () => {
      // arrange
      const expectedMetadata = new NodeMetadataStub();
      const treeNode = new TreeNodeStub()
        .withMetadata(expectedMetadata);
      // act
      const actual = getNodeMetadata(treeNode);
      // assert
      expect(actual).to.equal(expectedMetadata);
    });
    describe('throws when metadata is absent', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'Provided node does not contain the expected metadata.';
        const absentMetadata = absentValue as NodeMetadata | undefined;
        const treeNode = new TreeNodeStub()
          .withMetadata(absentMetadata);
        // act
        const act = () => getNodeMetadata(treeNode);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });
  describe('convertToNodeInput', () => {
    it('sets metadata as tree node data', () => {
      // arrange
      const expectedMetadata = new NodeMetadataStub();
      // act
      const actual = convertToNodeInput(expectedMetadata);
      // assert
      expect(actual.data).to.equal(expectedMetadata);
    });
    describe('children conversion', () => {
      it('correctly converts metadata without children', () => {
        // arrange
        const metadataWithoutChildren = new NodeMetadataStub();
        // act
        const actual = convertToNodeInput(metadataWithoutChildren);
        // assert
        expect(actual.children).to.have.lengthOf(0);
      });

      it('converts children nodes', () => {
        // arrange
        const expectedChildren = [new NodeMetadataStub(), new NodeMetadataStub()];
        const expected = new NodeMetadataStub()
          .withChildren(expectedChildren);
        // act
        const actual = convertToNodeInput(expected);
        // assert
        expectExists(actual.children);
        expect(actual.children).to.have.lengthOf(expectedChildren.length);
        expect(actual.children[0].data).to.equal(expectedChildren[0]);
        expect(actual.children[1].data).to.equal(expectedChildren[1]);
      });

      it('converts nested children nodes recursively', () => {
        // arrange
        const childLevel2Instance1 = new NodeMetadataStub().withId('L2-1');
        const childLevel2Instance2 = new NodeMetadataStub().withId('L2-2');
        const childLevel1 = new NodeMetadataStub().withChildren(
          [childLevel2Instance1, childLevel2Instance2],
        );
        const rootNode = new NodeMetadataStub().withChildren([childLevel1]).withId('root');
        // act
        const actual = convertToNodeInput(rootNode);
        // assert
        expectExists(actual.children);
        expect(actual.children).to.have.lengthOf(1);
        expect(actual.children[0].data).to.equal(childLevel1);
        const nestedChildren = actual.children[0].children;
        expectExists(nestedChildren);
        expect(nestedChildren).to.have.lengthOf(2);
        expect(nestedChildren[0].data).to.equal(childLevel2Instance1);
        expect(nestedChildren[1].data).to.equal(childLevel2Instance2);
      });
    });
  });
});
