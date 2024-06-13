import { formatAssertionMessage } from '@tests/shared/FormatAssertionMessage';
import { indentText } from '@tests/shared/Text';

/**
 * Asserts that an array deeply includes a specified item by comparing JSON-serialized versions.
 * Designed to be used as the Chai methods 'to.deep.include' and 'to.deep.contain' do not work.
 */
export function expectDeepIncludes<T>(
  arrayToSearch: readonly T[],
  expectedItem: T,
) {
  const serializedItemsFromArray = arrayToSearch.map((c) => jsonSerializeForComparison(c));
  const serializedExpectedItem = jsonSerializeForComparison(expectedItem);
  expect(serializedItemsFromArray).to.include(serializedExpectedItem, formatAssertionMessage([
    'Mismatch in expected items.',
    'The provided array does not include the expected item.',
    'Expected item:',
    indentText(serializeItemForDisplay(expectedItem)),
    `Provided items (total: ${arrayToSearch.length}):`,
    indentText(serializeArrayForDisplay(arrayToSearch)),
  ]));
}

function jsonSerializeForComparison(obj: unknown): string {
  return JSON.stringify(obj);
}

function serializeArrayForDisplay<T>(array: readonly T[]): string {
  return array.map((item) => indentText(serializeItemForDisplay(item))).join('\n-\n');
}

function serializeItemForDisplay(item: unknown): string {
  const typeDescription = getTypeDescription(item);
  const jsonSerializedItem = JSON.stringify(item, null, 2);
  return `${typeDescription}\n${jsonSerializedItem}`;
}

function getTypeDescription(item: unknown): string {
  // Basic type detection using typeof
  let type = typeof item;
  // More specific type detection for object types using Object.prototype.toString
  if (type === 'object') {
    const preciseType = Object.prototype.toString.call(item);
    type = preciseType.replace(/^\[object (\S+)\]$/, '$1');
  }
  return `Type: ${type}`;
}
