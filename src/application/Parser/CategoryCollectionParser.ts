import { Category } from '@/domain/Category';
import { YamlApplication } from 'js-yaml-loader!@/application.yaml';
import { parseCategory } from './CategoryParser';
import { parseProjectInformation } from './ProjectInformationParser';
import { ScriptCompiler } from './Compiler/ScriptCompiler';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { parseScriptingDefinition } from './ScriptingDefinitionParser';
import { createEnumParser } from '../Common/Enum';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { CategoryCollection } from '@/domain/CategoryCollection';

export function parseCategoryCollection(
    content: YamlApplication,
    env: NodeJS.ProcessEnv = process.env,
    osParser = createEnumParser(OperatingSystem)): ICategoryCollection {
    validate(content);
    const compiler = new ScriptCompiler(content.functions);
    const categories = new Array<Category>();
    for (const action of content.actions) {
        const category = parseCategory(action, compiler);
        categories.push(category);
    }
    const os = osParser.parseEnum(content.os, 'os');
    const info = parseProjectInformation(env);
    const scripting = parseScriptingDefinition(content.scripting, info);
    const collection = new CategoryCollection(
        os,
        info,
        categories,
        scripting);
    return collection;
}

function validate(content: YamlApplication): void {
    if (!content) {
        throw new Error('content is null or undefined');
    }
    if (!content.actions || content.actions.length <= 0) {
        throw new Error('content does not define any action');
    }
}
