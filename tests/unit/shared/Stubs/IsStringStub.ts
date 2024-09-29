import type { isString } from '@/TypeHelpers';

export class IsStringStub {
  private predeterminedResult = true;

  public withPredeterminedResult(predeterminedResult: boolean): this {
    this.predeterminedResult = predeterminedResult;
    return this;
  }

  public get(): typeof isString {
    return (value: unknown): value is string => this.predeterminedResult;
  }
}
