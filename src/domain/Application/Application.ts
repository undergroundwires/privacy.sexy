import type { CategoryCollection } from '../Collection/CategoryCollection';
import type { OperatingSystem } from '../OperatingSystem';
import type { ProjectDetails } from '../Project/ProjectDetails';

export interface Application {
  readonly projectDetails: ProjectDetails;
  readonly collections: readonly CategoryCollection[];

  getSupportedOsList(): OperatingSystem[];
  getCollection(operatingSystem: OperatingSystem): CategoryCollection;
}
