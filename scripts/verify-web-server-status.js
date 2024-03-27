#!/usr/bin/env node

/**
 * Description:
 *  This script checks if a server, provided as a CLI argument, is up
 *  and returns an HTTP 200 status code.
 *  It is designed to provide easy verification of server availability
 *  and will retry a specified number of times.
 *
 * Usage:
 *  node ./scripts/verify-web-server-status.js --url [URL] [--max-retries NUMBER]
 *
 * Options:
 *  --url           URL of the server to check
 *  --max-retries   Maximum number of retry attempts (default: 30)
 */

const DEFAULT_MAX_RETRIES = 30;
const RETRY_DELAY_IN_SECONDS = 3;
const PARAMETER_NAME_URL = '--url';
const PARAMETER_NAME_MAX_RETRIES = '--max-retries';

async function checkServer(currentRetryCount = 1) {
  const serverUrl = readRequiredParameterValue(PARAMETER_NAME_URL);
  const maxRetries = parseNumber(
    readOptionalParameterValue(PARAMETER_NAME_MAX_RETRIES, DEFAULT_MAX_RETRIES),
  );
  console.log(`🌐 Requesting ${serverUrl}...`);
  try {
    const response = await fetch(serverUrl);
    if (response.status === 200) {
      console.log('🎊 Success: The server is up and returned HTTP 200.');
      process.exit(0);
    } else {
      exitWithError(`Server returned unexpected HTTP status code ${response.statusCode}.`);
    }
  } catch (error) {
    console.error('Error making the request:', error);
    scheduleNextRetry(maxRetries, currentRetryCount);
  }
}

function scheduleNextRetry(maxRetries, currentRetryCount) {
  console.log(`Attempt ${currentRetryCount}/${maxRetries}:`);
  console.log(`Retrying in ${RETRY_DELAY_IN_SECONDS} seconds.`);

  const remainingTime = (maxRetries - currentRetryCount) * RETRY_DELAY_IN_SECONDS;
  console.log(`Time remaining before timeout: ${remainingTime}s`);

  if (currentRetryCount < maxRetries) {
    setTimeout(() => checkServer(currentRetryCount + 1), RETRY_DELAY_IN_SECONDS * 1000);
  } else {
    exitWithError('The server at did not return HTTP 200 within the allocated time.');
  }
}

function readRequiredParameterValue(parameterName) {
  const parameterValue = readOptionalParameterValue(parameterName);
  if (parameterValue === undefined) {
    exitWithError(`Parameter "${parameterName}" is required but not provided.`);
  }
  return parameterValue;
}

function readOptionalParameterValue(parameterName, defaultValue) {
  const index = process.argv.indexOf(parameterName);
  if (index === -1 || index === process.argv.length - 1) {
    return defaultValue;
  }
  return process.argv[index + 1];
}

function parseNumber(numberLike) {
  const number = parseInt(numberLike, 10);
  if (Number.isNaN(number)) {
    exitWithError(`Invalid number: ${numberLike}`);
  }
  return number;
}

function exitWithError(message) {
  console.error(`Failure: ${message}`);
  console.log('Exiting');
  process.exit(1);
}

await checkServer();
