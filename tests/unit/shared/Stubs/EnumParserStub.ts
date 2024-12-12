import type { EnumParser } from '@/application/Common/Enum';

export class EnumParserStub<T> implements EnumParser<T> {
  private readonly scenarios = new Array<{
    inputName: string, inputValue: string, outputValue: T }>();

  private defaultValue: T | null = null;

  public setup(inputName: string, inputValue: string, outputValue: T): this {
    this.scenarios.push({ inputName, inputValue, outputValue });
    return this;
  }

  public setupDefaultValue(outputValue: T): this {
    this.defaultValue = outputValue;
    return this;
  }

  public parseEnum(value: string, propertyName: string): T {
    const scenario = this.scenarios.find(
      (s) => s.inputName === propertyName && s.inputValue === value,
    );
    if (scenario) {
      return scenario.outputValue;
    }
    if (this.defaultValue !== null) {
      return this.defaultValue;
    }
    throw new Error(`Don't know now what to return from ${EnumParserStub.name}, forgot to set-up?`);
  }
}
