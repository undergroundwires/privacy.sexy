import { Category } from '../../domain/Category';
import { Application } from '../../domain/Application';
import { Script } from '@/domain/Script';
import applicationFile from 'js-yaml-loader!./../application.yaml';
import { parseCategory } from './CategoryParser';

export function parseApplication(): Application {
    const name = applicationFile.name as string;
    const version = applicationFile.version as number;
    const categories = new Array<Category>();
    if (!applicationFile.actions || applicationFile.actions.length <= 0) {
        throw new Error('Application does not define any action');
    }
    for (const action of applicationFile.actions) {
        const category = parseCategory(action);
        categories.push(category);
    }
    const app = new Application(name, version, categories);
    return app;
}
