import type { Logger } from '@/application/Common/Log/Logger';

const allowedExternalProtocols = new Set(['http:', 'https:']);

export const ExternalUrlOpenResult = {
  Opened: 'opened',
  Rejected: 'rejected',
  Failed: 'failed',
} as const;

export type ExternalUrlOpenOutcome = (typeof ExternalUrlOpenResult)[
  keyof typeof ExternalUrlOpenResult
];

export interface NavigationOpenDetails {
  readonly url: string;
}

export interface NavigationEvent extends NavigationOpenDetails {
  preventDefault(): void;
}

export type NavigationWindowOpenHandler = (
  details: NavigationOpenDetails,
) => { readonly action: 'deny' };

export type WillNavigateHandler = (event: NavigationEvent) => void;

export interface NavigationWebContents {
  setWindowOpenHandler(handler: NavigationWindowOpenHandler): void;
  on(event: 'will-navigate', listener: WillNavigateHandler): void;
}

export interface NavigationPolicyDependencies {
  readonly openExternal: (url: string) => Promise<void>;
  readonly logger: Pick<Logger, 'error'>;
}

export function configureNavigationPolicy(
  webContents: NavigationWebContents,
  dependencies: NavigationPolicyDependencies,
): void {
  webContents.setWindowOpenHandler(({ url }) => {
    openExternalWebUrl(url, dependencies);
    return { action: 'deny' };
  });
  webContents.on('will-navigate', (event) => {
    event.preventDefault();
    openExternalWebUrl(event.url, dependencies);
  });
}

export async function openExternalWebUrl(
  url: string,
  dependencies: NavigationPolicyDependencies,
): Promise<ExternalUrlOpenOutcome> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return ExternalUrlOpenResult.Rejected;
  }
  if (!allowedExternalProtocols.has(parsedUrl.protocol)
    || parsedUrl.username.length > 0
    || parsedUrl.password.length > 0) {
    return ExternalUrlOpenResult.Rejected;
  }
  try {
    await dependencies.openExternal(parsedUrl.toString());
    return ExternalUrlOpenResult.Opened;
  } catch (error) {
    dependencies.logger.error('Failed to open external web URL', { error });
    return ExternalUrlOpenResult.Failed;
  }
}
