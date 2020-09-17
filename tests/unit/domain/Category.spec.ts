import 'mocha';
import { expect } from 'chai';
import { Category } from '@/domain/Category';
import { CategoryStub } from '../stubs/CategoryStub';
import { ScriptStub } from '../stubs/ScriptStub';

describe('Category', () => {
    describe('ctor', () => {
        it('throws when name is empty', () => {
            const expectedError = 'undefined or empty name';
            const construct = () => new Category(5, '', [], [new CategoryStub(5)], []);
            expect(construct).to.throw(expectedError);
        });
        it('throws when has no children', () => {
            const expectedError = 'A category must have at least one sub-category or script';
            const construct = () => new Category(5, 'category', [], [], []);
            expect(construct).to.throw(expectedError);
        });
    });
    describe('getAllScriptsRecursively', () => {
        it('gets child scripts', () => {
            // arrange
            const expected = [ new ScriptStub('1'), new ScriptStub('2') ];
            const sut = new Category(0, 'category', [], [], expected);
            // act
            const actual = sut.getAllScriptsRecursively();
            // assert
            expect(actual).to.have.deep.members(expected);
        });
        it('gets child categories', () => {
            // arrange
            const expectedScriptIds = ['1', '2', '3', '4'];
            const categories = [
                new CategoryStub(31).withScriptIds('1', '2'),
                new CategoryStub(32).withScriptIds('3', '4'),
            ];
            const sut = new Category(0, 'category', [], categories, []);
            // act
            const actualIds = sut.getAllScriptsRecursively().map((s) => s.id);
            // assert
            expect(actualIds).to.have.deep.members(expectedScriptIds);

        });
        it('gets child scripts and categories', () => {
            // arrange
            const expectedScriptIds = ['1', '2', '3', '4', '5' , '6'];
            const categories = [
                new CategoryStub(31).withScriptIds('1', '2'),
                new CategoryStub(32).withScriptIds('3', '4'),
            ];
            const scripts = [ new ScriptStub('5'), new ScriptStub('6') ];
            const sut = new Category(0, 'category', [], categories, scripts);
            // act
            const actualIds = sut.getAllScriptsRecursively().map((s) => s.id);
            // assert
            expect(actualIds).to.have.deep.members(expectedScriptIds);

        });
        it('gets child categories recursively', () => {
            // arrange
            const expectedScriptIds = ['1', '2', '3', '4', '5', '6'];
            const categories = [
                new CategoryStub(31)
                    .withScriptIds('1', '2')
                    .withCategory(
                        new CategoryStub(32)
                            .withScriptIds('3', '4'),
                    ),
                new CategoryStub(33)
                    .withCategories(
                        new CategoryStub(34)
                            .withScriptIds('5')
                            .withCategory(
                                new CategoryStub(35)
                                    .withCategory(
                                        new CategoryStub(35).withScriptIds('6'),
                                    ),
                            ),
                    ),
            ];
            // assert
            const sut = new Category(0, 'category', [], categories, []);
            // act
            const actualIds = sut.getAllScriptsRecursively().map((s) => s.id);
            // assert
            expect(actualIds).to.have.deep.members(expectedScriptIds);
        });
    });
    describe('includes', () => {
        it('return false when does not include', () => {
            // assert
            const script = new ScriptStub('3');
            const sut = new Category(0, 'category', [], [new CategoryStub(33).withScriptIds('1', '2')], []);
            // act
            const actual = sut.includes(script);
            // assert
            expect(actual).to.equal(false);
        });
        it('return true when includes as subscript', () => {
            // assert
            const script = new ScriptStub('3');
            const sut = new Category(0, 'category', [], [
                new CategoryStub(33).withScript(script).withScriptIds('non-related'),
            ], []);
            // act
            const actual = sut.includes(script);
            // assert
            expect(actual).to.equal(true);
        });
        it('return true when includes as nested category script', () => {
            // assert
            const script = new ScriptStub('3');
            const sut = new Category(11, 'category', [],
                [
                    new CategoryStub(22)
                        .withScriptIds('non-relatedd')
                        .withCategory(new CategoryStub(33).withScript(script)),
                ],
            []);
            // act
            const actual = sut.includes(script);
            // assert
            expect(actual).to.equal(true);
        });
    });
});
