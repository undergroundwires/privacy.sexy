import { readdirSync, readFileSync } from 'fs';
import { resolve, join, basename } from 'path';
import { describe, it, expect } from 'vitest';

/*
  A common mistake when working with yaml files to forget mentioning that a value should
  be interpreted as multi-line string using "|".
  E.g.
    ```
      code: |-
          echo Hello
          echo World
    ```
  If "|" is missing then the code is inlined like `echo Hello echo World``, which can be
  unintended. This test checks for similar issues in collection yaml files.
  These tests can be considered as "linter" more than "unit-test" and therefore can lead
  to false-positives.
*/
describe('collection files to have no unintended inlining', () => {
  // arrange
  const testCases = createTestCases('src/application/collections/');
  for (const testCase of testCases) {
    it(`${testCase.name}`, async () => {
      // act
      const lines = await findBadLineNumbers(testCase.content);
      // assert
      expect(lines).to.be.have.lengthOf(0, printMessage());
      function printMessage(): string {
        return 'Did you intend to have multi-lined string in lines: ' // eslint-disable-line prefer-template
          + lines.map(((line) => line.toString())).join(', ');
      }
    });
  }
});

async function findBadLineNumbers(fileContent: string): Promise<number[]> {
  return [
    ...findLineNumbersEndingWith(fileContent, 'revertCode:'),
    ...findLineNumbersEndingWith(fileContent, 'code:'),
  ];
}

function findLineNumbersEndingWith(content: string, ending: string): number[] {
  sanityCheck(content, ending);
  return content
    .split(/\r\n|\r|\n/)
    .map((line, index) => ({ text: line, index }))
    .filter((line) => line.text.trim().endsWith(ending))
    .map((line) => line.index + 1 /* first line is 1, not 0 */);
}

function sanityCheck(content: string, ending: string): void {
  if (!content) {
    throw new Error('File content is empty, is the file loaded correctly?');
  }
  if (!content.includes(ending)) {
    throw new Error(
      `File does not contain string "${ending}" string at all.`
        + `Did the word "${ending}" change? Or is this sanity check wrong?`,
    );
  }
}

interface ITestCase {
  name: string;
  content: string;
}
function createTestCases(collectionsDirFromRoot: string): ITestCase[] {
  const collectionsDir = resolve(`./${collectionsDirFromRoot}`);
  const fileNames = readdirSync(collectionsDir);
  if (fileNames.length === 0) {
    throw new Error(`Could not find any collection in ${collectionsDir}`);
  }
  const collectionFilePaths = fileNames
    .filter((name) => name.endsWith('.yaml'))
    .map((name) => join(collectionsDir, name));
  return collectionFilePaths.map((path) => ({
    name: basename(path),
    content: readFileSync(path, 'utf-8'),
  }));
}
