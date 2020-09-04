import { Category } from '@/domain/Category';
import { Application } from '@/domain/Application';
import { IApplication } from '@/domain/IApplication';
import { IProjectInformation } from '@/domain/IProjectInformation';
import { ApplicationYaml } from 'js-yaml-loader!./../application.yaml';
import { parseCategory } from './CategoryParser';
import { ProjectInformation } from '../../domain/ProjectInformation';


export function parseApplication(content: ApplicationYaml, env: NodeJS.ProcessEnv = process.env): IApplication {
    validate(content);
    const categories = new Array<Category>();
    for (const action of content.actions) {
        const category = parseCategory(action);
        categories.push(category);
    }
    const info = readAppInformation(env);
    const app = new Application(
        info,
        categories);
    return app;
}

function readAppInformation(environment): IProjectInformation {
    return new ProjectInformation(
        environment.VUE_APP_NAME,
        environment.VUE_APP_VERSION,
        environment.VUE_APP_REPOSITORY_URL,
        environment.VUE_APP_HOMEPAGE_URL,
    );
}

function validate(content: ApplicationYaml): void {
    if (!content) {
        throw new Error('application is null or undefined');
    }
    if (!content.actions || content.actions.length <= 0) {
        throw new Error('application does not define any action');
    }
}
