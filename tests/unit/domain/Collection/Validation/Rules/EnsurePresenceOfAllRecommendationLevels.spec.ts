import { describe, it, expect } from 'vitest';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import type { Script } from '@/domain/Executables/Script/Script';
import { ensurePresenceOfAllRecommendationLevels } from '@/domain/Collection/Validation/Rules/EnsurePresenceOfAllRecommendationLevels';
import { CategoryCollectionValidationContextStub } from '@tests/unit/shared/Stubs/CategoryCollectionValidationContextStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { getEnumValues } from '@/application/Common/Enum';
import { collectExceptionMessage } from '@tests/unit/shared/ExceptionCollector';

describe('ensurePresenceOfAllRecommendationLevels', () => {
  it('passes when all recommendation levels are present', () => {
    // arrange
    const scripts = getAllPossibleRecommendationLevels().map((level, index) => {
      return new ScriptStub(`script-${index}`)
        .withLevel(level);
    });

    // act
    const act = () => test(scripts);

    // assert
    expect(act).to.not.throw();
  });

  describe('missing single level', () => {
    // arrange
    const recommendationLevels = getAllPossibleRecommendationLevels();
    recommendationLevels.forEach((missingLevel) => {
      const expectedDisplayName = getDisplayName(missingLevel);
      it(`throws an error when when "${expectedDisplayName}" is missing`, () => {
        const expectedError = `Missing recommendation levels: ${expectedDisplayName}.`;
        const otherLevels = recommendationLevels.filter((level) => level !== missingLevel);
        const scripts = otherLevels.map(
          (level, index) => new ScriptStub(`script-${index}`).withLevel(level),
        );
        // act
        const act = () => test(scripts);
        // assert
        expect(act).to.throw(expectedError);
      });
    });
  });

  it('throws an error with multiple missing recommendation levels', () => {
    // arrange
    const [
      notExpectedLevelInError,
      ...expectedLevelsInError
    ] = getAllPossibleRecommendationLevels();
    const scripts: Script[] = [
      new ScriptStub('recommended').withLevel(notExpectedLevelInError),
    ];

    // act
    const act = () => test(scripts);

    // assert
    const actualErrorMessage = collectExceptionMessage(act);
    expectedLevelsInError.forEach((level) => {
      const expectedLevelInError = getDisplayName(level);
      expect(actualErrorMessage).to.include(expectedLevelInError);
    });
    expect(actualErrorMessage).to.not.include(getDisplayName(notExpectedLevelInError));
  });

  it('throws an error when no scripts are provided', () => {
    // arrange
    const expectedLevelsInError = getAllPossibleRecommendationLevels()
      .map((level) => getDisplayName(level));
    const scripts: Script[] = [];

    // act
    const act = () => test(scripts);

    // assert
    const actualErrorMessage = collectExceptionMessage(act);
    expectedLevelsInError.forEach((expectedLevelInError) => {
      expect(actualErrorMessage).to.include(expectedLevelInError);
    });
  });
});

function test(allScripts: Script[]):
ReturnType<typeof ensurePresenceOfAllRecommendationLevels> {
  const context = new CategoryCollectionValidationContextStub()
    .withAllScripts(allScripts);
  return ensurePresenceOfAllRecommendationLevels(context);
}

function getAllPossibleRecommendationLevels(): readonly (RecommendationLevel | undefined)[] {
  return [
    ...getEnumValues(RecommendationLevel),
    undefined,
  ];
}

function getDisplayName(level: RecommendationLevel | undefined): string {
  return level === undefined ? 'None' : RecommendationLevel[level];
}
