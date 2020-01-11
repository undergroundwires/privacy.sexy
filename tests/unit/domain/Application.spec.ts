import { ScriptStub } from './../stubs/ScriptStub';
import { CategoryStub } from './../stubs/CategoryStub';
import { Application } from './../../../src/domain/Application';
import 'mocha';
import { expect } from 'chai';

describe('Application', () => {
    it('getRecommendedScripts returns as expected', () => {
        // arrange
        const expected =  [
            new ScriptStub('S3').withIsRecommended(true),
            new ScriptStub('S4').withIsRecommended(true),
        ];
        const sut = new Application('name', 'repo', 2, [
            new CategoryStub(3).withScripts(expected[0], new ScriptStub('S1').withIsRecommended(false)),
            new CategoryStub(2).withScripts(expected[1], new ScriptStub('S2').withIsRecommended(false)),
        ]);

        // act
        const actual = sut.getRecommendedScripts();

        // assert
        expect(expected[0]).to.deep.equal(actual[0]);
        expect(expected[1]).to.deep.equal(actual[1]);
    });
    it('cannot construct without categories', () => {
        // arrange
        const categories = [];

        // act
        function construct() { return new Application('name', 'repo', 2, categories); }

        // assert
        expect(construct).to.throw('Application must consist of at least one category');
    });
    it('cannot construct without scripts', () => {
        // arrange
        const categories = [
            new CategoryStub(3),
            new CategoryStub(2),
        ];

        // act
        function construct() { return new Application('name', 'repo',  2, categories); }

        // assert
        expect(construct).to.throw('Application must consist of at least one script');
    });
    it('cannot construct without  any recommended scripts', () => {
        // arrange
        const categories = [
            new CategoryStub(3).withScripts(new ScriptStub('S1').withIsRecommended(false)),
            new CategoryStub(2).withScripts(new ScriptStub('S2').withIsRecommended(false)),
        ];

        // act
        function construct() { return new Application('name', 'repo', 2, categories); }

        // assert
        expect(construct).to.throw('Application must consist of at least one recommended script');
    });
});
