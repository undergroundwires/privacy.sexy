import type { MarkdownRenderer } from '../MarkdownRenderer';

export class InlineReferenceLabelsToSuperscriptConverter implements MarkdownRenderer {
  public render(markdownContent: string): string {
    return convertInlineReferenceLabelsToSuperscript(markdownContent);
  }
}

function convertInlineReferenceLabelsToSuperscript(content: string): string {
  if (!content) {
    return content;
  }
  return content.replaceAll(TextInsideBracketsPattern, (_fullMatch, label, offset) => {
    if (!isInlineReferenceLabel(label, content, offset)) {
      return `[${label}]`;
    }
    return `<sup>[${label}]</sup>`;
  });
}

function isInlineReferenceLabel(
  referenceLabel: string,
  markdownText: string,
  openingBracketPosition: number,
): boolean {
  const referenceLabelDefinitionIndex = markdownText.indexOf(`\n[${referenceLabel}]: `);
  if (openingBracketPosition - 1 /* -1 for newline */ === referenceLabelDefinitionIndex) {
    return false; // It is a reference definition, not a label.
  }
  if (referenceLabelDefinitionIndex === -1) {
    return false; // The reference definition is missing.
  }
  return true;
}

const TextInsideBracketsPattern = /\[(.*?)\]/gm;
