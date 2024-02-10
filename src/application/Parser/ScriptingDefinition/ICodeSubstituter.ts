import type { ProjectDetails } from '@/domain/Project/ProjectDetails';

export interface ICodeSubstituter {
  substitute(code: string, projectDetails: ProjectDetails): string;
}
