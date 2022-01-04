import { describe, it, expect } from 'vitest';
import { StringIdentifiableStub, StringKeyStub } from '@tests/unit/shared/Stubs/StringIdentifiableStub';
import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';

describe('InMemoryRepository', () => {
  describe('exists', () => {
    const sut = new InMemoryRepository<StringKeyStub, StringIdentifiableStub>(
      [new StringIdentifiableStub('1'), new StringIdentifiableStub('2'), new StringIdentifiableStub('3')],
    );

    describe('item exists', () => {
      const actual = sut.exists('1');
      it('returns true', () => expect(actual).to.be.true);
    });
    describe('item does not exist', () => {
      const actual = sut.exists('99');
      it('returns false', () => expect(actual).to.be.false);
    });
  });
  it('getItems gets initial items', () => {
    // arrange
    const expected = [
      new StringIdentifiableStub('1'), new StringIdentifiableStub('2'),
      new StringIdentifiableStub('3'), new StringIdentifiableStub('4'),
    ];

    // act
    const sut = new InMemoryRepository<StringKeyStub, StringIdentifiableStub>(expected);
    const actual = sut.getItems();

    // assert
    expect(actual).to.deep.equal(expected);
  });
  describe('addItem', () => {
    it('adds', () => {
      // arrange
      const sut = new InMemoryRepository<StringKeyStub, StringIdentifiableStub>();
      const expected = {
        length: 1,
        item: new StringIdentifiableStub('1'),
      };

      // act
      sut.addItem(expected.item);
      const actual = {
        length: sut.length,
        item: sut.getItems()[0],
      };

      // assert
      expect(actual.length).to.equal(expected.length);
      expect(actual.item).to.deep.equal(expected.item);
    });
  });
  it('removeItem removes', () => {
    // arrange
    const idToDelete = 'id-to-delete';
    const initialItems = [
      new StringIdentifiableStub('initial-entity-1'), new StringIdentifiableStub('initial-entity-2'),
      new StringIdentifiableStub(idToDelete), new StringIdentifiableStub('initial-entity-3'),
    ];
    const expected = {
      length: 3,
      items: [
        new StringIdentifiableStub('initial-entity-1'),
        new StringIdentifiableStub('initial-entity-2'),
        new StringIdentifiableStub('initial-entity-3'),
      ],
    };
    const sut = new InMemoryRepository<StringKeyStub, StringIdentifiableStub>(initialItems);

    // act
    sut.removeItem(idToDelete);
    const actual = {
      length: sut.length,
      items: sut.getItems(),
    };

    // assert
    expect(actual.length).to.equal(expected.length);
    expect(actual.items).to.deep.equal(expected.items);
  });
  describe('addOrUpdateItem', () => {
    it('adds when item does not exist', () => {
      // arrange
      const initialItems = [
        new StringIdentifiableStub('initial-item-1'),
        new StringIdentifiableStub('initial-item-2'),
      ];
      const newItem = new StringIdentifiableStub('new-item');
      const expected = [...initialItems, newItem];
      const sut = new InMemoryRepository<StringKeyStub, StringIdentifiableStub>(initialItems);
      // act
      sut.addOrUpdateItem(newItem);
      // assert
      const actual = sut.getItems();
      expect(actual).to.deep.equal(expected);
    });
    it('updates when item exists', () => {
      // arrange
      const entityId = 'common-entity-id';
      const initialItems = [new StringIdentifiableStub(entityId).withCustomProperty('bca')];
      const updatedItem = new StringIdentifiableStub(entityId).withCustomProperty('abc');
      const expected = [updatedItem];
      const sut = new InMemoryRepository<StringKeyStub, StringIdentifiableStub>(initialItems);
      // act
      sut.addOrUpdateItem(updatedItem);
      // assert
      const actual = sut.getItems();
      expect(actual).to.deep.equal(expected);
    });
  });
  describe('getById', () => {
    it('returns entity if it exists', () => {
      // arrange
      const entityId = 'expected-entity-id';
      const expected = new StringIdentifiableStub(entityId).withCustomProperty('bca');
      const sut = new InMemoryRepository<StringKeyStub, StringIdentifiableStub>([
        expected, new StringIdentifiableStub('2').withCustomProperty('bca'),
        new StringIdentifiableStub('3').withCustomProperty('bca'),
        new StringIdentifiableStub('4').withCustomProperty('bca'),
      ]);
      // act
      const actual = sut.getById(entityId);
      // assert
      expect(actual).to.deep.equal(expected);
    });
    it('throws if item does not exist', () => {
      // arrange
      const id = 'non-existing-id';
      const expectedError = `missing item: ${id}`;
      const sut = new InMemoryRepository<StringKeyStub, StringIdentifiableStub>([]);
      const key = new StringKeyStub(id);
      // act
      const act = () => sut.getById(key);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
});
