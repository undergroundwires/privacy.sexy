import { sleep } from '@/infrastructure/Threading/AsyncSleep';
import { IUrlStatus } from './IUrlStatus';

const DefaultBaseRetryIntervalInMs = 5 /* sec */ * 1000;

export async function retryWithExponentialBackOff(
    action: () => Promise<IUrlStatus>,
    baseRetryIntervalInMs: number = DefaultBaseRetryIntervalInMs,
    currentRetry = 1): Promise<IUrlStatus> {
    const maxTries: number = 3;
    const status = await action();
    if (shouldRetry(status)) {
        if (currentRetry <= maxTries) {
            const exponentialBackOffInMs = getRetryTimeoutInMs(currentRetry, baseRetryIntervalInMs);
            // tslint:disable-next-line: no-console
            console.log(`Retrying (${currentRetry}) in ${exponentialBackOffInMs / 1000} seconds`, status);
            await sleep(exponentialBackOffInMs);
            return retryWithExponentialBackOff(action, baseRetryIntervalInMs, currentRetry + 1);
        }
    }
    return status;
}

function shouldRetry(status: IUrlStatus) {
    if (status.error) {
        return true;
    }
    return isTransientError(status.code)
        || status.code === 429; // Too Many Requests
}

function isTransientError(statusCode: number) {
    return statusCode >= 500 && statusCode <= 599;
}

function getRetryTimeoutInMs(currentRetry: number, baseRetryIntervalInMs: number = DefaultBaseRetryIntervalInMs) {
    const retryRandomFactor = 0.5;  // Retry intervals are between 50% and 150%
                                    // of the exponentially increasing base amount
    const minRandom = 1 - retryRandomFactor;
    const maxRandom = 1 + retryRandomFactor;
    const randomization = (Math.random() * (maxRandom - minRandom)) + maxRandom;
    const exponential = Math.pow(2, currentRetry - 1);
    return Math.ceil(exponential * baseRetryIntervalInMs * randomization);
}
