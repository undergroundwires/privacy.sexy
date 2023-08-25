import { it } from 'vitest';

export function itEachAbsentStringValue(
  runner: (absentValue: string) => void,
  options: IAbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): void {
  itEachAbsentTestCase(getAbsentStringTestCases(options), runner);
}

export function itEachAbsentObjectValue(
  runner: (absentValue: AbsentObjectType) => void,
  options: IAbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): void {
  itEachAbsentTestCase(getAbsentObjectTestCases(options), runner);
}

export function itEachAbsentCollectionValue<T>(
  runner: (absentValue: []) => void,
  options: IAbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): void {
  itEachAbsentTestCase(getAbsentCollectionTestCases<T>(options), runner);
}

export function itEachAbsentTestCase<T>(
  testCases: readonly IAbsentTestCase<T>[],
  runner: (absentValue: T) => void,
): void {
  for (const testCase of testCases) {
    it(`given "${testCase.valueName}"`, () => {
      runner(testCase.absentValue);
    });
  }
}

export function getAbsentObjectTestCases(
  options: IAbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): IAbsentTestCase<AbsentObjectType>[] {
  return [
    {
      valueName: 'null',
      absentValue: null,
    },
    ...(options.excludeUndefined ? [] : [
      {
        valueName: 'undefined',
        absentValue: undefined,
      },
    ]),
  ];
}

export function getAbsentStringTestCases(
  options: IAbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): IAbsentStringCase[] {
  return [
    {
      valueName: 'empty',
      absentValue: '',
    },
    ...getAbsentObjectTestCases(options),
  ];
}

export function getAbsentCollectionTestCases<T>(
  options: IAbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): readonly IAbsentCollectionCase<T>[] {
  return [
    ...getAbsentObjectTestCases(options),
    {
      valueName: 'empty',
      absentValue: new Array<T>(),
    },
  ];
}

const DefaultAbsentTestCaseOptions: IAbsentTestCaseOptions = {
  excludeUndefined: false,
};

interface IAbsentTestCaseOptions {
  readonly excludeUndefined: boolean;
}

type AbsentObjectType = undefined | null;

interface IAbsentTestCase<T> {
  readonly valueName: string;
  readonly absentValue: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IAbsentStringCase extends IAbsentTestCase<string> {
  // Marker interface
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IAbsentCollectionCase<T> extends IAbsentTestCase<T[]> {
  // Marker interface
}
