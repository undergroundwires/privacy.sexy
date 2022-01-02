import 'mocha';
import { expect } from 'chai';
import { NumericEntityStub } from '@tests/unit/stubs/NumericEntityStub';
import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';

describe('InMemoryRepository', () => {
  describe('exists', () => {
    const sut = new InMemoryRepository<number, NumericEntityStub>(
      [new NumericEntityStub(1), new NumericEntityStub(2), new NumericEntityStub(3)],
    );

    describe('item exists', () => {
      const actual = sut.exists(1);
      it('returns true', () => expect(actual).to.be.true);
    });
    describe('item does not exist', () => {
      const actual = sut.exists(99);
      it('returns false', () => expect(actual).to.be.false);
    });
  });
  it('getItems gets initial items', () => {
    // arrange
    const expected = [
      new NumericEntityStub(1), new NumericEntityStub(2),
      new NumericEntityStub(3), new NumericEntityStub(4),
    ];

    // act
    const sut = new InMemoryRepository<number, NumericEntityStub>(expected);
    const actual = sut.getItems();

    // assert
    expect(actual).to.deep.equal(expected);
  });
  it('addItem adds', () => {
    // arrange
    const sut = new InMemoryRepository<number, NumericEntityStub>();
    const expected = {
      length: 1,
      item: new NumericEntityStub(1),
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
  it('removeItem removes', () => {
    // arrange
    const initialItems = [
      new NumericEntityStub(1), new NumericEntityStub(2),
      new NumericEntityStub(3), new NumericEntityStub(4),
    ];
    const idToDelete = 3;
    const expected = {
      length: 3,
      items: [new NumericEntityStub(1), new NumericEntityStub(2), new NumericEntityStub(4)],
    };
    const sut = new InMemoryRepository<number, NumericEntityStub>(initialItems);

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
      const initialItems = [new NumericEntityStub(1), new NumericEntityStub(2)];
      const newItem = new NumericEntityStub(3);
      const expected = [...initialItems, newItem];
      const sut = new InMemoryRepository<number, NumericEntityStub>(initialItems);
      // act
      sut.addOrUpdateItem(newItem);
      // assert
      const actual = sut.getItems();
      expect(actual).to.deep.equal(expected);
    });
    it('updates when item exists', () => {
      // arrange
      const initialItems = [new NumericEntityStub(1).withCustomProperty('bca')];
      const updatedItem = new NumericEntityStub(1).withCustomProperty('abc');
      const expected = [updatedItem];
      const sut = new InMemoryRepository<number, NumericEntityStub>(initialItems);
      // act
      sut.addOrUpdateItem(updatedItem);
      // assert
      const actual = sut.getItems();
      expect(actual).to.deep.equal(expected);
    });
  });
  describe('getById', () => {
    it('gets entity if it exists', () => {
      // arrange
      const expected = new NumericEntityStub(1).withCustomProperty('bca');
      const sut = new InMemoryRepository<number, NumericEntityStub>([
        expected, new NumericEntityStub(2).withCustomProperty('bca'),
        new NumericEntityStub(3).withCustomProperty('bca'), new NumericEntityStub(4).withCustomProperty('bca'),
      ]);
      // act
      const actual = sut.getById(expected.id);
      // assert
      expect(actual).to.deep.equal(expected);
    });
    it('gets undefined if it does not exist', () => {
      // arrange
      const sut = new InMemoryRepository<number, NumericEntityStub>([]);
      // act
      const actual = sut.getById(31);
      // assert
      expect(actual).to.equal(undefined);
    });
  });
});
