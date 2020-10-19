import { Script } from '@/domain/Script';
import { YamlScript } from 'js-yaml-loader!./application.yaml';
import { parseDocUrls } from './DocumentationParser';
import { RecommendationLevelNames, RecommendationLevel } from '@/domain/RecommendationLevel';

export function parseScript(yamlScript: YamlScript): Script {
    if (!yamlScript) {
        throw new Error('script is null or undefined');
    }
    const script = new Script(
        /* name */              yamlScript.name,
        /* code */              yamlScript.code,
        /* revertCode */        yamlScript.revertCode,
        /* docs */              parseDocUrls(yamlScript),
        /* level */             getLevel(yamlScript.recommend));
    return script;
}

function getLevel(level: string): RecommendationLevel | undefined {
    if (!level) {
        return undefined;
    }
    if (typeof level !== 'string') {
        throw new Error(`level must be a string but it was ${typeof level}`);
    }
    const typedLevel = RecommendationLevelNames
        .find((l) => l.toLowerCase() === level.toLowerCase());
    if (!typedLevel) {
        throw new Error(`unknown level: \"${level}\"`);
    }
    return RecommendationLevel[typedLevel as keyof typeof RecommendationLevel];
}
