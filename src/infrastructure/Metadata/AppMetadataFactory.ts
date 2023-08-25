import { IAppMetadata } from './IAppMetadata';
import { IAppMetadataFactory } from './IAppMetadataFactory';
import { validateMetadata } from './MetadataValidator';
import { ViteAppMetadata } from './Vite/ViteAppMetadata';

export class AppMetadataFactory implements IAppMetadataFactory {
  public static readonly Current = new AppMetadataFactory();

  public readonly instance: IAppMetadata;

  protected constructor(validator: MetadataValidator = validateMetadata) {
    const metadata = new ViteAppMetadata();
    validator(metadata);
    this.instance = metadata;
  }
}

export type MetadataValidator = typeof validateMetadata;
