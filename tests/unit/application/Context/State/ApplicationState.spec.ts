import { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { ApplicationCode } from '@/application/Context/State/Code/ApplicationCode';
import { ScriptStub } from '../../../stubs/ScriptStub';
import { CategoryStub } from '../../../stubs/CategoryStub';
import { ApplicationStub } from '../../../stubs/ApplicationStub';
import 'mocha';
import { expect } from 'chai';
import { ApplicationState } from '@/application/Context/State/ApplicationState';
import { IScript } from '@/domain/IScript';

describe('ApplicationState', () => {
    describe('code', () => {
        it('initialized with empty code', () => {
            // arrange
            const app = new ApplicationStub();
            const sut = new ApplicationState(app);
            // act
            const code = sut.code.current;
            // assert
            expect(!code);
        });
        it('reacts to selection changes as expected', () => {
            // arrange
            const app = new ApplicationStub().withAction(new CategoryStub(0).withScriptIds('scriptId'));
            const selectionStub = new UserSelection(app, []);
            const expectedCodeGenerator = new ApplicationCode(selectionStub, app.scripting);
            selectionStub.selectAll();
            const expectedCode = expectedCodeGenerator.current;
            // act
            const sut = new ApplicationState(app);
            sut.selection.selectAll();
            const actualCode = sut.code.current;
            // assert
            expect(actualCode).to.equal(expectedCode);
        });
    });
    describe('selection', () => {
        it('initialized with no selection', () => {
            // arrange
            const app = new ApplicationStub();
            const sut = new ApplicationState(app);
            // act
            const actual = sut.selection.totalSelected;
            // assert
            expect(actual).to.equal(0);
        });
        it('can select a script from current application', () => {
            // arrange
            const expectedScript = new ScriptStub('scriptId');
            const app = new ApplicationStub().withAction(new CategoryStub(0).withScript(expectedScript));
            const sut = new ApplicationState(app);
            // act
            sut.selection.selectAll();
            // assert
            expect(sut.selection.totalSelected).to.equal(1);
            expect(sut.selection.isSelected(expectedScript.id)).to.equal(true);
        });
    });
    describe('filter', () => {
        it('initialized with an empty filter', () => {
            // arrange
            const app = new ApplicationStub();
            const sut = new ApplicationState(app);
            // act
            const actual = sut.filter.currentFilter;
            // assert
            expect(actual).to.equal(undefined);
        });
        it('can match a script from current application', () => {
            // arrange
            const scriptNameFilter = 'scriptName';
            const expectedScript = new ScriptStub('scriptId').withName(scriptNameFilter);
            const app = new ApplicationStub()
                .withAction(new CategoryStub(0).withScript(expectedScript));
            const sut = new ApplicationState(app);
            // act
            let actualScript: IScript;
            sut.filter.filtered.on((result) => actualScript = result.scriptMatches[0]);
            sut.filter.setFilter(scriptNameFilter);
            // assert
            expect(expectedScript).to.equal(actualScript);
        });
    });
});
