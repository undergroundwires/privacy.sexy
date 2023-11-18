import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';

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
  const existingScriptIds = expected.map((script) => script.id).sort();
  const expectedScriptIds = actual.map((script) => script.id).sort();
  expect(existingScriptIds).to.deep.equal(expectedScriptIds, [
    'Unexpected script IDs.',
    `Expected: ${expectedScriptIds.join(', ')}`,
    `Actual: ${existingScriptIds.join(', ')}`,
  ].join('\n'));
}

function expectSameRevertStates(
  actual: readonly SelectedScript[],
  expected: readonly SelectedScript[],
) {
  const scriptsWithDifferentRevertStates = actual
    .filter((script) => {
      const other = expected.find((existing) => existing.id === script.id);
      if (!other) {
        throw new Error(`Script "${script.id}" does not exist in expected scripts: ${JSON.stringify(expected, null, '\t')}`);
      }
      return script.revert !== other.revert;
    });
  expect(scriptsWithDifferentRevertStates).to.have.lengthOf(0, [
    'Scripts with different revert states:',
    scriptsWithDifferentRevertStates
      .map((s) => [
        `Script ID: "${s.id}"`,
        `Actual revert state: "${s.revert}"`,
        `Expected revert state: "${expected.find((existing) => existing.id === s.id)?.revert ?? 'unknown'}"`,
      ].map((line) => `\t${line}`).join('\n'))
      .join('\n---\n'),
  ].join('\n'));
}
