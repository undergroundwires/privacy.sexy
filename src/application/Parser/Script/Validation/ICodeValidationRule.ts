import { ICodeLine } from './ICodeLine';

export interface IInvalidCodeLine {
  readonly index: number;
  readonly error: string;
}

export interface ICodeValidationRule {
  analyze(lines: readonly ICodeLine[]): IInvalidCodeLine[];
}
