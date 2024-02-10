import { ICategoryCollection } from './ICategoryCollection';
import { ProjectDetails } from './Project/ProjectDetails';
import { OperatingSystem } from './OperatingSystem';

export interface IApplication {
  readonly projectDetails: ProjectDetails;
  readonly collections: readonly ICategoryCollection[];

  getSupportedOsList(): OperatingSystem[];
  getCollection(operatingSystem: OperatingSystem): ICategoryCollection;
}
