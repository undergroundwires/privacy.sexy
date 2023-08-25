export type Constructible<T, TArgs extends unknown[] = never> = {
  prototype: T;
  apply: (this: unknown, args: TArgs) => void;
};

export type PropertyKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];

export type ConstructorArguments<T> =
  T extends new (...args: infer U) => unknown ? U : never;

export type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? K : never;
}[keyof T];
