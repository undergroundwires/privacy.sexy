import 'mocha';
import { expect } from 'chai';
import { IScript } from '@/domain/IScript';
import { SelectedScriptStub } from '../../../stubs/SelectedScriptStub';
import { ScriptStub } from '../../../stubs/ScriptStub';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { CategoryStub } from '../../../stubs/CategoryStub';
import { ApplicationStub } from '../../../stubs/ApplicationStub';
import { UserSelection } from '@/application/State/Selection/UserSelection';

describe('UserSelection', () => {
    describe('ctor', () => {
        it('has nothing with no initial selection', () => {
            // arrange
            const app = new ApplicationStub().withAction(new CategoryStub(1).withScriptIds('s1'));
            const selection = [];
            // act
            const sut = new UserSelection(app, selection);
            // assert
            expect(sut.selectedScripts).to.have.lengthOf(0);
        });
        it('has initial selection', () => {
            // arrange
            const firstScript = new ScriptStub('1');
            const secondScript = new ScriptStub('2');
            const app = new ApplicationStub().withAction(
                new CategoryStub(1).withScript(firstScript).withScripts(secondScript));
            const expected = [ new SelectedScript(firstScript, false), new SelectedScript(secondScript, true) ];
            // act
            const sut = new UserSelection(app, expected);
            // assert
            expect(sut.selectedScripts).to.deep.include(expected[0]);
            expect(sut.selectedScripts).to.deep.include(expected[1]);
        });
    });
    it('deselectAll removes all items', () => {
        // arrange
        const events: Array<readonly SelectedScript[]>  = [];
        const app = new ApplicationStub()
            .withAction(new CategoryStub(1)
                .withScriptIds('s1', 's2', 's3', 's4'));
        const selectedScripts = [
            new SelectedScriptStub('s1'), new SelectedScriptStub('s2'), new SelectedScriptStub('s3'),
        ];
        const sut = new UserSelection(app, selectedScripts);
        sut.changed.on((newScripts) => events.push(newScripts));
        // act
        sut.deselectAll();
        // assert
        expect(sut.selectedScripts).to.have.length(0);
        expect(events).to.have.lengthOf(1);
        expect(events[0]).to.have.length(0);
    });
    it('selectOnly selects expected', () => {
        // arrange
        const events: Array<readonly SelectedScript[]>  = [];
        const app = new ApplicationStub()
            .withAction(new CategoryStub(1)
                .withScriptIds('s1', 's2', 's3', 's4'));
        const selectedScripts = [
            new SelectedScriptStub('s1'), new SelectedScriptStub('s2'), new SelectedScriptStub('s3'),
        ];
        const sut = new UserSelection(app, selectedScripts);
        sut.changed.on((newScripts) => events.push(newScripts));
        const scripts = [new ScriptStub('s2'), new ScriptStub('s3'), new ScriptStub('s4')];
        const expected = [ new SelectedScriptStub('s2'), new SelectedScriptStub('s3'),
            new SelectedScript(scripts[2], false)];
        // act
        sut.selectOnly(scripts);
        // assert
        expect(sut.selectedScripts).to.have.deep.members(expected,
            `Expected: ${JSON.stringify(sut.selectedScripts)}\n` +
            `Actual: ${JSON.stringify(expected)}`);
        expect(events).to.have.lengthOf(1);
        expect(events[0]).to.deep.equal(expected);
    });
    it('selectAll selects as expected', () => {
        // arrange
        const events: Array<readonly SelectedScript[]>  = [];
        const scripts: IScript[] = [new ScriptStub('s1'), new ScriptStub('s2'), new ScriptStub('s3'), new ScriptStub('s4')];
        const app = new ApplicationStub()
            .withAction(new CategoryStub(1)
                .withScripts(...scripts));
        const sut = new UserSelection(app, []);
        sut.changed.on((newScripts) => events.push(newScripts));
        const expected = scripts.map((script) => new SelectedScript(script, false));
        // act
        sut.selectAll();
        // assert
        expect(sut.selectedScripts).to.deep.equal(expected);
        expect(events).to.have.lengthOf(1);
        expect(events[0]).to.deep.equal(expected);
    });
    describe('addOrUpdateSelectedScript', () => {
        it('adds when item does not exist', () => {
            // arrange
            const events: Array<readonly SelectedScript[]>  = [];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(1)
                    .withScripts(new ScriptStub('s1'), new ScriptStub('s2')));
            const sut = new UserSelection(app, []);
            sut.changed.on((scripts) => events.push(scripts));
            const expected = [ new SelectedScript(new ScriptStub('s1'), false) ];
            // act
            sut.addOrUpdateSelectedScript('s1', false);
            // assert
            expect(sut.selectedScripts).to.deep.equal(expected);
            expect(events).to.have.lengthOf(1);
            expect(events[0]).to.deep.equal(expected);
        });
        it('updates when item exists', () => {
            // arrange
            const events: Array<readonly SelectedScript[]>  = [];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(1)
                    .withScripts(new ScriptStub('s1'), new ScriptStub('s2')));
            const sut = new UserSelection(app, []);
            sut.changed.on((scripts) => events.push(scripts));
            const expected = [ new SelectedScript(new ScriptStub('s1'), true) ];
            // act
            sut.addOrUpdateSelectedScript('s1', true);
            // assert
            expect(sut.selectedScripts).to.deep.equal(expected);
            expect(events).to.have.lengthOf(1);
            expect(events[0]).to.deep.equal(expected);
        });
    });
    describe('removeAllInCategory', () => {
        it('does nothing when nothing exists', () => {
            // arrange
            const events: Array<readonly SelectedScript[]>  = [];
            const categoryId = 1;
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                    .withScripts(new ScriptStub('s1'), new ScriptStub('s2')));
            const sut = new UserSelection(app, []);
            sut.changed.on((s) => events.push(s));
            // act
            sut.removeAllInCategory(categoryId);
            // assert
            expect(events).to.have.lengthOf(0);
            expect(sut.selectedScripts).to.have.lengthOf(0);
        });
        it('removes all when all exists', () => {
            // arrange
            const categoryId = 1;
            const scripts = [new SelectedScriptStub('s1'), new SelectedScriptStub('s2')];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                    .withScripts(...scripts.map((script) => script.script)));
            const sut = new UserSelection(app, scripts);
            // act
            sut.removeAllInCategory(categoryId);
            // assert
            expect(sut.totalSelected).to.equal(0);
            expect(sut.selectedScripts.length).to.equal(0);
        });
        it('removes existing some exists', () => {
            // arrange
            const categoryId = 1;
            const existing = [new ScriptStub('s1'), new ScriptStub('s2')];
            const notExisting = [new ScriptStub('s3'), new ScriptStub('s4')];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                    .withScripts(...existing, ...notExisting));
            const sut = new UserSelection(app, existing.map((script) => new SelectedScript(script, false)));
            // act
            sut.removeAllInCategory(categoryId);
            // assert
            expect(sut.totalSelected).to.equal(0);
            expect(sut.selectedScripts.length).to.equal(0);
        });
    });
    describe('addOrUpdateAllInCategory', () => {
        it('does nothing when all already exists', () => {
            // arrange
            const events: Array<readonly SelectedScript[]>  = [];
            const categoryId = 1;
            const scripts = [new ScriptStub('s1'), new ScriptStub('s2')];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                    .withScripts(...scripts));
            const sut = new UserSelection(app, scripts.map((script) => new SelectedScript(script, false)));
            sut.changed.on((s) => events.push(s));
            // act
            sut.addOrUpdateAllInCategory(categoryId);
            // assert
            expect(events).to.have.lengthOf(0);
            expect(sut.selectedScripts.map((script) => script.id))
                .to.have.deep.members(scripts.map((script) => script.id));
        });
        it('adds all when nothing exists', () => {
            // arrange
            const categoryId = 1;
            const expected = [new ScriptStub('s1'), new ScriptStub('s2')];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                    .withScripts(...expected));
            const sut = new UserSelection(app, []);
            // act
            sut.addOrUpdateAllInCategory(categoryId);
            // assert
            expect(sut.selectedScripts.map((script) => script.id))
                .to.have.deep.members(expected.map((script) => script.id));
        });
        it('adds all with given revert status when nothing exists', () => {
            // arrange
            const categoryId = 1;
            const expected = [new ScriptStub('s1'), new ScriptStub('s2')];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                    .withScripts(...expected));
            const sut = new UserSelection(app, []);
            // act
            sut.addOrUpdateAllInCategory(categoryId, true);
            // assert
            expect(sut.selectedScripts.every((script) => script.revert))
                .to.equal(true);
        });
        it('changes revert status of all when some exists', () => {
            // arrange
            const categoryId = 1;
            const notExisting = [ new ScriptStub('notExisting1'), new ScriptStub('notExisting2') ];
            const existing = [ new ScriptStub('existing1'), new ScriptStub('existing2') ];
            const allScripts = [ ...existing, ...notExisting ];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                .withScripts(...allScripts));
            const sut = new UserSelection(app, existing.map((script) => new SelectedScript(script, false)));
            // act
            sut.addOrUpdateAllInCategory(categoryId, true);
            // assert
            expect(sut.selectedScripts.every((script) => script.revert))
                .to.equal(true);
        });
        it('changes revert status of all when some exists', () => {
            // arrange
            const categoryId = 1;
            const notExisting = [ new ScriptStub('notExisting1'), new ScriptStub('notExisting2') ];
            const existing = [ new ScriptStub('existing1'), new ScriptStub('existing2') ];
            const allScripts = [ ...existing, ...notExisting ];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                .withScripts(...allScripts));
            const sut = new UserSelection(app, existing.map((script) => new SelectedScript(script, false)));
            // act
            sut.addOrUpdateAllInCategory(categoryId, true);
            // assert
            expect(sut.selectedScripts.every((script) => script.revert))
                .to.equal(true);
        });
        it('changes revert status of all when all already exists', () => {
            // arrange
            const categoryId = 1;
            const scripts = [ new ScriptStub('existing1'), new ScriptStub('existing2') ];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                .withScripts(...scripts));
            const sut = new UserSelection(app, scripts.map((script) => new SelectedScript(script, false)));
            // act
            sut.addOrUpdateAllInCategory(categoryId, true);
            // assert
            expect(sut.selectedScripts.every((script) => script.revert))
                .to.equal(true);
        });
    });
    describe('isSelected', () => {
        it('returns false when not selected', () => {
            // arrange
            const selectedScript = new ScriptStub('selected');
            const notSelectedScript = new ScriptStub('not selected');
            const app = new ApplicationStub()
                .withAction(new CategoryStub(1)
                .withScripts(selectedScript, notSelectedScript));
            const sut = new UserSelection(app, [ new SelectedScript(selectedScript, false) ]);
            // act
            const actual = sut.isSelected(notSelectedScript.id);
            // assert
            expect(actual).to.equal(false);
        });
        it('returns true when selected', () => {
            // arrange
            const selectedScript = new ScriptStub('selected');
            const notSelectedScript = new ScriptStub('not selected');
            const app = new ApplicationStub()
                .withAction(new CategoryStub(1)
                .withScripts(selectedScript, notSelectedScript));
            const sut = new UserSelection(app, [ new SelectedScript(selectedScript, false) ]);
            // act
            const actual = sut.isSelected(selectedScript.id);
            // assert
            expect(actual).to.equal(true);
        });
    });
    describe('category state', () => {
        describe('when no scripts are selected', () => {
            // arrange
            const category = new CategoryStub(1)
                .withScriptIds('non-selected-script-1', 'non-selected-script-2');
            const app = new ApplicationStub().withAction(category);
            const sut = new UserSelection(app, [ ]);
            it('areAllSelected returns false', () => {
                // act
                const actual = sut.areAllSelected(category);
                // assert
                expect(actual).to.equal(false);
            });
            it('isAnySelected returns false', () => {
                // act
                const actual = sut.isAnySelected(category);
                // assert
                expect(actual).to.equal(false);
            });
        });
        describe('when no subscript exists in selected scripts', () => {
            // arrange
            const category = new CategoryStub(1)
                .withScriptIds('non-selected-script-1', 'non-selected-script-2');
            const selectedScript = new ScriptStub('selected');
            const app = new ApplicationStub()
                .withAction(category)
                .withAction(new CategoryStub(22).withScript(selectedScript));
            const sut = new UserSelection(app, [ new SelectedScript(selectedScript, false) ]);
            it('areAllSelected returns false', () => {
                // act
                const actual = sut.areAllSelected(category);
                // assert
                expect(actual).to.equal(false);
            });
            it('isAnySelected returns false', () => {
                // act
                const actual = sut.isAnySelected(category);
                // assert
                expect(actual).to.equal(false);
            });
        });
        describe('when one of the scripts are selected', () => {
            // arrange
            const selectedScript = new ScriptStub('selected');
            const category = new CategoryStub(1)
                .withScriptIds('non-selected-script-1', 'non-selected-script-2')
                .withCategory(new CategoryStub(12).withScript(selectedScript));
            const app = new ApplicationStub().withAction(category);
            const sut = new UserSelection(app, [ new SelectedScript(selectedScript, false) ]);
            it('areAllSelected returns false', () => {
                // act
                const actual = sut.areAllSelected(category);
                // assert
                expect(actual).to.equal(false);
            });
            it('isAnySelected returns true', () => {
                // act
                const actual = sut.isAnySelected(category);
                // assert
                expect(actual).to.equal(true);
            });
        });
        describe('when all scripts are selected', () => {
            // arrange
            const firstSelectedScript = new ScriptStub('selected1');
            const secondSelectedScript = new ScriptStub('selected2');
            const category = new CategoryStub(1)
                .withScript(firstSelectedScript)
                .withCategory(new CategoryStub(12).withScript(secondSelectedScript));
            const app = new ApplicationStub().withAction(category);
            const sut = new UserSelection(app,
                [ firstSelectedScript, secondSelectedScript ].map((s) => new SelectedScript(s, false)));
            it('areAllSelected returns true', () => {
                // act
                const actual = sut.areAllSelected(category);
                // assert
                expect(actual).to.equal(true);
            });
            it('isAnySelected returns true', () => {
                // act
                const actual = sut.isAnySelected(category);
                // assert
                expect(actual).to.equal(true);
            });
        });

    });
});
