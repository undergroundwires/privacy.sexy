export type Constructible<T, TArgs extends unknown[] = never> = {
  prototype: T;
  apply: (this: unknown, args: TArgs) => void;
};

export type PropertyKeys<T> = {
  [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
}[keyof T];
