import { describe, it, expect } from 'vitest';
import { BrowserCondition, TouchSupportExpectation } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserOs/BrowserCondition';
import { ConditionBasedOsDetector } from '@/infrastructure/RuntimeEnvironment/Browser/BrowserOs/ConditionBasedOsDetector';
import { getAbsentStringTestCases, itEachAbsentCollectionValue } from '@tests/unit/shared/TestCases/AbsentTests';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { BrowserEnvironmentStub } from '@tests/unit/shared/Stubs/BrowserEnvironmentStub';
import { BrowserConditionStub } from '@tests/unit/shared/Stubs/BrowserConditionStub';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';

describe('ConditionBasedOsDetector', () => {
  describe('constructor', () => {
    describe('throws when given no conditions', () => {
      itEachAbsentCollectionValue<BrowserCondition>((absentCollection) => {
        // arrange
        const expectedError = 'empty conditions';
        const conditions = absentCollection;
        // act
        const act = () => new ConditionBasedOsDetectorBuilder()
          .withConditions(conditions)
          .build();
        // assert
        expect(act).to.throw(expectedError);
      }, { excludeUndefined: true, excludeNull: true });
    });
    it('throws if user agent part is missing', () => {
      // arrange
      const expectedError = 'Each condition must include at least one identifiable part of the user agent string.';
      const invalidCondition = new BrowserConditionStub().withExistingPartsInSameUserAgent([]);
      // act
      const act = () => new ConditionBasedOsDetectorBuilder()
        .withConditions([invalidCondition])
        .build();
      // assert
      expect(act).to.throw(expectedError);
    });
    describe('validates touch support expectation range', () => {
      // arrange
      const validValue = TouchSupportExpectation.MustExist;
      // act
      const act = (touchSupport: TouchSupportExpectation) => new ConditionBasedOsDetectorBuilder()
        .withConditions([new BrowserConditionStub().withTouchSupport(touchSupport)])
        .build();
      // assert
      new EnumRangeTestRunner(act)
        .testOutOfRangeThrows()
        .testValidValueDoesNotThrow(validValue);
    });
    it('throws if duplicate parts exist in user agent', () => {
      // arrange
      const expectedError = 'Found duplicate entries in user agent parts: Windows. Each part should be unique.';
      const invalidCondition = {
        operatingSystem: OperatingSystem.Windows,
        existingPartsInSameUserAgent: ['Windows', 'Windows'],
      };
      // act
      const act = () => new ConditionBasedOsDetectorBuilder()
        .withConditions([invalidCondition])
        .build();
      // assert
      expect(act).toThrowError(expectedError);
    });
    it('throws if duplicate non-existing parts exist in user agent', () => {
      // arrange
      const expectedError = 'Found duplicate entries in user agent parts: Linux. Each part should be unique.';
      const invalidCondition = {
        operatingSystem: OperatingSystem.Linux,
        existingPartsInSameUserAgent: ['Linux'],
        notExistingPartsInUserAgent: ['Linux'],
      };
      // act
      const act = () => new ConditionBasedOsDetectorBuilder()
        .withConditions([invalidCondition])
        .build();
      // assert
      expect(act).toThrowError(expectedError);
    });
    it('throws if duplicates found in any user agent parts', () => {
      // arrange
      const expectedError = 'Found duplicate entries in user agent parts: Android. Each part should be unique.';
      const invalidCondition = {
        operatingSystem: OperatingSystem.Android,
        existingPartsInSameUserAgent: ['Android'],
        notExistingPartsInUserAgent: ['iOS', 'Android'],
      };
      // act
      const act = () => new ConditionBasedOsDetectorBuilder()
        .withConditions([invalidCondition])
        .build();
      // assert
      expect(act).toThrowError(expectedError);
    });
  });
  describe('detect', () => {
    it('detects the correct OS when multiple conditions match', () => {
      // arrange
      const expectedOperatingSystem = OperatingSystem.Linux;
      const testUserAgent = 'test-user-agent';
      const expectedCondition = new BrowserConditionStub()
        .withOperatingSystem(expectedOperatingSystem)
        .withExistingPartsInSameUserAgent([testUserAgent]);
      const conditions = [
        expectedCondition,
        new BrowserConditionStub()
          .withExistingPartsInSameUserAgent(['unrelated user agent'])
          .withOperatingSystem(OperatingSystem.Android),
        new BrowserConditionStub()
          .withNotExistingPartsInUserAgent([testUserAgent])
          .withOperatingSystem(OperatingSystem.macOS),
      ];
      const environment = new BrowserEnvironmentStub()
        .withUserAgent(testUserAgent);
      const detector = new ConditionBasedOsDetectorBuilder()
        .withConditions(conditions)
        .build();
      // act
      const actualOperatingSystem = detector.detect(environment);
      // assert
      expect(actualOperatingSystem).to.equal(expectedOperatingSystem);
    });

    describe('user agent checks', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly buildEnvironment: (environment: BrowserEnvironmentStub) => BrowserEnvironmentStub;
        readonly buildCondition: (condition: BrowserConditionStub) => BrowserConditionStub;
        readonly detects: boolean;
      }> = [
        ...getAbsentStringTestCases({ excludeUndefined: true, excludeNull: true })
          .map((testCase) => ({
            description: `does not detect when user agent is empty (${testCase.valueName})`,
            buildEnvironment: (environment) => environment.withUserAgent(testCase.absentValue),
            buildCondition: (condition) => condition,
            detects: false,
          })),
        {
          description: 'detects when user agent matches completely',
          buildEnvironment: (environment) => environment.withUserAgent('test-user-agent'),
          buildCondition: (condition) => condition.withExistingPartsInSameUserAgent(['test-user-agent']),
          detects: true,
        },
        {
          description: 'detects when substring of user agent exists',
          buildEnvironment: (environment) => environment.withUserAgent('test-user-agent'),
          buildCondition: (condition) => condition.withExistingPartsInSameUserAgent(['test']),
          detects: true,
        },
        {
          description: 'does not detect when no part of user agent exists',
          buildEnvironment: (environment) => environment.withUserAgent('unrelated-user-agent'),
          buildCondition: (condition) => condition.withExistingPartsInSameUserAgent(['lorem-ipsum']),
          detects: false,
        },
        {
          description: 'detects when non-existing parts do not match',
          buildEnvironment: (environment) => environment.withUserAgent('1-3'),
          buildCondition: (condition) => condition.withExistingPartsInSameUserAgent(['1']).withNotExistingPartsInUserAgent(['2']),
          detects: true,
        },
        {
          description: 'does not detect when non-existing and existing parts match',
          buildEnvironment: (environment) => environment.withUserAgent('1-2'),
          buildCondition: (condition) => condition.withExistingPartsInSameUserAgent(['1']).withNotExistingPartsInUserAgent(['2']),
          detects: false,
        },
      ];
      testScenarios.forEach(({
        description, buildEnvironment, buildCondition, detects,
      }) => {
        it(description, () => {
          // arrange
          const environment = buildEnvironment(new BrowserEnvironmentStub());
          const condition = buildCondition(
            new BrowserConditionStub().withOperatingSystem(OperatingSystem.Linux),
          );
          const detector = new ConditionBasedOsDetectorBuilder()
            .withConditions([condition])
            .build();
          // act
          const actualOperatingSystem = detector.detect(environment);
          // assert
          expect(actualOperatingSystem !== undefined).to.equal(detects);
        });
      });
    });

    describe('touch support checks', () => {
      const testScenarios: ReadonlyArray<{
        readonly description: string;
        readonly expectation: TouchSupportExpectation;
        readonly isTouchSupportInEnvironment: boolean;
        readonly detects: boolean;
      }> = [
        {
          description: 'detects when touch support exists and is expected',
          expectation: TouchSupportExpectation.MustExist,
          isTouchSupportInEnvironment: true,
          detects: true,
        },
        {
          description: 'does not detect when touch support does not exists but is expected',
          expectation: TouchSupportExpectation.MustExist,
          isTouchSupportInEnvironment: false,
          detects: false,
        },
        {
          description: 'detects when touch support does not exist and is not expected',
          expectation: TouchSupportExpectation.MustNotExist,
          isTouchSupportInEnvironment: false,
          detects: true,
        },
        {
          description: 'does not detect when touch support exists but is not expected',
          expectation: TouchSupportExpectation.MustNotExist,
          isTouchSupportInEnvironment: true,
          detects: false,
        },
      ];
      testScenarios.forEach(({
        description, expectation, isTouchSupportInEnvironment, detects,
      }) => {
        it(description, () => {
          // arrange
          const userAgent = 'iPhone';
          const environment = new BrowserEnvironmentStub()
            .withUserAgent(userAgent)
            .withIsTouchSupported(isTouchSupportInEnvironment);
          const conditionWithTouchSupport = new BrowserConditionStub()
            .withExistingPartsInSameUserAgent([userAgent])
            .withTouchSupport(expectation);
          const detector = new ConditionBasedOsDetectorBuilder()
            .withConditions([conditionWithTouchSupport])
            .build();
          // act
          const actualOperatingSystem = detector.detect(environment);
          // assert
          expect(actualOperatingSystem !== undefined)
            .to.equal(detects);
        });
      });
    });
  });
});

class ConditionBasedOsDetectorBuilder {
  private conditions: readonly BrowserCondition[] = [{
    operatingSystem: OperatingSystem.iOS,
    existingPartsInSameUserAgent: ['iPhone'],
  }];

  public withConditions(conditions: readonly BrowserCondition[]): this {
    this.conditions = conditions;
    return this;
  }

  public build(): ConditionBasedOsDetector {
    return new ConditionBasedOsDetector(
      this.conditions,
    );
  }
}
