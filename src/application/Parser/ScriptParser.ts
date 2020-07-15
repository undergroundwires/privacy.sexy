import { Script } from '@/domain/Script';
import { YamlScript } from 'js-yaml-loader!./application.yaml';
import { parseDocUrls } from './DocumentationParser';

export function parseScript(yamlScript: YamlScript): Script {
    if (!yamlScript) {
        throw new Error('script is null or undefined');
    }
    const script = new Script(
        /* name */              yamlScript.name,
        /* code */              yamlScript.code,
        /* revertCode */        yamlScript.revertCode,
        /* docs */              parseDocUrls(yamlScript),
        /* isRecommended */     yamlScript.recommend);
    return script;
}
