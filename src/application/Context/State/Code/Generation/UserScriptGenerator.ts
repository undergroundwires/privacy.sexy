import { SelectedScript } from '@/application/Context/State/Selection/SelectedScript';
import { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { CodePosition } from '../Position/CodePosition';
import { IUserScriptGenerator } from './IUserScriptGenerator';
import { IUserScript } from './IUserScript';
import { ICodeBuilder } from './ICodeBuilder';
import { ICodeBuilderFactory } from './ICodeBuilderFactory';
import { CodeBuilderFactory } from './CodeBuilderFactory';

export class UserScriptGenerator implements IUserScriptGenerator {
  constructor(private readonly codeBuilderFactory: ICodeBuilderFactory = new CodeBuilderFactory()) {

  }

  public buildCode(
    selectedScripts: ReadonlyArray<SelectedScript>,
    scriptingDefinition: IScriptingDefinition,
  ): IUserScript {
    if (!selectedScripts) { throw new Error('undefined scripts'); }
    if (!scriptingDefinition) { throw new Error('undefined definition'); }
    let scriptPositions = new Map<SelectedScript, ICodePosition>();
    if (!selectedScripts.length) {
      return { code: '', scriptPositions };
    }
    let builder = this.codeBuilderFactory.create(scriptingDefinition.language);
    builder = initializeCode(scriptingDefinition.startCode, builder);
    for (const selection of selectedScripts) {
      scriptPositions = appendSelection(selection, scriptPositions, builder);
    }
    const code = finalizeCode(builder, scriptingDefinition.endCode);
    return { code, scriptPositions };
  }
}

function initializeCode(startCode: string, builder: ICodeBuilder): ICodeBuilder {
  if (!startCode) {
    return builder;
  }
  return builder
    .appendLine(startCode)
    .appendLine();
}

function finalizeCode(builder: ICodeBuilder, endCode: string): string {
  if (!endCode) {
    return builder.toString();
  }
  return builder.appendLine()
    .appendLine(endCode)
    .toString();
}

function appendSelection(
  selection: SelectedScript,
  scriptPositions: Map<SelectedScript, ICodePosition>,
  builder: ICodeBuilder,
): Map<SelectedScript, ICodePosition> {
  // Start from next line because first line will be empty to separate scripts
  const startPosition = builder.currentLine + 1;
  appendCode(selection, builder);
  const endPosition = builder.currentLine - 1;
  builder.appendLine();
  const position = new CodePosition(startPosition, endPosition);
  scriptPositions.set(selection, position);
  return scriptPositions;
}

function appendCode(selection: SelectedScript, builder: ICodeBuilder): ICodeBuilder {
  const { script } = selection;
  const name = selection.revert ? `${script.name} (revert)` : script.name;
  const scriptCode = selection.revert ? script.code.revert : script.code.execute;
  return builder
    .appendLine()
    .appendFunction(name, scriptCode);
}
