export type Constructible<T, TArgs extends unknown[] = never> = {
  prototype: T;
  apply: (this: unknown, args: TArgs) => void;
  readonly name: string;
};

export type PropertyKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];

export type ConstructorArguments<T> =
  T extends new (...args: infer U) => unknown ? U : never;

export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never;
}[keyof T];

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

export function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}

export function isPlainObject(
  variable: unknown,
): variable is object & Record<string, unknown> {
  return Boolean(variable) // the data type of null is an object
    && typeof variable === 'object'
    && !Array.isArray(variable);
}

export function isNullOrUndefined(value: unknown): value is (null | undefined) {
  return typeof value === 'undefined' || value === null;
}
