export interface Dialog {
  saveFile(fileContents: string, fileName: string, type: FileType): Promise<void>;
}

export enum FileType {
  BatchFile,
  ShellScript,
}
