import type { Identifiable } from '@/domain/Executables/Identifiable';
import type { CategoryCollectionValidator } from '../CategoryCollectionValidator';

export const ensureUniqueIdsAcrossExecutables: CategoryCollectionValidator = (
  context,
) => {
  const allExecutables: readonly Identifiable[] = [
    ...context.allCategories,
    ...context.allScripts,
  ];
  ensureNoDuplicateIds(allExecutables);
};

function ensureNoDuplicateIds(
  executables: readonly Identifiable[],
) {
  const duplicateExecutables = getExecutablesWithDuplicateIds(executables);
  if (duplicateExecutables.length === 0) {
    return;
  }
  const formattedDuplicateIds = duplicateExecutables.map(
    (executable) => `"${executable.executableId}"`,
  ).join(', ');
  throw new Error(`Duplicate executable IDs found: ${formattedDuplicateIds}`);
}

function getExecutablesWithDuplicateIds(
  executables: readonly Identifiable[],
): Identifiable[] {
  return executables
    .filter(
      (executable, index, array) => {
        const otherIndex = array.findIndex(
          (otherExecutable) => haveIdenticalIds(executable, otherExecutable),
        );
        return otherIndex !== index;
      },
    );
}

function haveIdenticalIds(first: Identifiable, second: Identifiable): boolean {
  return first.executableId === second.executableId;
}
