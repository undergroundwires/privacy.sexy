export interface Clipboard {
  copyText(text: string): Promise<void>;
}
