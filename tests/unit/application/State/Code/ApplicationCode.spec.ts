import { CategoryStub } from './../../../stubs/CategoryStub';
import { ScriptStub } from './../../../stubs/ScriptStub';
import { ApplicationStub } from './../../../stubs/ApplicationStub';
import { UserSelection } from '@/application/State/Selection/UserSelection';
import { ApplicationCode } from '@/application/State/Code/ApplicationCode';
import 'mocha';
import { expect } from 'chai';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';

describe('ApplicationCode', () => {
    describe('ctor', () => {
        it('empty when selection is empty', () => {
            // arrange
            const selection = new UserSelection(new ApplicationStub(), []);
            const sut = new ApplicationCode(selection, 'version');
            // act
            const actual = sut.current;
            // assert
            expect(actual).to.have.lengthOf(0);
        });
        it('has code when selection is not empty', () => {
            // arrange
            const scripts = [new ScriptStub('first'), new ScriptStub('second')];
            const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
            const selection = new UserSelection(app, scripts);
            const version = 'version-string';
            const sut = new ApplicationCode(selection, version);
            // act
            const actual = sut.current;
            // assert
            expect(actual).to.have.length.greaterThan(0).and.include(version);
        });
    });
    describe('user selection changes', () => {
        it('empty when selection is empty', () => {
            // arrange
            let signaled: string;
            const scripts = [new ScriptStub('first'), new ScriptStub('second')];
            const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
            const selection = new UserSelection(app, scripts);
            const sut = new ApplicationCode(selection, 'version');
            sut.changed.on((code) => signaled = code);
            // act
            selection.changed.notify([]);
            // assert
            expect(signaled).to.have.lengthOf(0);
            expect(signaled).to.equal(sut.current);
        });
        it('has code when selection is not empty', () => {
            // arrange
            let signaled: string;
            const scripts = [new ScriptStub('first'), new ScriptStub('second')];
            const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
            const selection = new UserSelection(app, scripts);
            const version = 'version-string';
            const sut = new ApplicationCode(selection, version);
            sut.changed.on((code) => signaled = code);
            // act
            selection.changed.notify(scripts.map((s) => new SelectedScript(s, false)));
            // assert
            expect(signaled).to.have.length.greaterThan(0).and.include(version);
            expect(signaled).to.equal(sut.current);
        });
    });
});
