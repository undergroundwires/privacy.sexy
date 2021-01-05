import { Category } from '@/domain/Category';
import { YamlApplication } from 'js-yaml-loader!@/application.yaml';
import { parseCategory } from './CategoryParser';
import { ScriptCompiler } from './Compiler/ScriptCompiler';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { parseScriptingDefinition } from './ScriptingDefinitionParser';
import { createEnumParser } from '../Common/Enum';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { CategoryCollection } from '@/domain/CategoryCollection';
import { IProjectInformation } from '@/domain/IProjectInformation';

export function parseCategoryCollection(
    content: YamlApplication,
    info: IProjectInformation,
    osParser = createEnumParser(OperatingSystem)): ICategoryCollection {
    validate(content);
    const compiler = new ScriptCompiler(content.functions);
    const categories = new Array<Category>();
    for (const action of content.actions) {
        const category = parseCategory(action, compiler);
        categories.push(category);
    }
    const os = osParser.parseEnum(content.os, 'os');
    const scripting = parseScriptingDefinition(content.scripting, info);
    const collection = new CategoryCollection(
        os,
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
