export function formatAssertionMessage(lines: readonly string[]) {
  return [ // Using many newlines so `vitest` output looks good
    '\n---',
    ...lines,
    '---\n\n',
  ].join('\n');
}
