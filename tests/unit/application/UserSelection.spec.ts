import { CategoryStub } from './../stubs/CategoryStub';
import { ApplicationStub } from './../stubs/ApplicationStub';
import { ScriptStub } from './../stubs/ScriptStub';
import { UserSelection } from '@/application/State/Selection/UserSelection';
import 'mocha';
import { expect } from 'chai';


describe('UserSelection', () => {
    it('deselectAll removes all items', async () => {
        // arrange
        const app = new ApplicationStub()
            .withCategory(new CategoryStub(1)
                .withScriptIds('s1', 's2', 's3', 's4'));
        const selectedScripts = [new ScriptStub('s1'), new ScriptStub('s2'), new ScriptStub('s3')];
        const sut = new UserSelection(app, selectedScripts);

        // act
        sut.deselectAll();
        const actual = sut.selectedScripts;

        // assert
        expect(actual, JSON.stringify(sut.selectedScripts)).to.have.length(0);
    });
    it('selectOnly selects expected', async () => {
        // arrange
        const app = new ApplicationStub()
            .withCategory(new CategoryStub(1)
            .withScriptIds('s1', 's2', 's3', 's4'));
        const selectedScripts = [new ScriptStub('s1'), new ScriptStub('s2'), new ScriptStub('s3')];
        const sut = new UserSelection(app, selectedScripts);
        const expected = [new ScriptStub('s2'), new ScriptStub('s3'), new ScriptStub('s4')];

        // act
        sut.selectOnly(expected);
        const actual = sut.selectedScripts;

        // assert
        expect(actual).to.deep.equal(expected);
    });
});
