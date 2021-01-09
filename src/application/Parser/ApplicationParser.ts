import { IApplication } from '@/domain/IApplication';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { parseCategoryCollection } from './CategoryCollectionParser';
import WindowsData from 'js-yaml-loader!@/application/collections/windows.yaml';
import { CollectionData } from 'js-yaml-loader!@/*';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { Application } from '@/domain/Application';

export function parseApplication(
    parser = CategoryCollectionParser,
    processEnv: NodeJS.ProcessEnv = process.env,
    collectionData = LoadedCollectionData): IApplication {
    const information = parseProjectInformation(processEnv);
    const collection = parser(collectionData, information);
    const app = new Application(information, [ collection ]);
    return app;
}

export type CategoryCollectionParserType
    = (file: CollectionData, info: IProjectInformation) => ICategoryCollection;

const CategoryCollectionParser: CategoryCollectionParserType
    = (file, info) => parseCategoryCollection(file, info);

const LoadedCollectionData: CollectionData
    = WindowsData;
