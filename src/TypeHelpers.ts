export type Constructible<T, TArgs extends unknown[] = never> = {
  prototype: T;
  apply: (this: () => unknown, args: TArgs) => void;
  readonly name: string;
};

export type PropertyKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K
}[keyof T];


export type ConstructorArguments<T> =
  T extends new (...args: infer U) => unknown ? U : never;

export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: never[]) => unknown ? K : never;
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

/**
 * Gets keys of object T, assuming all properties match the type.
 * Warning: May include properties not defined in T's type.
 * Details: https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript
 */
export function getUnsafeTypedKeys<T extends object>(obj: T): (keyof T)[] {
  return downcast(Object.keys(obj));
}

/**
 * Gets entries of object T, assuming all properties match the type.
 * Warning: May include properties not defined in T's type.
 * Details: https://stackoverflow.com/questions/60141960/typescript-key-value-relation-preserving-object-entries-type
 */
export function getUnsafeTypedEntries<T extends object>(
  obj: T,
): TypedEntries<T> {
  return downcast(Object.entries(obj));
}
type TypedEntries<T> = readonly ({
  [K in keyof T]: [K, T[K]];
}[keyof T])[];

function downcast<T = object>(obj: object): T {
  return obj as T;
}
