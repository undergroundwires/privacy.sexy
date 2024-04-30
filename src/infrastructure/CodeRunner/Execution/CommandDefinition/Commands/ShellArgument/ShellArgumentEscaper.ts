export interface ShellArgumentEscaper {
  escapePathArgument(pathArgument: string): string;
}
