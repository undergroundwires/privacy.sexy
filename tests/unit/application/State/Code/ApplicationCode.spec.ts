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
import { ScriptingDefinitionStub } from './../../../stubs/ScriptingDefinitionStub';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { IUserScript } from '@/application/State/Code/Generation/IUserScript';

// TODO: Test scriptingDefinition: IScriptingDefinition logic

describe('ApplicationCode', () => {
    describe('ctor', () => {
        it('empty when selection is empty', () => {
            // arrange
            const selection = new UserSelection(new ApplicationStub(), []);
            const definition = new ScriptingDefinitionStub();
            const sut = new ApplicationCode(selection, definition);
            // act
            const actual = sut.current;
            // assert
            expect(actual).to.have.lengthOf(0);
        });
        it('generates code from script generator when selection is not empty', () => {
            // arrange
            const scripts = [new ScriptStub('first'), new ScriptStub('second')];
            const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
            const selection = new UserSelection(app, scripts.map((script) => script.toSelectedScript()));
            const definition = new ScriptingDefinitionStub();
            const expected: IUserScript = {
                code: 'expected-code',
                scriptPositions: new Map(),
            };
            const generator = new UserScriptGeneratorMock()
                .plan({ scripts: selection.selectedScripts, definition }, expected);
            const sut = new ApplicationCode(selection, definition, generator);
            // act
            const actual = sut.current;
            // assert
            expect(actual).to.equal(expected.code);
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
                const definition = new ScriptingDefinitionStub();
                const sut = new ApplicationCode(selection, definition);
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
                const definition = new ScriptingDefinitionStub();
                const sut = new ApplicationCode(selection, definition);
                sut.changed.on((code) => signaled = code);
                // act
                selection.changed.notify(scripts.map((s) => new SelectedScript(s, false)));
                // assert
                expect(signaled.code).to.have.length.greaterThan(0);
                expect(signaled.code).to.equal(sut.current);
            });
        });
        describe('calls UserScriptGenerator', () => {
            it('sends scripting definition to generator', () => {
                // arrange
                const expectedDefinition = new ScriptingDefinitionStub();
                const app = new ApplicationStub();
                const selection = new UserSelection(app, []);
                const generatorMock: IUserScriptGenerator = {
                    buildCode: (selectedScripts, definition) => {
                        if (definition !== expectedDefinition) {
                            throw new Error('Unexpected scripting definition');
                        }
                        return {
                            code: '',
                            scriptPositions: new Map<SelectedScript, ICodePosition>(),
                        };
                    },
                };
                // tslint:disable-next-line:no-unused-expression
                new ApplicationCode(selection, expectedDefinition, generatorMock);
                // act
                const act = () => selection.changed.notify([]);
                // assert
                expect(act).to.not.throw();
            });
            it('sends selected scripts to generator', () => {
                // arrange
                const expectedDefinition = new ScriptingDefinitionStub();
                const scripts = [new ScriptStub('first'), new ScriptStub('second')];
                const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
                const selection = new UserSelection(app, scripts.map((script) => new SelectedScript(script, false)));
                const scriptsToSelect = scripts.map((s) => new SelectedScript(s, false));
                const generatorMock: IUserScriptGenerator = {
                    buildCode: (selectedScripts) => {
                        if (JSON.stringify(selectedScripts) !== JSON.stringify(scriptsToSelect)) {
                            throw new Error('Unexpected scripts');
                        }
                        return {
                            code: '',
                            scriptPositions: new Map<SelectedScript, ICodePosition>(),
                        };
                    },
                };
                // tslint:disable-next-line:no-unused-expression
                new ApplicationCode(selection, expectedDefinition, generatorMock);
                // act
                const act = () => selection.changed.notify(scriptsToSelect);
                // assert
                expect(act).to.not.throw();
            });
            it('sets positions from the generator', () => {
                // arrange
                let signaled: ICodeChangedEvent;
                const scripts = [new ScriptStub('first'), new ScriptStub('second')];
                const app = new ApplicationStub().withAction(new CategoryStub(1).withScripts(...scripts));
                const selection = new UserSelection(app, scripts.map((script) => new SelectedScript(script, false)));
                const scriptingDefinition = new ScriptingDefinitionStub();
                const scriptsToSelect = scripts.map((s) => new SelectedScript(s, false));
                const totalLines = 20;
                const expected = new Map<SelectedScript, ICodePosition>(
                    [
                        [scriptsToSelect[0], new CodePosition(0, totalLines / 2)],
                        [scriptsToSelect[1], new CodePosition(totalLines / 2, totalLines)],
                    ],
                );
                const generatorMock: IUserScriptGenerator = {
                    buildCode: () => {
                        return {
                            code: '\nREM LINE'.repeat(totalLines),
                            scriptPositions: expected,
                        };
                    },
                };
                const sut = new ApplicationCode(selection, scriptingDefinition, generatorMock);
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
});

interface IScriptGenerationParameters {
    scripts: readonly SelectedScript[];
    definition: IScriptingDefinition;
}
class UserScriptGeneratorMock implements IUserScriptGenerator {
    private prePlanned = new Map<IScriptGenerationParameters, IUserScript>();
    public plan(
        parameters: IScriptGenerationParameters,
        result: IUserScript): UserScriptGeneratorMock {
        this.prePlanned.set(parameters, result);
        return this;
    }
    public buildCode(
        selectedScripts: readonly SelectedScript[],
        scriptingDefinition: IScriptingDefinition): IUserScript {
        for (const [parameters, result] of Array.from(this.prePlanned)) {
            if (selectedScripts === parameters.scripts
                && scriptingDefinition === parameters.definition) {
                return result;
            }
        }
        throw new Error('Unexpected parameters');
    }
}
