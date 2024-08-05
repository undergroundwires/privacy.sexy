export interface Pipe {
  readonly name: string;
  apply(input: string): string;
}
