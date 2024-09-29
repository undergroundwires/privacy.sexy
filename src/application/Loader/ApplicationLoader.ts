import type { Application } from '@/domain/Application';
import { createApplication, type ApplicationFactory } from '@/domain/ApplicationFactory';
import { loadProjectDetails } from './ProjectDetails/MetadataProjectDetailsLoader';
import { convertToCategoryCollections, type CompilerAdapter } from './Collections/CompilerAdapter';
import type { ProjectDetailsLoader } from './ProjectDetails/ProjectDetailsLoader';
import type { CollectionsLoader } from './Collections/CollectionsLoader';

export type ApplicationLoader = (
  utilities?: ApplicationLoadUtilities,
) => Application;

export function loadApplication( // TODO: Not tested
  utilities: ApplicationLoadUtilities = DefaultUtilities, // TODO: Replaces, application parser, move some tests from it
): Application {
  const projectDetails = utilities.loadProjectDetails();
  const collections = utilities.loadCollections(projectDetails);
  const app = utilities.createApplication({
    projectDetails,
    collections,
  });
  return app;
}

interface ApplicationLoadUtilities {
  readonly loadProjectDetails: ProjectDetailsLoader;
  readonly loadCollections: CollectionsLoader;
  readonly createApplication: ApplicationFactory;
  readonly convertCollections: CompilerAdapter;
}

const DefaultUtilities: ApplicationParserUtilities = {
  loadProjectDetails: loadProjectDetails,
  createApplication: createApplication,
  convertCollections: convertToCategoryCollections,
};
