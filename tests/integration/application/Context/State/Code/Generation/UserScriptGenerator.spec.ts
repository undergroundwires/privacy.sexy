import { describe, expect, it } from 'vitest';
import { splitTextIntoLines } from '@/application/Common/Text/SplitTextIntoLines';
import { UserScriptGenerator } from '@/application/Context/State/Code/Generation/UserScriptGenerator';
import { ScriptLanguage } from '@/domain/ScriptMetadata/ScriptLanguage';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { ScriptMetadataStub } from '@tests/unit/shared/Stubs/ScriptMetadataStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';

const LongActionNameSuffix = 'very-long-action-name '.repeat(5);
const ExecuteName = `Apply "quotes" ^ & | < > (group) %value% ${LongActionNameSuffix}café 日本語`;
const RevertName = `Restore "quotes" ^ & | < > (group) %value% ${LongActionNameSuffix}café 日本語`;
const EscapedBatchExecuteName = `Apply ^"quotes^" ^^ ^& ^| ^< ^> ^(group^) %%value%% ${LongActionNameSuffix}café 日本語`;
const EscapedBatchRevertName = `Restore ^"quotes^" ^^ ^& ^| ^< ^> ^(group^) %%value%% ${LongActionNameSuffix}café 日本語`;

describe('UserScriptGenerator action progress', () => {
  const testCases = [
    {
      operatingSystem: 'Windows',
      language: ScriptLanguage.batchfile,
      blankLine: 'echo(',
      executeProgress: `echo [1/2] ${EscapedBatchExecuteName}`,
      revertProgress: `echo [2/2] ${EscapedBatchRevertName} ^(revert^)`,
      completionSummary: 'echo Reached the end of 1 selected actions. Review warnings/errors above.',
      commentDelimiter: '::',
      newLineTerminator: '\r\n',
    },
    {
      operatingSystem: 'macOS',
      language: ScriptLanguage.shellscript,
      blankLine: 'printf \'%s\\n\' \'\'',
      executeProgress: `printf '%s\\n' '[1/2] ${ExecuteName}'`,
      revertProgress: `printf '%s\\n' '[2/2] ${RevertName} (revert)'`,
      completionSummary: "printf '%s\\n' 'Reached the end of 1 selected actions. Review warnings/errors above.'",
      commentDelimiter: '#',
      newLineTerminator: '\n',
    },
    {
      operatingSystem: 'Linux',
      language: ScriptLanguage.shellscript,
      blankLine: 'printf \'%s\\n\' \'\'',
      executeProgress: `printf '%s\\n' '[1/2] ${ExecuteName}'`,
      revertProgress: `printf '%s\\n' '[2/2] ${RevertName} (revert)'`,
      completionSummary: "printf '%s\\n' 'Reached the end of 1 selected actions. Review warnings/errors above.'",
      commentDelimiter: '#',
      newLineTerminator: '\n',
    },
  ] as const;

  it.each(testCases)('keeps $operatingSystem action progress literal and readable', (testCase) => {
    // arrange
    const executeBody = 'execute body first\r\nWrite-Host "execute diagnostic"';
    const revertBody = 'revert body first\nWrite-Host "revert diagnostic"';
    const executeSelection = new ScriptStub('execute')
      .withName(ExecuteName)
      .withCode(executeBody)
      .toSelectedScript()
      .withRevert(false);
    const revertSelection = new ScriptStub('revert')
      .withName(RevertName)
      .withCode('execute body that must not be emitted')
      .withRevertCode(revertBody)
      .toSelectedScript()
      .withRevert(true);
    const metadata = new ScriptMetadataStub()
      .withLanguage(testCase.language)
      .withStartCode('start code first\r\nstart code second')
      .withEndCode('end code first\nend code second');
    const expectedActions = [
      {
        selection: executeSelection,
        body: executeBody,
        title: `[1/2] ${ExecuteName}`,
        progress: testCase.executeProgress,
      },
      {
        selection: revertSelection,
        body: revertBody,
        title: `[2/2] ${RevertName} (revert)`,
        progress: testCase.revertProgress,
      },
    ] as const;
    // act
    const actual = new UserScriptGenerator().buildCode(
      [executeSelection, revertSelection],
      metadata,
    );
    // assert
    const generatedLines = splitTextIntoLines(actual.code);
    expect(actual.scriptPositions.size).to.equal(expectedActions.length);
    for (const expectedAction of expectedActions) {
      const bodyLines = splitTextIntoLines(expectedAction.body);
      const bodyStartLineIndex = findLineSequence(generatedLines, bodyLines);
      const progressLineIndex = generatedLines.indexOf(expectedAction.progress);
      const selectionStartLineIndex = generatedLines.lastIndexOf('', progressLineIndex);
      const position = actual.scriptPositions.get(expectedAction.selection);
      expect(bodyStartLineIndex).toBeGreaterThanOrEqual(0);
      expect(generatedLines).toContain(expectedAction.progress);
      expect(selectionStartLineIndex).toBeGreaterThanOrEqual(0);
      expect(generatedLines.slice(bodyStartLineIndex - 1, bodyStartLineIndex))
        .to.deep.equal([expectedAction.progress]);
      expect(generatedLines.slice(bodyStartLineIndex, bodyStartLineIndex + bodyLines.length))
        .to.deep.equal(bodyLines);
      expect(generatedLines).toContain(`${testCase.commentDelimiter} ${expectedAction.title}`);
      expectExists(position);
      expect(position.startLine).to.equal(selectionStartLineIndex + 1);
      expect(position.endLine).to.equal(bodyStartLineIndex + bodyLines.length);
      expect(actual.code).toContain(bodyLines.join(testCase.newLineTerminator));
    }
  });
  it.each(testCases)('emits the $operatingSystem counted summary without end metadata', (testCase) => {
    // arrange
    const selection = new ScriptStub('action')
      .withName('Action')
      .withCode('action body')
      .toSelectedScript()
      .withRevert(false);
    const metadata = new ScriptMetadataStub()
      .withLanguage(testCase.language)
      .withStartCode('')
      .withEndCode('');
    // act
    const actual = new UserScriptGenerator().buildCode([selection], metadata);
    // assert
    const generatedLines = splitTextIntoLines(actual.code);
    expect(generatedLines.slice(-2)).to.deep.equal([
      testCase.blankLine,
      testCase.completionSummary,
    ]);
  });
});

function findLineSequence(lines: readonly string[], expectedLines: readonly string[]): number {
  return lines.findIndex((line, startIndex) => {
    return line === expectedLines[0]
      && expectedLines.every((expectedLine, offset) => lines[startIndex + offset] === expectedLine);
  });
}
