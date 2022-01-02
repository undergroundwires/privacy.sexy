import 'mocha';
import { expect } from 'chai';
import WindowsData from 'raw-loader!@/application/collections/windows.yaml';
import MacOsData from 'raw-loader!@/application/collections/macos.yaml';

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
describe('collection files to have no unintended inlining', async () => {
  // arrange
  const testCases = [{
    name: 'macos',
    fileContent: MacOsData,
  }, {
    name: 'windows',
    fileContent: WindowsData,
  },
  ];
  for (const testCase of testCases) {
    it(`${testCase.name}`, async () => {
      const lines = await findBadLineNumbers(testCase.fileContent);
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
  const lines = content.split(/\r\n|\r|\n/);
  const results = new Array<number>();
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().endsWith(ending)) {
      results.push((i + 1 /* first line is 1 not 0 */));
    }
  }
  return results;
}

function sanityCheck(content: string, ending: string): void {
  if (!content.includes(ending)) {
    throw new Error(
      `File does not contain string "${ending}" string at all.`
        + `Did the word "${ending}" change? Or is this sanity check wrong?`,
    );
  }
}
