export async function fetchWithTimeout(
  url: string,
  timeoutInMs: number,
  init?: RequestInit,
): ReturnType<typeof fetch> {
  const options: RequestInit = {
    ...(init ?? {}),
    signal: AbortSignal.timeout(timeoutInMs),
  };
  return fetch(
    url,
    options,
  );
}
