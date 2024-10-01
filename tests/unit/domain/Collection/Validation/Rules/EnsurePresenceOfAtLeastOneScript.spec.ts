import { describe, it, expect } from 'vitest';
import { CategoryCollectionValidationContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionValidationContextStub';
import type { Script } from '@/domain/Executables/Script/Script';
import { ensurePresenceOfAtLeastOneScript } from '@/domain/Collection/Validation/Rules/EnsurePresenceOfAtLeastOneScript';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';

describe('ensurePresenceOfAtLeastOneScript', () => {
  it('throws an error when no scripts are present', () => {
    // arrange
    const expectedErrorMessage = 'Collection must have at least one script';
    const scripts: Script[] = [];

    // act
    const act = () => test(scripts);

    // assert
    expect(act).to.throw(expectedErrorMessage);
  });

  it('does not throw an error when at least one category is present', () => {
    // arrange
    const scripts: Script[] = [
      new ScriptStub('existing-script'),
    ];

    // act
    const act = () => test(scripts);

    // assert
    expect(act).not.to.throw();
  });
});

function test(allScripts: readonly Script[]):
ReturnType<typeof ensurePresenceOfAtLeastOneScript> {
  const context = new CategoryCollectionValidationContextStub()
    .withAllScripts(allScripts);
  return ensurePresenceOfAtLeastOneScript(context);
}
