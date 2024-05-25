export interface DataValidationTestScenario<T> {
  readonly description: string;
  readonly data: T;
  readonly expectedPass: boolean;
  readonly expectedMessage?: string;
}

export function generateDataValidationTestScenarios<T>(
  ...conditionBasedScenarios: DataValidationConditionBasedTestScenario<T>[]
): DataValidationTestScenario<T>[] {
  return conditionBasedScenarios.flatMap((conditionScenario) => [
    conditionScenario.expectFail.map((failDefinition): DataValidationTestScenario<T> => ({
      description: `fails: "${failDefinition.description}"`,
      data: failDefinition.data,
      expectedPass: false,
      expectedMessage: conditionScenario.assertErrorMessage,
    })),
    conditionScenario.expectPass.map((passDefinition): DataValidationTestScenario<T> => ({
      description: `passes: "${passDefinition.description}"`,
      data: passDefinition.data,
      expectedPass: true,
      expectedMessage: conditionScenario.assertErrorMessage,
    })),
  ].flat());
}

interface DataValidationConditionBasedTestScenario<T> {
  readonly assertErrorMessage?: string;
  readonly expectPass: readonly DataValidationScenarioDefinition<T>[];
  readonly expectFail: readonly DataValidationScenarioDefinition<T>[];
}

interface DataValidationScenarioDefinition<T> {
  readonly description: string;
  readonly data: T;
}
