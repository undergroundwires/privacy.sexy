import { Category } from '../../domain/Category';
import { Application } from '../../domain/Application';
import { ApplicationYaml } from 'js-yaml-loader!./../application.yaml';
import { parseCategory } from './CategoryParser';

export function parseApplication(content: ApplicationYaml): Application {
    const categories = new Array<Category>();
    if (!content.actions || content.actions.length <= 0) {
        throw new Error('Application does not define any action');
    }
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
