import { describe, it, expect } from 'vitest';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { UserSelectedScript } from '@/application/Context/State/Selection/Script/UserSelectedScript';

describe('UserSelectedScript', () => {
  it('id is same as script id', () => {
    // arrange
    const expectedId = 'scriptId';
    const script = new ScriptStub(expectedId);
    const sut = new UserSelectedScript(script, false);
    // act
    const actualId = sut.id;
    // assert
    expect(actualId).to.equal(expectedId);
  });
  it('throws when revert is true for irreversible script', () => {
    // arrange
    const scriptId = 'irreversibleScriptId';
    const expectedError = `The script with ID '${scriptId}' is not reversible and cannot be reverted.`;
    const script = new ScriptStub(scriptId)
      .withRevertCode(undefined);
    // act
    const act = () => new UserSelectedScript(script, true);
    // assert
    expect(act).to.throw(expectedError);
  });
});
