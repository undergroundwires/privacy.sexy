import { Category } from '@/domain/Category';
import { Application } from '@/domain/Application';
import { IApplication } from '@/domain/IApplication';
import { ApplicationYaml } from 'js-yaml-loader!./../application.yaml';
import { parseCategory } from './CategoryParser';

export function parseApplication(content: ApplicationYaml): IApplication {
    validate(content);
    const categories = new Array<Category>();
    for (const action of content.actions) {
        const category = parseCategory(action);
        categories.push(category);
    }
    const app = new Application(
        content.name,
        content.repositoryUrl,
        process.env.VUE_APP_VERSION,
        categories);
    return app;
}

function validate(content: ApplicationYaml): void {
    if (!content) {
        throw new Error('application is null or undefined');
    }
    if (!content.actions || content.actions.length <= 0) {
        throw new Error('application does not define any action');
    }
}
