import { IApplication } from '@/domain/IApplication';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ProjectInformationStub } from './ProjectInformationStub';

export class ApplicationStub implements IApplication {
    public info: IProjectInformation = new ProjectInformationStub();
    public collections: ICategoryCollection[] = [ ];
    public getCollection(operatingSystem: OperatingSystem): ICategoryCollection {
        return this.collections.find((collection) => collection.os === operatingSystem);
    }
    public getSupportedOsList(): OperatingSystem[] {
        return this.collections.map((collection) => collection.os);
    }
    public withCollection(collection: ICategoryCollection): ApplicationStub {
        this.collections.push(collection);
        return this;
    }
    public withProjectInformation(info: IProjectInformation): ApplicationStub {
        this.info = info;
        return this;
    }
    public withCollections(...collections: readonly ICategoryCollection[]): ApplicationStub {
        this.collections.push(...collections);
        return this;
    }
}
