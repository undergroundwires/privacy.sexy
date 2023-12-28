export async function fetchWithTimeout(
  url: string,
  timeoutInMs: number,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const options: RequestInit = {
    ...(init ?? {}),
    signal: controller.signal,
  };
  const promise = fetch(url, options);
  const timeout = setTimeout(() => controller.abort(), timeoutInMs);
  return promise.finally(() => clearTimeout(timeout));
}
