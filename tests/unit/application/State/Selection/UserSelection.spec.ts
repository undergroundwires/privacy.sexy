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
});
