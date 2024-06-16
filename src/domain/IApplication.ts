import type { ICategoryCollection } from './Collection/ICategoryCollection';
import type { ProjectDetails } from './Project/ProjectDetails';
import type { OperatingSystem } from './OperatingSystem';

export interface IApplication {
  readonly projectDetails: ProjectDetails;
  readonly collections: readonly ICategoryCollection[];

  getSupportedOsList(): OperatingSystem[];
  getCollection(operatingSystem: OperatingSystem): ICategoryCollection;
}
