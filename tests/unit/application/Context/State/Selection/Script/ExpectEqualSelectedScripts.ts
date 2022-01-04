import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';

export function expectEqualSelectedScripts(
  actual: readonly SelectedScript[],
  expected: readonly SelectedScript[],
) {
  expectSameScriptIds(actual, expected);
  expectSameRevertStates(actual, expected);
}

function expectSameScriptIds(
  actual: readonly SelectedScript[],
  expected: readonly SelectedScript[],
) {
  const existingScriptIds = expected.map((script) => script.key).sort();
  const expectedScriptIds = actual.map((script) => script.key).sort();
  expect(existingScriptIds).to.deep.equal(expectedScriptIds, formatAssertionMessage([
    'Unexpected script IDs.',
    `Expected: ${expectedScriptIds.join(', ')}`,
    `Actual: ${existingScriptIds.join(', ')}`,
  ]));
}

function expectSameRevertStates(
  actual: readonly SelectedScript[],
  expected: readonly SelectedScript[],
) {
  const scriptsWithDifferentRevertStates = actual
    .filter((script) => {
      const other = expected.find((existing) => existing.key === script.key);
      if (!other) {
        throw new Error(`Script "${script.key}" does not exist in expected scripts: ${JSON.stringify(expected, null, '\t')}`);
      }
      return script.revert !== other.revert;
    });
  expect(scriptsWithDifferentRevertStates).to.have.lengthOf(0, formatAssertionMessage([
    'Scripts with different revert states:',
    scriptsWithDifferentRevertStates
      .map((s) => [
        `Script ID: "${s.key}"`,
        `Actual revert state: "${s.revert}"`,
        `Expected revert state: "${expected.find((existing) => existing.key === s.key)?.revert ?? 'unknown'}"`,
      ].map((line) => `\t${line}`).join('\n'))
      .join('\n---\n'),
  ]));
}
