import type { Application } from '@/domain/Application/Application';
import { createApplication, type ApplicationFactory } from '@/domain/Application/ApplicationFactory';
import type { ProjectDetailsLoader } from '@/application/Application/Loader/ProjectDetails/ProjectDetailsLoader';
import { loadProjectDetailsFromMetadata } from '@/application/Application/Loader/ProjectDetails/MetadataProjectDetailsLoader';
import { createTypeValidator, type TypeValidator } from '@/application/Common/TypeValidator';
import { loadCollections, type CollectionsLoader } from '@/application/Application/Loader/Collections/CollectionsLoader';
import type { ApplicationLoader } from './ApplicationLoader';

interface CompositeApplicationLoader extends ApplicationLoader {
  (utilities?: ApplicationLoaderUtilities): Application;
}

export const loadApplicationComposite: CompositeApplicationLoader = (
  utilities: ApplicationLoaderUtilities = DefaultUtilities,
) => {
  const projectDetails = utilities.loadProjectDetails();
  const collections = utilities.loadCollections(projectDetails);
  utilities.typeValidator.assertNonEmptyCollection({
    value: collections,
    valueName: 'Collections',
  });
  const app = utilities.createApplication({
    projectDetails,
    collections,
  });
  return app;
};

interface ApplicationLoaderUtilities {
  readonly createApplication: ApplicationFactory;

  readonly loadProjectDetails: ProjectDetailsLoader;
  readonly loadCollections: CollectionsLoader;

  readonly typeValidator: TypeValidator;
}

const DefaultUtilities: ApplicationLoaderUtilities = {
  createApplication,
  loadProjectDetails: loadProjectDetailsFromMetadata,
  loadCollections,
  typeValidator: createTypeValidator(),
};
