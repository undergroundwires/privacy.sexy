export function indentText(text, indentLevel = 1) {
  validateText(text);
  const indentation = '\t'.repeat(indentLevel);
  return splitTextIntoLines(text)
    .map((line) => (line ? `${indentation}${line}` : line))
    .join('\n');
}

export function splitTextIntoLines(text) {
  validateText(text);
  return text
    .split(/[\r\n]+/);
}

function validateText(text) {
  if (typeof text !== 'string') {
    throw new Error(`text is not a string. It is: ${typeof text}\n${text}`);
  }
}
