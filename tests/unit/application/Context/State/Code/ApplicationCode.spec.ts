import 'mocha';
import { expect } from 'chai';
import { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { ApplicationCode } from '@/application/Context/State/Code/ApplicationCode';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { ICodeChangedEvent } from '@/application/Context/State/Code/Event/ICodeChangedEvent';
import { IUserScriptGenerator } from '@/application/Context/State/Code/Generation/IUserScriptGenerator';
import { CodePosition } from '@/application/Context/State/Code/Position/CodePosition';
import { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { IUserScript } from '@/application/Context/State/Code/Generation/IUserScript';
import { ScriptingDefinitionStub } from '@tests/unit/stubs/ScriptingDefinitionStub';
import { CategoryStub } from '@tests/unit/stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/stubs/ScriptStub';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';
import { itEachAbsentObjectValue } from '@tests/unit/common/AbsentTests';
import { UserSelectionStub } from '@tests/unit/stubs/UserSelectionStub';

describe('ApplicationCode', () => {
  describe('ctor', () => {
    it('empty when selection is empty', () => {
      // arrange
      const selection = new UserSelection(new CategoryCollectionStub(), []);
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
      const collection = new CategoryCollectionStub()
        .withAction(new CategoryStub(1).withScripts(...scripts));
      const selectedScripts = scripts.map((script) => script.toSelectedScript());
      const selection = new UserSelection(collection, selectedScripts);
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
    describe('throws when userSelection is missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing userSelection';
        const userSelection = absentValue;
        const definition = new ScriptingDefinitionStub();
        // act
        const act = () => new ApplicationCode(userSelection, definition);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    describe('throws when scriptingDefinition is missing', () => {
      itEachAbsentObjectValue((absentValue) => {
        // arrange
        const expectedError = 'missing scriptingDefinition';
        const userSelection = new UserSelectionStub([]);
        const definition = absentValue;
        // act
        const act = () => new ApplicationCode(userSelection, definition);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
    it('throws when generator is missing', () => {
      // arrange
      const expectedError = 'missing generator';
      const userSelection = new UserSelectionStub([]);
      const definition = new ScriptingDefinitionStub();
      const generator = null;
      // act
      const act = () => new ApplicationCode(userSelection, definition, generator);
      // assert
      expect(act).to.throw(expectedError);
    });
  });
  describe('changed event', () => {
    describe('code', () => {
      it('empty when nothing is selected', () => {
        // arrange
        let signaled: ICodeChangedEvent;
        const scripts = [new ScriptStub('first'), new ScriptStub('second')];
        const collection = new CategoryCollectionStub()
          .withAction(new CategoryStub(1).withScripts(...scripts));
        const scriptsToSelect = scripts.map((script) => new SelectedScript(script, false));
        const selection = new UserSelection(collection, scriptsToSelect);
        const definition = new ScriptingDefinitionStub();
        const sut = new ApplicationCode(selection, definition);
        sut.changed.on((code) => {
          signaled = code;
        });
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
        const collection = new CategoryCollectionStub()
          .withAction(new CategoryStub(1).withScripts(...scripts));
        const scriptsToSelect = scripts.map((script) => new SelectedScript(script, false));
        const selection = new UserSelection(collection, scriptsToSelect);
        const definition = new ScriptingDefinitionStub();
        const sut = new ApplicationCode(selection, definition);
        sut.changed.on((code) => {
          signaled = code;
        });
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
        const collection = new CategoryCollectionStub();
        const selection = new UserSelection(collection, []);
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
        // eslint-disable-next-line no-new
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
        const collection = new CategoryCollectionStub()
          .withAction(new CategoryStub(1).withScripts(...scripts));
        const scriptsToSelect = scripts.map((script) => new SelectedScript(script, false));
        const selection = new UserSelection(collection, scriptsToSelect);
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
        // eslint-disable-next-line no-new
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
        const collection = new CategoryCollectionStub()
          .withAction(new CategoryStub(1).withScripts(...scripts));
        const scriptsToSelect = scripts.map((script) => new SelectedScript(script, false));
        const selection = new UserSelection(collection, scriptsToSelect);
        const scriptingDefinition = new ScriptingDefinitionStub();
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
        sut.changed.on((code) => {
          signaled = code;
        });
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
    result: IUserScript,
  ): UserScriptGeneratorMock {
    this.prePlanned.set(parameters, result);
    return this;
  }

  public buildCode(
    selectedScripts: readonly SelectedScript[],
    scriptingDefinition: IScriptingDefinition,
  ): IUserScript {
    for (const [parameters, result] of this.prePlanned) {
      if (selectedScripts === parameters.scripts
        && scriptingDefinition === parameters.definition) {
        return result;
      }
    }
    throw new Error('Unexpected parameters');
  }
}
