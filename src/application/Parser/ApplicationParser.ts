import { IApplication } from '@/domain/IApplication';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { parseCategoryCollection } from './CategoryCollectionParser';
import WindowsData from 'js-yaml-loader!@/application/collections/windows.yaml';
import MacOsData from 'js-yaml-loader!@/application/collections/macos.yaml';
import { CollectionData } from 'js-yaml-loader!@/*';
import { parseProjectInformation } from '@/application/Parser/ProjectInformationParser';
import { Application } from '@/domain/Application';

export function parseApplication(
    parser = CategoryCollectionParser,
    processEnv: NodeJS.ProcessEnv = process.env,
    collectionsData = PreParsedCollections): IApplication {
    validateCollectionsData(collectionsData);
    const information = parseProjectInformation(processEnv);
    const collections = collectionsData.map((collection) => parser(collection, information));
    const app = new Application(information, collections);
    return app;
}

export type CategoryCollectionParserType
    = (file: CollectionData, info: IProjectInformation) => ICategoryCollection;

const CategoryCollectionParser: CategoryCollectionParserType
    = (file, info) => parseCategoryCollection(file, info);

const PreParsedCollections: readonly CollectionData []
    = [ WindowsData, MacOsData ];

function validateCollectionsData(collections: readonly CollectionData[]) {
    if (!collections.length) {
        throw new Error('no collection provided');
    }
    if (collections.some((collection) => !collection)) {
        throw new Error('undefined collection provided');
    }
}
