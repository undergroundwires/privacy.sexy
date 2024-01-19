/**
 * Description:
 *   This script checks if a server, provided as a CLI argument, is up
 *   and returns an HTTP 200 status code.
 *   It is designed to provide easy verification of server availability
 *   and will retry a specified number of times.
 *
 * Usage:
 *   node ./scripts/verify-web-server-status.js --url [URL]
 *
 * Options:
 *   --url   URL of the server to check
 */

import { get } from 'http';

const MAX_RETRIES = 30;
const RETRY_DELAY_IN_SECONDS = 3;
const URL_PARAMETER_NAME = '--url';

function checkServer(currentRetryCount = 1) {
  const serverUrl = getServerUrl();
  console.log(`Requesting ${serverUrl}...`);
  get(serverUrl, (res) => {
    if (res.statusCode === 200) {
      console.log('🎊 Success: The server is up and returned HTTP 200.');
      process.exit(0);
    } else {
      console.log(`Server returned HTTP status code ${res.statusCode}.`);
      retry(currentRetryCount);
    }
  }).on('error', (err) => {
    console.error('Error making the request:', err);
    retry(currentRetryCount);
  });
}

function retry(currentRetryCount) {
  console.log(`Attempt ${currentRetryCount}/${MAX_RETRIES}:`);
  console.log(`Retrying in ${RETRY_DELAY_IN_SECONDS} seconds.`);

  const remainingTime = (MAX_RETRIES - currentRetryCount) * RETRY_DELAY_IN_SECONDS;
  console.log(`Time remaining before timeout: ${remainingTime}s`);

  if (currentRetryCount < MAX_RETRIES) {
    setTimeout(() => checkServer(currentRetryCount + 1), RETRY_DELAY_IN_SECONDS * 1000);
  } else {
    console.log('Failure: The server at did not return HTTP 200 within the allocated time. Exiting.');
    process.exit(1);
  }
}

function getServerUrl() {
  const urlIndex = process.argv.indexOf(URL_PARAMETER_NAME);
  if (urlIndex === -1 || urlIndex === process.argv.length - 1) {
    console.error(`Parameter "${URL_PARAMETER_NAME}" is not provided.`);
    process.exit(1);
  }
  return process.argv[urlIndex + 1];
}

checkServer();
