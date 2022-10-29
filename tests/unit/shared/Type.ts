// eslint-disable-next-line @typescript-eslint/ban-types
export type Type<T, TArgs extends unknown[] = never> = Function & {
  prototype: T,
  apply: (this: unknown, args: TArgs) => void
};
