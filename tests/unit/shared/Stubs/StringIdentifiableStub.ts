// eslint-disable-next-line max-classes-per-file
import type { Identifiable } from '@/domain/Identifiable/Identifiable';
import type { Key } from '@/domain/Executables/Identifiable/Key';

export class StringIdentifiableStub implements Identifiable<StringKeyStub> {
  public key: StringKeyStub;

  public customProperty = 'customProperty';

  public constructor(id: string) {
    this.key = new StringKeyStub(id);
  }

  public withCustomProperty(value: string): StringIdentifiableStub {
    this.customProperty = value;
    return this;
  }
}

export class StringKeyStub implements Key {
  constructor(private readonly id: string = `[${StringKeyStub.name}]key`) {

  }

  public equals(stringKey: StringKeyStub): boolean {
    return stringKey.id === this.id;
  }

  public createSerializedKey(): string {
    return this.id;
  }
}
