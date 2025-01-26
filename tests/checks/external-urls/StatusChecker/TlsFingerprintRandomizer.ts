/**
 * Modifies the TLS fingerprint of Node.js HTTP client to circumvent TLS fingerprinting blocks.
 * TLS fingerprinting is a technique used to identify clients based on the unencrypted data sent
 * during the TLS handshake, used for blocking or identifying non-browser clients like debugging
 * proxies or automated scripts.
 *
 * However, Node.js's HTTP client does not fully support all methods required for impersonating a
 * browser's TLS fingerprint, as reported in https://github.com/nodejs/undici/issues/1983.
 * While this implementation can alter the TLS fingerprint by randomizing the cipher suite order,
 * it may not perfectly mimic specific browser fingerprints due to limitations in the TLS
 * implementation of Node.js.
 *
 * For more detailed information, visit:
 * - https://archive.ph/2024.03.13-102042/https://httptoolkit.com/blog/tls-fingerprinting-node-js/
 * - https://check.ja3.zone/ (To check your tool's or browser's fingerprint)
 * - https://github.com/lwthiker/curl-impersonate (A solution for curl)
 * - https://github.com/depicts/got-tls (Cipher manipulation support for Node.js)
 */

import { constants } from 'crypto';
import tls from 'tls';
import { indentText } from '@/application/Common/Text/IndentText';

export function randomizeTlsFingerprint() {
  tls.DEFAULT_CIPHERS = getShuffledCiphers().join(':');
  console.log(indentText(
    `TLS context:\n${indentText([
      'Original ciphers:', indentText(constants.defaultCipherList),
      'Current ciphers:', indentText(getTlsContextInfo()),
    ].join('\n'))}`,
  ));
}

export function getTlsContextInfo(): string {
  return [
    `Ciphers: ${tls.DEFAULT_CIPHERS}`,
    `Minimum TLS protocol version: ${tls.DEFAULT_MIN_VERSION}`,
    `Node fingerprint: ${constants.defaultCoreCipherList === tls.DEFAULT_CIPHERS ? 'Visible' : 'Masked'}`,
  ].join('\n');
}

/**
 * Shuffles the order of TLS ciphers, excluding the top 3 most important ciphers to maintain
 * security preferences. This approach modifies the default cipher list of Node.js to create a
 * unique TLS fingerprint, thus helping to circumvent detection mechanisms based on static
 * fingerprinting. It leverages randomness in the cipher order as a simple method to generate a
 * new, unique TLS fingerprint which is not easily identifiable. The technique is based on altering
 * parameters used in the TLS handshake process, particularly the cipher suite order, to avoid
 * matching known fingerprints that could identify the client as a Node.js application.
 *
 * For more details, refer to:
 * - https://archive.ph/2024.03.13-102234/https://getsetfetch.org/blog/tls-fingerprint.html
 */
export function getShuffledCiphers(): readonly string[] {
  const nodeOrderedCipherList = constants.defaultCoreCipherList.split(':');
  const totalTopCiphersToKeep = 3;
  // Keep the most important ciphers in the same order
  const fixedCiphers = nodeOrderedCipherList.slice(0, totalTopCiphersToKeep);
  // Shuffle the rest
  const shuffledCiphers = nodeOrderedCipherList.slice(totalTopCiphersToKeep)
    .map((cipher) => ({ cipher, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ cipher }) => cipher);
  const ciphers = [
    ...fixedCiphers,
    ...shuffledCiphers,
  ];
  return ciphers;
}
