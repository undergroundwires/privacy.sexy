import { describe, it, expect } from 'vitest';
import { UserScriptGenerator } from '@/application/Context/State/Code/Generation/UserScriptGenerator';
import type { ICodeBuilderFactory } from '@/application/Context/State/Code/Generation/ICodeBuilderFactory';
import type { ICodeBuilder } from '@/application/Context/State/Code/Generation/ICodeBuilder';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { ScriptingDefinitionStub } from '@tests/unit/shared/Stubs/ScriptingDefinitionStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';

describe('UserScriptGenerator', () => {
  describe('scriptingDefinition', () => {
    describe('startCode', () => {
      it('is prepended if not empty', () => {
        // arrange
        const sut = new UserScriptGenerator();
        const startCode = 'Start\nCode';
        const script = new ScriptStub('id')
          .withCode('code\nmulti-lined')
          .toSelectedScript();
        const definition = new ScriptingDefinitionStub()
          .withStartCode(startCode);
        const expectedStart = `${startCode}\n`;
        // act
        const code = sut.buildCode([script], definition);
        // assert
        const actual = code.code;
        expect(actual.startsWith(expectedStart));
      });
      describe('is not prepended if empty', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const codeBuilderStub = new CodeBuilderStub();
          const sut = new UserScriptGenerator(mockCodeBuilderFactory(codeBuilderStub));
          const script = new ScriptStub('id')
            .withCode('code\nmulti-lined')
            .toSelectedScript();
          const definition = new ScriptingDefinitionStub()
            .withStartCode(absentValue);
          const expectedStart = codeBuilderStub
            .appendFunction(script.script.name, script.script.code.execute)
            .toString();
          // act
          const code = sut.buildCode([script], definition);
          // assert
          const actual = code.code;
          expect(actual.startsWith(expectedStart));
        }, { excludeNull: true, excludeUndefined: true });
      });
    });
    describe('endCode', () => {
      it('is appended if not empty', () => {
        // arrange
        const sut = new UserScriptGenerator();
        const endCode = 'End\nCode';
        const script = new ScriptStub('id')
          .withCode('code\nmulti-lined')
          .toSelectedScript();
        const definition = new ScriptingDefinitionStub()
          .withEndCode(endCode);
        const expectedEnd = `${endCode}\n`;
        // act
        const code = sut.buildCode([script], definition);
        // assert
        const actual = code.code;
        expect(actual.endsWith(expectedEnd));
      });
      describe('is not appended if empty', () => {
        itEachAbsentStringValue((absentValue) => {
          // arrange
          const codeBuilderStub = new CodeBuilderStub();
          const sut = new UserScriptGenerator(mockCodeBuilderFactory(codeBuilderStub));
          const script = new ScriptStub('id')
            .withCode('code\nmulti-lined')
            .toSelectedScript();
          const expectedEnd = codeBuilderStub
            .appendFunction(script.script.name, script.script.code.execute)
            .toString();
          const definition = new ScriptingDefinitionStub()
            .withEndCode(absentValue);
          // act
          const code = sut.buildCode([script], definition);
          // assert
          const actual = code.code;
          expect(actual.endsWith(expectedEnd));
        }, { excludeNull: true, excludeUndefined: true });
      });
    });
  });
  describe('execute', () => {
    it('appends non-revert script', () => {
      const sut = new UserScriptGenerator();
      // arrange
      const scriptName = 'test non-revert script';
      const scriptCode = 'REM nop';
      const script = new ScriptStub('id').withName(scriptName).withCode(scriptCode);
      const selectedScripts = [new SelectedScriptStub(script).withRevert(false)];
      const definition = new ScriptingDefinitionStub();
      // act
      const actual = sut.buildCode(selectedScripts, definition);
      // assert
      expect(actual.code).to.include(scriptName);
      expect(actual.code).to.not.include(`${scriptName} (revert)`);
      expect(actual.code).to.include(scriptCode);
    });
  });
  describe('revert', () => {
    it('appends revert script', () => {
      // arrange
      const sut = new UserScriptGenerator();
      const scriptName = 'test non-revert script';
      const scriptCode = 'REM nop';
      const script = new ScriptStub('id')
        .withName(scriptName)
        .withRevertCode(scriptCode)
        .toSelectedScript()
        .withRevert(true);
      const definition = new ScriptingDefinitionStub();
      // act
      const actual = sut.buildCode([script], definition);
      // assert
      expect(actual.code).to.include(`${scriptName} (revert)`);
      expect(actual.code).to.include(scriptCode);
    });
    describe('throws if revert script lacks revert code', () => {
      itEachAbsentStringValue((emptyRevertCode) => {
        // arrange
        const expectedError = 'Reverted script lacks revert code.';
        const sut = new UserScriptGenerator();
        const script = new ScriptStub('id')
          .withRevertCode(emptyRevertCode)
          .toSelectedScript()
          .withRevert(true);
        const definition = new ScriptingDefinitionStub();
        // act
        const act = () => sut.buildCode([script], definition);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeNull: true });
    });
  });
  describe('scriptPositions', () => {
    it('without script; returns empty', () => {
      // arrange
      const sut = new UserScriptGenerator();
      const selectedScripts: readonly SelectedScript[] = [];
      const definition = new ScriptingDefinitionStub();
      // act
      const actual = sut.buildCode(selectedScripts, definition);
      // assert
      expect(actual.scriptPositions.size).to.equal(0);
    });
    describe('with scripts', () => {
      // arrange
      const totalStartCodeLines = 2;
      const totalFunctionNameLines = 4;
      const definition = new ScriptingDefinitionStub()
        .withStartCode('First line\nSecond line');
      describe('single script', () => {
        const testCases = [
          {
            name: 'single-lined',
            scriptCode: 'only line',
            codeLines: 1,
          },
          {
            name: 'multi-lined',
            scriptCode: 'first line\nsecond line',
            codeLines: 2,
          },
        ];
        const sut = new UserScriptGenerator();
        for (const testCase of testCases) {
          it(testCase.name, () => {
            const expectedStartLine = totalStartCodeLines
              + 1 // empty line code begin
              + 1; // code begin
            const expectedEndLine = expectedStartLine
              + totalFunctionNameLines
              + testCase.codeLines;
            const selectedScript = new ScriptStub('script-id')
              .withName('script')
              .withCode(testCase.scriptCode)
              .toSelectedScript()
              .withRevert(false);
            // act
            const actual = sut.buildCode([selectedScript], definition);
            // expect
            expect(1).to.equal(actual.scriptPositions.size);
            const position = actual.scriptPositions.get(selectedScript);
            expectExists(position);
            expect(expectedStartLine).to.equal(position.startLine, 'Unexpected start line position');
            expect(expectedEndLine).to.equal(position.endLine, 'Unexpected end line position');
          });
        }
      });
      it('multiple scripts', () => {
        const sut = new UserScriptGenerator();
        const selectedScripts = [
          new ScriptStub('1').withCode('only line'),
          new ScriptStub('2').withCode('first line\nsecond line'),
        ].map((s) => s.toSelectedScript());
        const expectedFirstScriptStart = totalStartCodeLines
          + 1 // empty line code begin
          + 1; // code begin
        const expectedFirstScriptEnd = expectedFirstScriptStart
          + totalFunctionNameLines
          + 1; // total code lines
        const expectedSecondScriptStart = expectedFirstScriptEnd
          + 1 // code end hyphens
          + 1 // new line
          + 1; // code begin
        const expectedSecondScriptEnd = expectedSecondScriptStart
          + totalFunctionNameLines
          + 2; // total lines of second script
        // act
        const actual = sut.buildCode(selectedScripts, definition);
        // assert
        const firstPosition = actual.scriptPositions.get(selectedScripts[0]);
        const secondPosition = actual.scriptPositions.get(selectedScripts[1]);
        expect(actual.scriptPositions.size).to.equal(2);
        expectExists(firstPosition);
        expect(expectedFirstScriptStart).to.equal(firstPosition.startLine, 'Unexpected start line position (first script)');
        expect(expectedFirstScriptEnd).to.equal(firstPosition.endLine, 'Unexpected end line position (first script)');
        expectExists(secondPosition);
        expect(expectedSecondScriptStart).to.equal(secondPosition.startLine, 'Unexpected start line position (second script)');
        expect(expectedSecondScriptEnd).to.equal(secondPosition.endLine, 'Unexpected end line position (second script)');
      });
    });
  });
});

function mockCodeBuilderFactory(mock: ICodeBuilder): ICodeBuilderFactory {
  return {
    create: () => mock,
  };
}

class CodeBuilderStub implements ICodeBuilder {
  public currentLine = 0;

  private text = '';

  public appendLine(code?: string): ICodeBuilder {
    this.text += this.text ? `${code}\n` : code;
    this.currentLine++;
    return this;
  }

  public appendTrailingHyphensCommentLine(totalRepeatHyphens: number): ICodeBuilder {
    return this.appendLine(`trailing-hyphens-${totalRepeatHyphens}`);
  }

  public appendCommentLine(commentLine?: string): ICodeBuilder {
    return this.appendLine(`Comment | ${commentLine}`);
  }

  public appendCommentLineWithHyphensAround(
    sectionName: string,
    totalRepeatHyphens: number,
  ): ICodeBuilder {
    return this.appendLine(`hyphens-around-${totalRepeatHyphens} | Section name: ${sectionName} | hyphens-around-${totalRepeatHyphens}`);
  }

  public appendFunction(name: string, code: string): ICodeBuilder {
    return this
      .appendLine(`Function | Name: ${name}`)
      .appendLine(`Function | Code: ${code}`);
  }

  public toString(): string {
    return this.text;
  }
}
