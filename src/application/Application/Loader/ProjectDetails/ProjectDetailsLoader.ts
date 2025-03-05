import type { ProjectDetails } from '@/domain/Project/ProjectDetails';

export interface ProjectDetailsLoader {
  (): ProjectDetails;
}
