import { describe, it, expect } from 'vitest';
import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';
import { RepositoryEntityStub } from '@tests/unit/shared/Stubs/RepositoryEntityStub';
import type { RepositoryEntity, RepositoryEntityId } from '@/application/Repository/RepositoryEntity';
import { expectArrayEquals } from '@tests/shared/Assertions/ExpectArrayEquals';

describe('InMemoryRepository', () => {
  describe('exists', () => {
    it('returns true when item exists', () => {
      // arrange
      const expectedExistence = true;
      const existingItemId: RepositoryEntityId = 'existing-entity-id';
      const items: readonly RepositoryEntity[] = [
        new RepositoryEntityStub('unrelated-entity-1'),
        new RepositoryEntityStub(existingItemId),
        new RepositoryEntityStub('unrelated-entity-2'),
      ];
      const sut = new InMemoryRepository(items);
      // act
      const actualExistence = sut.exists(existingItemId);
      // assert
      expect(actualExistence).to.equal(expectedExistence);
    });
    it('returns false when item does not exist', () => {
      // arrange
      const expectedExistence = false;
      const absentItemId: RepositoryEntityId = 'id-that-does-not-belong';
      const items: readonly RepositoryEntity[] = [
        new RepositoryEntityStub('unrelated-entity-1'),
        new RepositoryEntityStub('unrelated-entity-2'),
      ];
      const sut = new InMemoryRepository(items);
      // act
      const actualExistence = sut.exists(absentItemId);
      // assert
      expect(actualExistence).to.equal(expectedExistence);
    });
  });
  describe('getItems', () => {
    it('returns initial items', () => {
      // arrange
      const expectedItems: readonly RepositoryEntity[] = [
        new RepositoryEntityStub('expected-item-1'),
        new RepositoryEntityStub('expected-item-2'),
        new RepositoryEntityStub('expected-item-3'),
      ];
      // act
      const sut = new InMemoryRepository(expectedItems);
      const actualItems = sut.getItems();
      // assert
      expectArrayEquals(actualItems, expectedItems, {
        ignoreOrder: true,
        deep: true,
      });
    });
  });
  describe('addItem', () => {
    it('increases length', () => {
      // arrange
      const sut = new InMemoryRepository<RepositoryEntity>();
      const expectedLength = 1;

      // act
      sut.addItem(new RepositoryEntityStub('unrelated-id'));

      // assert
      const actualLength = sut.length;
      expect(actualLength).to.equal(expectedLength);
    });
    it('adds as item', () => {
      // arrange
      const sut = new InMemoryRepository<RepositoryEntity>();
      const expectedItem = new RepositoryEntityStub('expected-entity-id');

      // act
      sut.addItem(expectedItem);

      // assert
      const actualItems = sut.getItems();
      expect(actualItems).to.have.lengthOf(1);
      expect(actualItems).to.deep.include(expectedItem);
    });
  });
  describe('removeItem', () => {
    it('decreases length', () => {
      // arrange
      const itemIdToDelete: RepositoryEntityId = 'entity-id-to-be-deleted';
      const initialItems: readonly RepositoryEntity[] = [
        new RepositoryEntityStub('entity-to-be-retained-1'),
        new RepositoryEntityStub(itemIdToDelete),
        new RepositoryEntityStub('entity-to-be-retained-2'),
      ];
      const expectedLength = 2;
      const sut = new InMemoryRepository<RepositoryEntity>(initialItems);
      // act
      sut.removeItem(itemIdToDelete);
      // assert
      const actualLength = sut.length;
      expect(actualLength).to.equal(expectedLength);
    });
    it('removes from items', () => {
      // arrange
      const expectedItems: readonly RepositoryEntity[] = [
        new RepositoryEntityStub('entity-to-be-retained-1'),
        new RepositoryEntityStub('entity-to-be-retained-2'),
      ];
      const itemIdToDelete: RepositoryEntityId = 'entity-id-to-be-deleted';
      const initialItems: readonly RepositoryEntity[] = [
        ...expectedItems,
        new RepositoryEntityStub(itemIdToDelete),
      ];
      const sut = new InMemoryRepository<RepositoryEntity>(initialItems);
      // act
      sut.removeItem(itemIdToDelete);
      // assert
      const actualItems = sut.getItems();
      expectArrayEquals(actualItems, expectedItems, {
        ignoreOrder: true,
        deep: true,
      });
    });
  });
  describe('addOrUpdateItem', () => {
    it('adds when item does not exist', () => {
      // arrange
      const initialItems: readonly RepositoryEntity[] = [
        new RepositoryEntityStub('existing-item-1'),
        new RepositoryEntityStub('existing-item-2'),
      ];
      const newItem = new RepositoryEntityStub('new-item');
      const expectedItems: readonly RepositoryEntity[] = [
        ...initialItems,
        newItem,
      ];
      const sut = new InMemoryRepository(initialItems);
      // act
      sut.addOrUpdateItem(newItem);
      // assert
      const actualItems = sut.getItems();
      expectArrayEquals(actualItems, expectedItems, {
        ignoreOrder: true,
      });
    });
    it('updates when item exists', () => {
      // arrange
      const itemId: RepositoryEntityId = 'same-item-id';
      const initialItems: readonly RepositoryEntity[] = [
        new RepositoryEntityStub(itemId)
          .withCustomPropertyValue('initial-property-value'),
      ];
      const updatedItem = new RepositoryEntityStub(itemId)
        .withCustomPropertyValue('changed-property-value');
      const sut = new InMemoryRepository(initialItems);
      // act
      sut.addOrUpdateItem(updatedItem);
      // assert
      const actualItems = sut.getItems();
      expect(actualItems).to.have.lengthOf(1);
      expect(actualItems[0]).to.equal(updatedItem);
    });
  });
  describe('getById', () => {
    it('returns entity if it exists', () => {
      // arrange
      const existingId: RepositoryEntityId = 'existing-item-id';
      const expectedItem = new RepositoryEntityStub(existingId)
        .withCustomPropertyValue('bca');
      const initialItems: readonly RepositoryEntity[] = [
        new RepositoryEntityStub('unrelated-entity'),
        expectedItem,
        new RepositoryEntityStub('different-id-same-property').withCustomPropertyValue('bca'),
      ];
      const sut = new InMemoryRepository(initialItems);
      // act
      const actualItem = sut.getById(expectedItem.id);
      // assert
      expect(actualItem).to.deep.equal(expectedItem);
    });
    it('throws if item does not exist', () => {
      // arrange
      const id: RepositoryEntityId = 'id-that-does-not-exist';
      const expectedError = `missing item: ${id}`;
      const sut = new InMemoryRepository<RepositoryEntityStub>();
      // act
      const act = () => sut.getById(id);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});
