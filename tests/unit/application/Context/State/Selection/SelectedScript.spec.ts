import 'mocha';
import { expect } from 'chai';
import { ScriptStub } from '@tests/unit/stubs/ScriptStub';
import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';

describe('SelectedScript', () => {
  it('id is same as script id', () => {
    // arrange
    const expectedId = 'scriptId';
    const script = new ScriptStub(expectedId);
    const sut = new SelectedScript(script, false);
    // act
    const actualId = sut.id;
    // assert
    expect(actualId).to.equal(expectedId);
  });
  it('throws when revert is true for irreversible script', () => {
    // arrange
    const expectedId = 'scriptId';
    const script = new ScriptStub(expectedId)
      .withRevertCode(undefined);
    // act
    // eslint-disable-next-line no-new
    function construct() { new SelectedScript(script, true); }
    // assert
    expect(construct).to.throw('cannot revert an irreversible script');
  });
});
