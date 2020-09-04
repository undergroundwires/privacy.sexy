import { ScriptStub } from './../stubs/ScriptStub';
import { CategoryStub } from './../stubs/CategoryStub';
import { Application } from '@/domain/Application';
import 'mocha';
import { expect } from 'chai';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { IProjectInformation } from '@/domain/IProjectInformation';

describe('Application', () => {
    it('getRecommendedScripts returns as expected', () => {
        // arrange
        const expected =  [
            new ScriptStub('S3').withIsRecommended(true),
            new ScriptStub('S4').withIsRecommended(true),
        ];
        const sut = new Application(createInformation(), [
            new CategoryStub(3).withScripts(expected[0], new ScriptStub('S1').withIsRecommended(false)),
            new CategoryStub(2).withScripts(expected[1], new ScriptStub('S2').withIsRecommended(false)),
        ]);
        // act
        const actual = sut.getRecommendedScripts();
        // assert
        expect(expected[0]).to.deep.equal(actual[0]);
        expect(expected[1]).to.deep.equal(actual[1]);
    });
    describe('parameter validation', () => {
        it('cannot construct without categories', () => {
            // arrange
            const categories = [];
            // act
            function construct() { return new Application(createInformation(), categories); }
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
            function construct() { return new Application(createInformation(), categories); }
            // assert
            expect(construct).to.throw('Application must consist of at least one script');
        });
        it('cannot construct without any recommended scripts', () => {
            // arrange
            const categories = [
                new CategoryStub(3).withScripts(new ScriptStub('S1').withIsRecommended(false)),
                new CategoryStub(2).withScripts(new ScriptStub('S2').withIsRecommended(false)),
            ];
            // act
            function construct() { return new Application(createInformation(), categories); }
            // assert
            expect(construct).to.throw('Application must consist of at least one recommended script');
        });
        it('cannot construct without information', () => {
            // arrange
            const categories = [new CategoryStub(1).withScripts(new ScriptStub('S1').withIsRecommended(true))];
            const information = undefined;
            // act
            function construct() { return new Application(information, categories); }
            // assert
            expect(construct).to.throw('info is undefined');
        });
    });
    it('totalScripts counts right', () => {
        // arrange
        const categories = [
            new CategoryStub(1).withScripts(new ScriptStub('S1').withIsRecommended(true)),
            new CategoryStub(2).withScripts(new ScriptStub('S2'), new ScriptStub('S3')),
            new CategoryStub(3).withCategories(new CategoryStub(4).withScripts(new ScriptStub('S4'))),
        ];
        // act
        const sut = new Application(createInformation(), categories);
        // assert
        expect(sut.totalScripts).to.equal(4);
    });
    it('totalCategories counts right', () => {
        // arrange
        const categories = [
            new CategoryStub(1).withScripts(new ScriptStub('S1').withIsRecommended(true)),
            new CategoryStub(2).withScripts(new ScriptStub('S2'), new ScriptStub('S3')),
            new CategoryStub(3).withCategories(new CategoryStub(4).withScripts(new ScriptStub('S4'))),
        ];
        // act
        const sut = new Application(createInformation(), categories);
        // assert
        expect(sut.totalCategories).to.equal(4);
    });
    it('sets information as expected', () => {
        // arrange
        const expected = createInformation();
        // act
        const sut = new Application(
            expected,
            [new CategoryStub(1).withScripts(new ScriptStub('S1').withIsRecommended(true))]);
        // assert
        expect(sut.info).to.deep.equal(expected);
    });
});

function createInformation(): IProjectInformation {
    return new ProjectInformation('name', 'repo', '0.1.0', 'homepage');
}
