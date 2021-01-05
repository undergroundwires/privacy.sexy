import { IApplication } from '@/domain/IApplication';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { parseCategoryCollection } from './CategoryCollectionParser';
import applicationFile, { YamlApplication } from 'js-yaml-loader!@/application/application.yaml';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { Application } from '@/domain/Application';

export function parseApplication(
    parser = CategoryCollectionParser,
    processEnv: NodeJS.ProcessEnv = process.env,
    collectionData = CollectionData): IApplication {
    const information = parseProjectInformation(processEnv);
    const collection = parser(collectionData, information);
    const app = new Application(information, [ collection ]);
    return app;
}

export type CategoryCollectionParserType
    = (file: YamlApplication, info: IProjectInformation) => ICategoryCollection;

const CategoryCollectionParser: CategoryCollectionParserType
    = (file, info) => parseCategoryCollection(file, info);

const CollectionData: YamlApplication
    = applicationFile;

