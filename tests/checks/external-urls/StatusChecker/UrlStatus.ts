import { indentText } from '@tests/shared/Text';

export interface UrlStatus {
  readonly url: string;
  readonly error?: string;
  readonly code?: number;
}

export function formatUrlStatus(status: UrlStatus): string {
  return [
    `URL: ${status.url}`,
    ...status.code !== undefined ? [
      `Response code: ${status.code}`,
    ] : [],
    ...status.error ? [
      `Error:\n${indentText(status.error)}`,
    ] : [],
  ].join('\n');
}
