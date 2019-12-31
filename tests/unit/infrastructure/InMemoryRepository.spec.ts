import { NumericEntityStub } from './../stubs/NumericEntityStub';
import { InMemoryRepository } from '@/infrastructure/Repository/InMemoryRepository';
import { expect } from 'chai';

describe('InMemoryRepository', () => {
    describe('exists', () => {
        const sut = new InMemoryRepository<number, NumericEntityStub>(
            [new NumericEntityStub(1), new NumericEntityStub(2), new NumericEntityStub(3)]);

        describe('item exists', () => {
            const actual = sut.exists(new NumericEntityStub(1));
            it('returns true', () => expect(actual).to.be.true);
        });
        describe('item does not exist', () => {
            const actual = sut.exists(new NumericEntityStub(99));
            it('returns false', () => expect(actual).to.be.false);
        });
    });
    it('can get', () => {
        // arrange
        const expected = [
            new NumericEntityStub(1), new NumericEntityStub(2), new NumericEntityStub(3), new NumericEntityStub(4)];

        // act
        const sut = new InMemoryRepository<number, NumericEntityStub>(expected);
        const actual = sut.getItems();

        // assert
        expect(actual).to.deep.equal(expected);
    });
    it('can add', () => {
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
    it('can remove', () => {
        // arrange
        const initialItems = [
            new NumericEntityStub(1), new NumericEntityStub(2), new NumericEntityStub(3), new NumericEntityStub(4)];
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
});
