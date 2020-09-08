import { Category } from '@/domain/Category';
import { Application } from '@/domain/Application';
import { IApplication } from '@/domain/IApplication';
import { YamlApplication } from 'js-yaml-loader!./../application.yaml';
import { parseCategory } from './CategoryParser';
import { parseProjectInformation } from './ProjectInformationParser';
import { ScriptCompiler } from './Compiler/ScriptCompiler';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { parseScriptingDefinition } from './ScriptingDefinitionParser';
import { createEnumParser } from '../Common/Enum';

export function parseApplication(
    content: YamlApplication,
    env: NodeJS.ProcessEnv = process.env,
    osParser = createEnumParser(OperatingSystem)): IApplication {
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
    const app = new Application(
        os,
        info,
        categories,
        scripting);
    return app;
}

function validate(content: YamlApplication): void {
    if (!content) {
        throw new Error('application is null or undefined');
    }
    if (!content.actions || content.actions.length <= 0) {
        throw new Error('application does not define any action');
    }
}
