import type { ICategory, IScript } from '@/domain/ICategory';
import type { IScriptCode } from '@/domain/IScriptCode';
import type { IDocumentable } from '@/domain/IDocumentable';
import type { ICategoryCollection } from '@/domain/ICategoryCollection';
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
  category: ICategory,
  filterLowercase: string,
): boolean {
  return matchesAny(
    () => matchName(category.name, filterLowercase),
    () => matchDocumentation(category, filterLowercase),
  );
}

function matchesScript(
  script: IScript,
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
  code: IScriptCode,
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
  documentable: IDocumentable,
  filterLowercase: string,
): boolean {
  return documentable.docs.some(
    (doc) => doc.toLocaleLowerCase().includes(filterLowercase),
  );
}
