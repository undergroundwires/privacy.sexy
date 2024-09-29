import type { RepositoryEntity, RepositoryEntityId } from '@/application/Repository/RepositoryEntity';

export class RepositoryEntityStub implements RepositoryEntity {
  public customProperty = 'customProperty';

  public constructor(
    public readonly id: RepositoryEntityId,
  ) { }

  public withCustomPropertyValue(value: string): RepositoryEntityStub {
    this.customProperty = value;
    return this;
  }
}
