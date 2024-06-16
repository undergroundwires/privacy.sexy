import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OperatingSystem } from './OperatingSystem';
import type { ProjectDetails } from './Project/ProjectDetails';

export interface IApplication {
  readonly projectDetails: ProjectDetails;
  readonly collections: readonly CategoryCollection[];

  getSupportedOsList(): OperatingSystem[];
  getCollection(operatingSystem: OperatingSystem): CategoryCollection;
}
