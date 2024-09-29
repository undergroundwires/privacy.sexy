import type { isArray } from '@/TypeHelpers';

export class IsArrayStub {
  private predeterminedResult = true;

  public withPredeterminedResult(predeterminedResult: boolean): this {
    this.predeterminedResult = predeterminedResult;
    return this;
  }

  public get(): typeof isArray {
    return (value: unknown): value is Array<unknown> => this.predeterminedResult;
  }
}
