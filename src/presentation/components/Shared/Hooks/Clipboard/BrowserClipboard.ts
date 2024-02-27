import type { Clipboard } from './Clipboard';

export type NavigatorClipboard = typeof globalThis.navigator.clipboard;

export class BrowserClipboard implements Clipboard {
  constructor(
    private readonly navigatorClipboard: NavigatorClipboard = globalThis.navigator.clipboard,
  ) {

  }

  public async copyText(text: string): Promise<void> {
    await this.navigatorClipboard.writeText(text);
  }
}
