import type { Category } from '@/domain/Executables/Category/Category';
import type { ScriptCode } from '@/domain/Executables/Script/Code/ScriptCode';
import type { Documentable } from '@/domain/Executables/Documentable';
import type { ICategoryCollection } from '@/domain/ICategoryCollection';
import type { Script } from '@/domain/Executables/Script/Script';
import { AppliedFilterResult } from '../Result/AppliedFilterResult';
import type { FilterStrategy } from './FilterStrategy';
import type { FilterResult } from '../Result/FilterResult';

export class LinearFilterStrategy implements FilterStrategy {
  applyFilter(filter: string, collection: ICategoryCollection): FilterResult {
    const filterLowercase = filter.toLocaleLowerCase();
    const filteredScripts = collection.getAllScripts().filter(
      (script) => matchesScript(script, filterLowercase),
    );
    const filteredCategories = collection.getAllCategories().filter(
      (category) => matchesCategory(category, filterLowercase),
    );
    return new AppliedFilterResult(
      filteredScripts,
      filteredCategories,
      filter,
    );
  }
}

function matchesCategory(
  category: Category,
  filterLowercase: string,
): boolean {
  return matchesAny(
    () => matchName(category.name, filterLowercase),
    () => matchDocumentation(category, filterLowercase),
  );
}

function matchesScript(
  script: Script,
  filterLowercase: string,
): boolean {
  return matchesAny(
    () => matchName(script.name, filterLowercase),
    () => matchCode(script.code, filterLowercase),
    () => matchDocumentation(script, filterLowercase),
  );
}

function matchesAny(
  ...predicates: ReadonlyArray<() => boolean>
): boolean {
  return predicates.some((predicate) => predicate());
}

function matchName(
  name: string,
  filterLowercase: string,
): boolean {
  return name.toLowerCase().includes(filterLowercase);
}

function matchCode(
  code: ScriptCode,
  filterLowercase: string,
): boolean {
  if (code.execute.toLowerCase().includes(filterLowercase)) {
    return true;
  }
  if (code.revert?.toLowerCase().includes(filterLowercase)) {
    return true;
  }
  return false;
}

function matchDocumentation(
  documentable: Documentable,
  filterLowercase: string,
): boolean {
  return documentable.docs.some(
    (doc) => doc.toLocaleLowerCase().includes(filterLowercase),
  );
}
