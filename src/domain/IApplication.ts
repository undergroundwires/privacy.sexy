<<<<<<< HEAD
import type { ICategoryCollection } from './Collection/ICategoryCollection';
=======
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { OperatingSystem } from './OperatingSystem';
>>>>>>> cbea6fa3 (Add unique script/category IDs $49, $59, $262, $126)
import type { ProjectDetails } from './Project/ProjectDetails';

export interface IApplication {
  readonly projectDetails: ProjectDetails;
  readonly collections: readonly CategoryCollection[];

  getSupportedOsList(): OperatingSystem[];
  getCollection(operatingSystem: OperatingSystem): CategoryCollection;
}
