import { describe, it, expect } from 'vitest';
import { UserScriptGenerator } from '@/application/Context/State/Code/Generation/UserScriptGenerator';
import type { ICodeBuilderFactory } from '@/application/Context/State/Code/Generation/ICodeBuilderFactory';
import type { ICodeBuilder } from '@/application/Context/State/Code/Generation/ICodeBuilder';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { ScriptMetadataStub } from '@tests/unit/shared/Stubs/ScriptMetadataStub';
import { itEachAbsentStringValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import { splitTextIntoLines } from '@/application/Common/Text/SplitTextIntoLines';

describe('UserScriptGenerator', () => {
  describe('scriptMetadata', () => {
    describe('startCode', () => {
      it('is prepended if not empty', () => {
        // arrange
        const sut = new UserScriptGenerator();
        const startCode = 'Start\nCode';
        const script = new ScriptStub('id')
          .withCode('code\nmulti-lined')
          .toSelectedScript();
        const definition = new ScriptMetadataStub()
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
            .toSelectedScript()
            .withRevert(false);
          const definition = new ScriptMetadataStub()
            .withStartCode(absentValue)
            .withEndCode('');
          const expectedCode = [
            '',
            `Function | Name: [1/1] ${script.script.name}`,
            `Function | Code: ${script.script.code.execute}`,
            '',
            'Standard output | Text: ',
            'Standard output | Text: Reached the end of 1 selected actions. Review warnings/errors above.',
          ].join('\n');
          // act
          const code = sut.buildCode([script], definition);
          // assert
          const actual = code.code;
          expect(actual).to.equal(expectedCode);
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
        const definition = new ScriptMetadataStub()
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
            .toSelectedScript()
            .withRevert(false);
          const definition = new ScriptMetadataStub()
            .withStartCode('')
            .withEndCode(absentValue);
          const expectedCode = [
            '',
            `Function | Name: [1/1] ${script.script.name}`,
            `Function | Code: ${script.script.code.execute}`,
            '',
            'Standard output | Text: ',
            'Standard output | Text: Reached the end of 1 selected actions. Review warnings/errors above.',
          ].join('\n');
          // act
          const code = sut.buildCode([script], definition);
          // assert
          const actual = code.code;
          expect(actual).to.equal(expectedCode);
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
      const definition = new ScriptMetadataStub();
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
      const definition = new ScriptMetadataStub();
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
        const definition = new ScriptMetadataStub();
        // act
        const act = () => sut.buildCode([script], definition);
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeNull: true });
    });
  });
  describe('runtime progress', () => {
    it('labels every selection when it starts and summarizes before metadata', () => {
      // arrange
      const codeBuilderStub = new CodeBuilderStub();
      const sut = new UserScriptGenerator(mockCodeBuilderFactory(codeBuilderStub));
      const executeSelection = new ScriptStub('execute')
        .withName('Execute action')
        .withCode('execute body')
        .toSelectedScript()
        .withRevert(false);
      const revertSelection = new ScriptStub('revert')
        .withName('Revert action')
        .withRevertCode('revert body')
        .toSelectedScript()
        .withRevert(true);
      const definition = new ScriptMetadataStub()
        .withStartCode('')
        .withEndCode('metadata footer');
      // act
      const actual = sut.buildCode([executeSelection, revertSelection], definition);
      // assert
      expect(actual.code).to.equal([
        '',
        'Function | Name: [1/2] Execute action',
        'Function | Code: execute body',
        '',
        '',
        'Function | Name: [2/2] Revert action (revert)',
        'Function | Code: revert body',
        '',
        'Standard output | Text: ',
        'Standard output | Text: Reached the end of 2 selected actions. Review warnings/errors above.',
        '',
        'metadata footer',
      ].join('\n'));
    });
  });
  describe('scriptPositions', () => {
    it('without script; returns empty', () => {
      // arrange
      const sut = new UserScriptGenerator();
      const selectedScripts: readonly SelectedScript[] = [];
      const definition = new ScriptMetadataStub();
      // act
      const actual = sut.buildCode(selectedScripts, definition);
      // assert
      expect(actual.scriptPositions.size).to.equal(0);
      expect(actual.code).to.equal('');
    });
    describe('with scripts', () => {
      const definition = new ScriptMetadataStub()
        .withStartCode('First line\nSecond line');
      describe('single script', () => {
        const testCases: readonly {
          readonly description: string;
          readonly scriptCode: string;
        }[] = [
          {
            description: 'single-lined',
            scriptCode: 'only line',
          },
          {
            description: 'multi-lined',
            scriptCode: 'first line\nsecond line',
          },
        ];
        const sut = new UserScriptGenerator();
        for (const testCase of testCases) {
          it(testCase.description, () => {
            // arrange
            const selectedScript = new ScriptStub('script-id')
              .withName('script')
              .withCode(testCase.scriptCode)
              .toSelectedScript()
              .withRevert(false);
            // act
            const actual = sut.buildCode([selectedScript], definition);
            // assert
            expect(1).to.equal(actual.scriptPositions.size);
            const position = actual.scriptPositions.get(selectedScript);
            expectScriptPosition(actual.code, position, testCase.scriptCode);
            expectExists(position);
            expect(position.startLine).to.equal(4);
            expect(position.endLine).to.equal(8 + splitTextIntoLines(testCase.scriptCode).length);
          });
        }
      });
      it('multiple scripts', () => {
        // arrange
        const sut = new UserScriptGenerator();
        const selectedScripts = [
          new ScriptStub('1').withCode('only line'),
          new ScriptStub('2').withCode('first line\nsecond line'),
        ]
          .map((s) => s.toSelectedScript())
          .map((s) => s.withRevert(false));
        // act
        const actual = sut.buildCode(selectedScripts, definition);
        // assert
        expect(actual.scriptPositions.size).to.equal(2);
        expectScriptPosition(actual.code, actual.scriptPositions.get(selectedScripts[0]), 'only line');
        expectScriptPosition(actual.code, actual.scriptPositions.get(selectedScripts[1]), 'first line\nsecond line');
        const firstPosition = actual.scriptPositions.get(selectedScripts[0]);
        const secondPosition = actual.scriptPositions.get(selectedScripts[1]);
        expectExists(firstPosition);
        expectExists(secondPosition);
        expect(firstPosition.startLine).to.equal(4);
        expect(firstPosition.endLine).to.equal(9);
        expect(secondPosition.startLine).to.equal(12);
        expect(secondPosition.endLine).to.equal(18);
      });
      it('maps exact-boundary and long progress titles with duplicate bodies independently', () => {
        // arrange
        const duplicateBody = 'identical body';
        const exactBoundaryActionName = 'x'.repeat(52);
        const longActionName = 'long action '.repeat(8);
        const exactBoundarySelection = new ScriptStub('exact-boundary')
          .withName(exactBoundaryActionName)
          .withCode(duplicateBody)
          .toSelectedScript()
          .withRevert(false);
        const longSelection = new ScriptStub('long')
          .withName(longActionName)
          .withCode(duplicateBody)
          .toSelectedScript()
          .withRevert(false);
        const metadata = new ScriptMetadataStub()
          .withStartCode('')
          .withEndCode('');
        const sut = new UserScriptGenerator();
        // act
        const actual = sut.buildCode([exactBoundarySelection, longSelection], metadata);
        // assert
        const exactBoundaryPosition = actual.scriptPositions.get(exactBoundarySelection);
        const longPosition = actual.scriptPositions.get(longSelection);
        expectExists(exactBoundaryPosition);
        expectExists(longPosition);
        expect(exactBoundaryPosition.startLine).to.equal(1);
        expect(exactBoundaryPosition.endLine).to.equal(4);
        expect(longPosition.startLine).to.equal(7);
        expect(longPosition.endLine).to.equal(10);
        const generatedLines = splitTextIntoLines(actual.code);
        expect(generatedLines).toContain(`:: [1/2] ${exactBoundaryActionName}`);
        expect(generatedLines).toContain(`:: [2/2] ${longActionName}`);
        expect(generatedLines.slice(
          exactBoundaryPosition.endLine - 1,
          exactBoundaryPosition.endLine,
        )).to.deep.equal([duplicateBody]);
        expect(generatedLines.slice(longPosition.endLine - 1, longPosition.endLine))
          .to.deep.equal([duplicateBody]);
      });
    });
  });
});

function expectScriptPosition(
  generatedCode: string,
  position: ICodePosition | undefined,
  scriptCode: string,
): void {
  expectExists(position);
  const generatedLines = splitTextIntoLines(generatedCode);
  const scriptLines = splitTextIntoLines(scriptCode);
  const scriptStartLineIndex = findLineSequence(generatedLines, scriptLines);
  const selectionStartLineIndex = generatedLines.lastIndexOf('', scriptStartLineIndex);
  expect(scriptStartLineIndex).toBeGreaterThanOrEqual(0);
  expect(selectionStartLineIndex).toBeGreaterThanOrEqual(0);
  expect(position.startLine).to.equal(selectionStartLineIndex + 1);
  expect(position.endLine).to.equal(scriptStartLineIndex + scriptLines.length);
}

function findLineSequence(lines: readonly string[], expectedLines: readonly string[]): number {
  return lines.findIndex((line, startIndex) => {
    return line === expectedLines[0]
      && expectedLines.every((expectedLine, offset) => lines[startIndex + offset] === expectedLine);
  });
}

function mockCodeBuilderFactory(mock: ICodeBuilder): ICodeBuilderFactory {
  return {
    create: () => mock,
  };
}

class CodeBuilderStub implements ICodeBuilder {
  private readonly lines = new Array<string>();

  public get currentLine(): number {
    return this.lines.length;
  }

  public appendLine(code?: string): ICodeBuilder {
    if (!code) {
      this.lines.push('');
      return this;
    }
    this.lines.push(...splitTextIntoLines(code));
    return this;
  }

  public appendStandardOutLine(text: string): ICodeBuilder {
    return this.appendLine(`Standard output | Text: ${text}`);
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
    return this.lines.join('\n');
  }
}
