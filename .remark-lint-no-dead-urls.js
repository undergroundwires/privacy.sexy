import remarkLintNoDeadUrls from 'remark-lint-no-dead-urls';

/** @type {import('remark-lint-no-dead-urls').Options} */
const PluginOptions = {
  skipUrlPatterns: [
    // These result in false negatives
    'archive.ph',
    'scoop.sh',
    'localhost',
    'archive.org',
  ].map(buildUrlPattern),
};

/** @type {import('unified-engine').Preset} */
export default {
  plugins: [[remarkLintNoDeadUrls, PluginOptions]],
};

function buildUrlPattern(fqdn) {
  const escaped = fqdn.replace(/\./g, '\\.');
  // Matches http(s)://<domain>[:port]/<path>
  return `^https?://${escaped}(?::\\d+)?/.*$`;
}
