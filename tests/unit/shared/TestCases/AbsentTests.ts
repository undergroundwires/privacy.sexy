import { it } from 'vitest';

export function itEachAbsentStringValue(
  runner: (absentValue: string | null) => void,
  options: { excludeUndefined: true, excludeNull?: false }
): void;
export function itEachAbsentStringValue(
  runner: (absentValue: string | undefined) => void,
  options: { excludeUndefined?: false, excludeNull: true }
): void;
export function itEachAbsentStringValue(
  runner: (absentValue: string) => void,
  options: { excludeUndefined: true, excludeNull: true }
): void;
export function itEachAbsentStringValue(
  runner: (absentValue: string | null | undefined) => void,
  options?: { excludeUndefined?: false, excludeNull?: false },
): void;
export function itEachAbsentStringValue(
  runner: ((absentValue: string) => void)
  | ((absentValue: string | null) => void)
  | ((absentValue: string | undefined) => void)
  | ((absentValue: string | null | undefined) => void),
  options: AbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): void {
  // Using `as any` due to limitation of TypeScript, this may be fixed in future versions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itEachAbsentTestCase(getAbsentStringTestCases(options as any), runner);
}

export function itEachAbsentCollectionValue<T>(
  runner: (absentValue: T[] | null) => void,
  options: { excludeUndefined: true, excludeNull?: false }
): void;
export function itEachAbsentCollectionValue<T>(
  runner: (absentValue: T[] | undefined) => void,
  options: { excludeUndefined?: false, excludeNull: true }
): void;
export function itEachAbsentCollectionValue<T>(
  runner: (absentValue: T[]) => void,
  options: { excludeUndefined: true, excludeNull: true }
): void;
export function itEachAbsentCollectionValue<T>(
  runner: (absentValue: T[] | null | undefined) => void,
  options?: { excludeUndefined?: false, excludeNull?: false },
): void;
export function itEachAbsentCollectionValue<T>(
  runner: ((absentValue: T[]) => void)
  | ((absentValue: T[] | null) => void)
  | ((absentValue: T[] | undefined) => void)
  | ((absentValue: T[] | null | undefined) => void),
  options: AbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): void {
  // Using `as any` due to limitation of TypeScript, this may be fixed in future versions.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itEachAbsentTestCase(getAbsentCollectionTestCases<T>(options as any), runner);
}

export function itEachAbsentObjectValue(
  runner: (absentValue: null) => void,
  options: { excludeUndefined: true, excludeNull?: false },
): void;
export function itEachAbsentObjectValue(
  runner: (absentValue: undefined) => void,
  options: { excludeUndefined?: false, excludeNull: true },
): void;
export function itEachAbsentObjectValue(
  runner: (absentValue: undefined | null) => void,
  options?: { excludeUndefined?: false, excludeNull?: false } | AbsentTestCaseOptions,
): void;
export function itEachAbsentObjectValue(
  runner: ((absentValue: null) => void)
  | ((absentValue: undefined) => void)
  | ((absentValue: null | undefined) => void),
  options: AbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): void {
  itEachAbsentTestCase(getAbsentObjectTestCases(options), runner);
}

export function itEachAbsentTestCase<T>(
  testCases: readonly AbsentTestCase<T>[],
  runner: (absentValue: T) => void,
): void {
  for (const testCase of testCases) {
    it(`given "${testCase.valueName}"`, () => {
      runner(testCase.absentValue);
    });
  }
}

interface AbsentTestCaseOptions {
  readonly excludeUndefined?: boolean;
  readonly excludeNull?: boolean;
}

const DefaultAbsentTestCaseOptions: AbsentTestCaseOptions = {
  excludeUndefined: false,
  excludeNull: false,
};

interface AbsentTestCase<T> {
  readonly valueName: string;
  readonly absentValue: T;
}

export function getAbsentObjectTestCases(
  options: { excludeUndefined: true, excludeNull?: false },
): ReadonlyArray<AbsentTestCase<null>>;
export function getAbsentObjectTestCases(
  options: { excludeUndefined?: false, excludeNull: true },
): ReadonlyArray<AbsentTestCase<undefined>>;
export function getAbsentObjectTestCases(
  options: { excludeUndefined: true, excludeNull: true },
): ReadonlyArray<never>;
export function getAbsentObjectTestCases(
  options?: { excludeUndefined?: false, excludeNull?: false } | AbsentTestCaseOptions,
): ReadonlyArray<AbsentTestCase<null> | AbsentTestCase<undefined>>;
export function getAbsentObjectTestCases(
  options: AbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): ReadonlyArray<AbsentTestCase<null> | AbsentTestCase<undefined>> {
  const results: Array<AbsentTestCase<null> | AbsentTestCase<undefined>> = [];
  if (!options.excludeNull) {
    results.push({
      valueName: 'null',
      absentValue: null,
    });
  }
  if (!options.excludeUndefined) {
    results.push({
      valueName: 'undefined',
      absentValue: undefined,
    });
  }
  return results;
}

export function getAbsentStringTestCases(
  options?: { excludeUndefined: false, excludeNull: false },
): ReadonlyArray<AbsentTestCase<string> | AbsentTestCase<null> | AbsentTestCase<undefined>>;
export function getAbsentStringTestCases(
  options: { excludeUndefined: true, excludeNull?: false }
): ReadonlyArray<AbsentTestCase<string> | AbsentTestCase<null>>;
export function getAbsentStringTestCases(
  options: { excludeUndefined?: false, excludeNull: true }
): ReadonlyArray<AbsentTestCase<string> | AbsentTestCase<undefined>>;
export function getAbsentStringTestCases(
  options: { excludeUndefined: true, excludeNull: true }
): ReadonlyArray<AbsentTestCase<string>>;
export function getAbsentStringTestCases(
  options: AbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): ReadonlyArray<AbsentTestCase<string> | AbsentTestCase<null> | AbsentTestCase<undefined>> {
  const results: Array<(
    AbsentTestCase<string> | AbsentTestCase<null> | AbsentTestCase<undefined>
  )> = [];

  results.push({
    valueName: 'empty',
    absentValue: '',
  });

  const objectTestCases = getAbsentObjectTestCases(options);
  results.push(...objectTestCases);

  return results;
}

export function getAbsentCollectionTestCases<T>(
  options?: { excludeUndefined: false, excludeNull: false },
): ReadonlyArray<AbsentTestCase<T[]> | AbsentTestCase<null> | AbsentTestCase<undefined>>;
export function getAbsentCollectionTestCases<T>(
  options: { excludeUndefined: true, excludeNull?: false }
): ReadonlyArray<AbsentTestCase<T[]> | AbsentTestCase<null>>;
export function getAbsentCollectionTestCases<T>(
  options: { excludeUndefined?: false, excludeNull: true }
): ReadonlyArray<AbsentTestCase<T[]> | AbsentTestCase<undefined>>;
export function getAbsentCollectionTestCases<T>(
  options: { excludeUndefined: true, excludeNull: true }
): ReadonlyArray<AbsentTestCase<T[]>>;
export function getAbsentCollectionTestCases<T>(
  options: AbsentTestCaseOptions = DefaultAbsentTestCaseOptions,
): ReadonlyArray<AbsentTestCase<T[]> | AbsentTestCase<null> | AbsentTestCase<undefined>> {
  const results: Array<AbsentTestCase<T[]> | AbsentTestCase<null> | AbsentTestCase<undefined>> = [];

  const objectTestCases = getAbsentObjectTestCases(options);
  results.push(...objectTestCases);

  results.push({
    valueName: 'empty',
    absentValue: [],
  });

  return results;
}
