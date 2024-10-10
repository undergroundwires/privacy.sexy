/**
 * Abstraction layer for code editor functionality.
 * Allows for flexible integration and easy switching of third-party editor implementations.
 */
export interface CodeEditorFactory {
  (options: CodeEditorOptions): CodeEditor;
}

export interface CodeEditorOptions {
  readonly editorContainerElementId: string;
  readonly language: SupportedSyntaxLanguage;
}

export type SupportedSyntaxLanguage = 'batchfile' | 'shellscript';

export interface CodeEditor {
  destroy(): void;
  setContent(content: string): void;
  scrollToLine(lineNumber: number): void;
  updateSize(): void;
  applyStyleToLineRange(
    startLineNumber: number,
    endLineNumber: number,
    className: string,
  ): CodeEditorStyleHandle;
}

export interface CodeEditorStyleHandle {
  clearStyle(): void;
}
