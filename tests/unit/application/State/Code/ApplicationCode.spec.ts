import 'mocha';
import { expect } from 'chai';
import { CategoryStub } from './../../../stubs/CategoryStub';
import { ScriptStub } from './../../../stubs/ScriptStub';
import { ApplicationStub } from './../../../stubs/ApplicationStub';
import { UserSelection } from '@/application/State/Selection/UserSelection';
import { ApplicationCode } from '@/application/State/Code/ApplicationCode';
import { SelectedScript } from '@/application/State/Selection/SelectedScript';
import { ICodeChangedEvent } from '@/application/State/Code/Event/ICodeChangedEvent';
import { IUserScriptGenerator } from '@/application/State/Code/Generation/IUserScriptGenerator';
import { CodePosition } from '@/application/State/Code/Position/CodePosition';
import { ICodePosition } from '@/application/State/Code/Position/ICodePosition';

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
            const selection = new UserSelection(app, scripts.map((script) => new SelectedScript(script, false)));
            const version = 'version-string';
            const sut = new ApplicationCode(selection, version);
            // act
            const actual = sut.current;
            // assert
            expect(actual).to.have.length.greaterThan(0).and.include(version);
        });
    });
    describe('changed event', () => {
        describe('code', () => {
            it('empty when nothing is selected', () => {
                // arrange
                let signaled: ICodeChangedEvent;
                const scripts = [new ScriptStub('first'), new ScriptStub('second')];
                const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
                const selection = new UserSelection(app, scripts.map((script) => new SelectedScript(script, false)));
                const sut = new ApplicationCode(selection, 'version');
                sut.changed.on((code) => signaled = code);
                // act
                selection.changed.notify([]);
                // assert
                expect(signaled.code).to.have.lengthOf(0);
                expect(signaled.code).to.equal(sut.current);
            });
            it('has code when some are selected', () => {
                // arrange
                let signaled: ICodeChangedEvent;
                const scripts = [new ScriptStub('first'), new ScriptStub('second')];
                const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
                const selection = new UserSelection(app, scripts.map((script) => new SelectedScript(script, false)));
                const version = 'version-string';
                const sut = new ApplicationCode(selection, version);
                sut.changed.on((code) => signaled = code);
                // act
                selection.changed.notify(scripts.map((s) => new SelectedScript(s, false)));
                // assert
                expect(signaled.code).to.have.length.greaterThan(0).and.include(version);
                expect(signaled.code).to.equal(sut.current);
            });
        });
        it('sets positions from the generator', () => {
            // arrange
            let signaled: ICodeChangedEvent;
            const scripts = [new ScriptStub('first'), new ScriptStub('second')];
            const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
            const selection = new UserSelection(app, scripts.map((script) => new SelectedScript(script, false)));
            const expectedVersion = 'version-string';
            const scriptsToSelect = scripts.map((s) => new SelectedScript(s, false));
            const totalLines = 20;
            const expected = new Map<SelectedScript, ICodePosition>(
                [
                    [ scriptsToSelect[0], new CodePosition(0, totalLines / 2)],
                    [ scriptsToSelect[1], new CodePosition(totalLines / 2, totalLines)],
                ],
            );
            const generatorMock: IUserScriptGenerator = {
                buildCode: (selectedScripts, version) => {
                    if (version !== expectedVersion) {
                        throw new Error('Unexpected version');
                    }
                    if (JSON.stringify(selectedScripts) !== JSON.stringify(scriptsToSelect)) {
                        throw new Error('Unexpected scripts');
                    }
                    return {
                        code: '\nREM LINE'.repeat(totalLines),
                        scriptPositions: expected,
                    };
                },
            };
            const sut = new ApplicationCode(selection, expectedVersion, generatorMock);
            sut.changed.on((code) => signaled = code);
            // act
            selection.changed.notify(scriptsToSelect);
            // assert
            expect(signaled.getScriptPositionInCode(scripts[0]))
                .to.deep.equal(expected.get(scriptsToSelect[0]));
            expect(signaled.getScriptPositionInCode(scripts[1]))
                .to.deep.equal(expected.get(scriptsToSelect[1]));
        });
    });
});
