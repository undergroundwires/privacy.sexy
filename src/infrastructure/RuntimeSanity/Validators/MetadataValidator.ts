import { IAppMetadata } from '@/infrastructure/Metadata/IAppMetadata';
import { AppMetadataFactory } from '@/infrastructure/Metadata/AppMetadataFactory';
import { ISanityCheckOptions } from '../Common/ISanityCheckOptions';
import { FactoryValidator, FactoryFunction } from '../Common/FactoryValidator';

export class MetadataValidator extends FactoryValidator<IAppMetadata> {
  constructor(factory: FactoryFunction<IAppMetadata> = () => AppMetadataFactory.Current.instance) {
    super(factory);
  }

  public override name = 'metadata';

  public override shouldValidate(options: ISanityCheckOptions): boolean {
    return options.validateMetadata;
  }
}
