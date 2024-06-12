export interface IPipe {
  readonly name: string;
  apply(input: string): string;
}
