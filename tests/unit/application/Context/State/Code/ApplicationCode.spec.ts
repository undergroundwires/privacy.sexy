import { describe, it, expect } from 'vitest';
import { ApplicationCode } from '@/application/Context/State/Code/ApplicationCode';
import type { ICodeChangedEvent } from '@/application/Context/State/Code/Event/ICodeChangedEvent';
import type { IUserScriptGenerator } from '@/application/Context/State/Code/Generation/IUserScriptGenerator';
import { CodePosition } from '@/application/Context/State/Code/Position/CodePosition';
import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import type { IUserScript } from '@/application/Context/State/Code/Generation/IUserScript';
import { ScriptMetadataStub } from '@tests/unit/shared/Stubs/ScriptMetadataStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';

describe('ApplicationCode', () => {
  describe('ctor', () => {
    it('empty when selection is empty', () => {
      // arrange
      const selectedScripts: readonly SelectedScript[] = [];
      const selection = new ScriptSelectionStub()
        .withSelectedScripts(selectedScripts);
      const definition = new ScriptMetadataStub();
      const sut = new ApplicationCode(selection, definition);
      // act
      const actual = sut.current;
      // assert
      expect(actual).to.have.lengthOf(0);
    });
    it('generates code from script generator when selection is not empty', () => {
      // arrange
      const scripts = [new ScriptStub('first'), new ScriptStub('second')];
      const selectedScripts = scripts.map((script) => script.toSelectedScript());
      const selection = new ScriptSelectionStub()
        .withSelectedScripts(selectedScripts);
      const definition = new ScriptMetadataStub();
      const expected: IUserScript = {
        code: 'expected-code',
        scriptPositions: new Map(),
      };
      const generator = new UserScriptGeneratorMock()
        .plan({ scripts: selection.selectedScripts, scriptMetadata: definition }, expected);
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
        let signaled: ICodeChangedEvent | undefined;
        const scripts = [new ScriptStub('first'), new ScriptStub('second')];
        const selectedScripts = scripts.map((script) => script.toSelectedScript());
        const selection = new ScriptSelectionStub()
          .withSelectedScripts(selectedScripts);
        const definition = new ScriptMetadataStub();
        const sut = new ApplicationCode(selection, definition);
        sut.changed.on((code) => {
          signaled = code;
        });
        // act
        selection.changed.notify([]);
        // assert
        expectExists(signaled);
        expect(signaled.code).to.have.lengthOf(0);
        expect(signaled.code).to.equal(sut.current);
      });
      it('has code when some are selected', () => {
        // arrange
        let signaled: ICodeChangedEvent | undefined;
        const scripts = [new ScriptStub('first'), new ScriptStub('second')];
        const selectedScripts = scripts.map(
          (script) => script.toSelectedScript().withRevert(false),
        );
        const selection = new ScriptSelectionStub()
          .withSelectedScripts(selectedScripts);
        const definition = new ScriptMetadataStub();
        const sut = new ApplicationCode(selection, definition);
        sut.changed.on((code) => {
          signaled = code;
        });
        // act
        selection.changed.notify(selectedScripts);
        // assert
        expectExists(signaled);
        expect(signaled.code).to.have.length.greaterThan(0);
        expect(signaled.code).to.equal(sut.current);
      });
    });
    describe('calls UserScriptGenerator', () => {
      it('sends script metadata to generator', () => {
        // arrange
        const expectedDefinition = new ScriptMetadataStub();
        const selection = new ScriptSelectionStub()
          .withSelectedScripts([]);
        const generatorMock: IUserScriptGenerator = {
          buildCode: (_, definition) => {
            if (definition !== expectedDefinition) {
              throw new Error('Unexpected script metadata');
            }
            return {
              code: 'non-important-code',
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
        const expectedDefinition = new ScriptMetadataStub();
        const scripts = [new ScriptStub('first'), new ScriptStub('second')];
        const selectedScripts = scripts.map((script) => script.toSelectedScript());
        const selection = new ScriptSelectionStub()
          .withSelectedScripts(selectedScripts);
        const generatorMock: IUserScriptGenerator = {
          buildCode: (actualScripts) => {
            if (JSON.stringify(actualScripts) !== JSON.stringify(selectedScripts)) {
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
        const act = () => selection.changed.notify(selectedScripts);
        // assert
        expect(act).to.not.throw();
      });
      it('sets positions from the generator', () => {
        // arrange
        let signaled: ICodeChangedEvent | undefined;
        const scripts = [new ScriptStub('first'), new ScriptStub('second')];
        const selectedScripts = scripts.map(
          (script) => script.toSelectedScript().withRevert(false),
        );
        const selection = new ScriptSelectionStub()
          .withSelectedScripts(selectedScripts);
        const scriptMetadata = new ScriptMetadataStub();
        const totalLines = 20;
        const expected = new Map<SelectedScript, ICodePosition>(
          [
            [selectedScripts[0], new CodePosition(0, totalLines / 2)],
            [selectedScripts[1], new CodePosition(totalLines / 2, totalLines)],
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
        const sut = new ApplicationCode(selection, scriptMetadata, generatorMock);
        sut.changed.on((code) => {
          signaled = code;
        });
        // act
        selection.changed.notify(selectedScripts);
        // assert
        expectExists(signaled);
        expect(signaled.getScriptPositionInCode(scripts[0]))
          .to.deep.equal(expected.get(selectedScripts[0]));
        expect(signaled.getScriptPositionInCode(scripts[1]))
          .to.deep.equal(expected.get(selectedScripts[1]));
      });
    });
  });
});

interface ScriptGenerationParameters {
  readonly scripts: readonly SelectedScript[];
  readonly scriptMetadata: ScriptMetadata;
}
class UserScriptGeneratorMock implements IUserScriptGenerator {
  private prePlanned = new Map<ScriptGenerationParameters, IUserScript>();

  public plan(
    parameters: ScriptGenerationParameters,
    result: IUserScript,
  ): UserScriptGeneratorMock {
    this.prePlanned.set(parameters, result);
    return this;
  }

  public buildCode(
    selectedScripts: readonly SelectedScript[],
    scriptMetadata: ScriptMetadata,
  ): IUserScript {
    for (const [parameters, result] of this.prePlanned) {
      if (selectedScripts === parameters.scripts
        && scriptMetadata === parameters.scriptMetadata) {
        return result;
      }
    }
    throw new Error('Unexpected parameters');
  }
}
