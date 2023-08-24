import { IAppMetadata } from './IAppMetadata';
import { ViteAppMetadata } from './Vite/ViteAppMetadata';

export class AppMetadataFactory {
  public static get Current(): IAppMetadata {
    if (!this.instance) {
      this.instance = new ViteAppMetadata();
    }
    return this.instance;
  }

  private static instance: IAppMetadata;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}
}
