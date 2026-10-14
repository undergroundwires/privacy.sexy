import type { ICodePosition } from '@/application/Context/State/Code/Position/ICodePosition';
import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { CodePosition } from '../Position/CodePosition';
import { CodeBuilderFactory } from './CodeBuilderFactory';
import type { IUserScriptGenerator } from './IUserScriptGenerator';
import type { IUserScript } from './IUserScript';
import type { ICodeBuilder } from './ICodeBuilder';
import type { ICodeBuilderFactory } from './ICodeBuilderFactory';

export class UserScriptGenerator implements IUserScriptGenerator {
  constructor(private readonly codeBuilderFactory: ICodeBuilderFactory = new CodeBuilderFactory()) {

  }

  public buildCode(
    selectedScripts: ReadonlyArray<SelectedScript>,
    scriptMetadata: ScriptMetadata,
  ): IUserScript {
    if (!selectedScripts.length) {
      return { code: '', scriptPositions: new Map<SelectedScript, ICodePosition>() };
    }
    let builder = this.codeBuilderFactory.create(scriptMetadata.language);
    builder = initializeCode(scriptMetadata.startCode, builder);
    const scriptPositions = selectedScripts.reduce((result, selection, index) => {
      return appendSelection(
        selection,
        result,
        builder,
        getProgressName(selection, index + 1, selectedScripts.length),
      );
    }, new Map<SelectedScript, ICodePosition>());
    const code = finalizeCode(builder, scriptMetadata.endCode, selectedScripts.length);
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

function finalizeCode(builder: ICodeBuilder, endCode: string, selectedActionCount: number): string {
  builder
    .appendStandardOutLine('')
    .appendStandardOutLine(
      `Reached the end of ${selectedActionCount} selected actions. Review warnings/errors above.`,
    );
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
  progressName: string,
): Map<SelectedScript, ICodePosition> {
  // Start from next line because first line will be empty to separate scripts
  const startPosition = builder.currentLine + 1;
  appendCode(selection, builder, progressName);
  const endPosition = builder.currentLine - 1;
  builder.appendLine();
  const position = new CodePosition(startPosition, endPosition);
  scriptPositions.set(selection, position);
  return scriptPositions;
}

function appendCode(selection: SelectedScript, builder: ICodeBuilder, name: string): ICodeBuilder {
  const scriptCode = getSelectedCode(selection);
  return builder
    .appendLine()
    .appendFunction(name, scriptCode);
}

function getProgressName(selection: SelectedScript, index: number, total: number): string {
  const { name } = selection.script;
  const actionName = selection.revert ? `${name} (revert)` : name;
  return `[${index}/${total}] ${actionName}`;
}

function getSelectedCode(selection: SelectedScript): string {
  const { code } = selection.script;
  if (!selection.revert) {
    return code.execute;
  }
  if (!code.revert) {
    throw new Error('Reverted script lacks revert code.');
  }
  return code.revert;
}
