import { ScriptStub } from './../../../stubs/ScriptStub';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { CategoryStub } from '../../../stubs/CategoryStub';
import { ApplicationStub } from '../../../stubs/ApplicationStub';
import { UserSelection } from '@/application/State/Selection/UserSelection';
import 'mocha';
import { expect } from 'chai';
import { IScript } from '@/domain/IScript';

describe('UserSelection', () => {
    it('deselectAll removes all items', () => {
        // arrange
        const events: Array<readonly SelectedScript[]>  = [];
        const app = new ApplicationStub()
            .withAction(new CategoryStub(1)
                .withScriptIds('s1', 's2', 's3', 's4'));
        const selectedScripts = [new ScriptStub('s1'), new ScriptStub('s2'), new ScriptStub('s3')];
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
        const selectedScripts = [new ScriptStub('s1'), new ScriptStub('s2'), new ScriptStub('s3')];
        const sut = new UserSelection(app, selectedScripts);
        sut.changed.on((newScripts) => events.push(newScripts));
        const scripts = [new ScriptStub('s2'), new ScriptStub('s3'), new ScriptStub('s4')];
        const expected = scripts.map((script) => new SelectedScript(script, false));
        // act
        sut.selectOnly(scripts);
        // assert
        expect(sut.selectedScripts).to.deep.equal(expected);
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
            const scripts = [new ScriptStub('s1'), new ScriptStub('s2')];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                    .withScripts(...scripts));
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
            const sut = new UserSelection(app, existing);
            // act
            sut.removeAllInCategory(categoryId);
            // assert
            expect(sut.totalSelected).to.equal(0);
            expect(sut.selectedScripts.length).to.equal(0);
        });
    });
    describe('addAllInCategory', () => {
        it('does nothing when all already exists', () => {
            // arrange
            const events: Array<readonly SelectedScript[]>  = [];
            const categoryId = 1;
            const scripts = [new ScriptStub('s1'), new ScriptStub('s2')];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                    .withScripts(...scripts));
            const sut = new UserSelection(app, scripts);
            sut.changed.on((s) => events.push(s));
            // act
            sut.addAllInCategory(categoryId);
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
            sut.addAllInCategory(categoryId);
            // assert
            expect(sut.selectedScripts.map((script) => script.id))
                .to.have.deep.members(expected.map((script) => script.id));
        });
        it('adds not existing some exists', () => {
            // arrange
            const categoryId = 1;
            const notExisting = [ new ScriptStub('notExisting1'), new ScriptStub('notExisting2') ];
            const existing = [ new ScriptStub('existing1'), new ScriptStub('existing2') ];
            const allScripts = [ ...existing, ...notExisting ];
            const app = new ApplicationStub()
                .withAction(new CategoryStub(categoryId)
                .withScripts(...allScripts));
            const sut = new UserSelection(app, existing);
            // act
            sut.addAllInCategory(categoryId);
            // assert
            expect(sut.selectedScripts.map((script) => script.id))
                .to.have.deep.members(allScripts.map((script) => script.id));
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
            const sut = new UserSelection(app, [ selectedScript ]);
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
            const sut = new UserSelection(app, [ selectedScript ]);
            // act
            const actual = sut.isSelected(selectedScript.id);
            // assert
            expect(actual).to.equal(true);
        });
    });
});
