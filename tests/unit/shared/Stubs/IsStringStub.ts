import type { isString } from '@/TypeHelpers';

export class IsStringStub {
  private predeterminedResult = true;

  public withPredeterminedResult(predeterminedResult: boolean): this {
    this.predeterminedResult = predeterminedResult;
    return this;
  }

  public get(): typeof isString {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Predetermined test predicate.
    return (value: unknown): value is string => this.predeterminedResult;
  }
}
