import { ICategoryCollection } from './ICategoryCollection';
import { IProjectInformation } from './IProjectInformation';
import { OperatingSystem } from './OperatingSystem';

export interface IApplication {
  readonly info: IProjectInformation;
  readonly collections: readonly ICategoryCollection[];

  getSupportedOsList(): OperatingSystem[];
  getCollection(operatingSystem: OperatingSystem): ICategoryCollection;
}
