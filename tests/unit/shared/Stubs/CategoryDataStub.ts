import type { CategoryData, CategoryOrScriptData, DocumentationData } from '@/application/collections/';
import { createScriptDataWithCode } from '@tests/unit/shared/Stubs/ScriptDataStub';

export class CategoryDataStub implements CategoryData {
  public children: readonly CategoryOrScriptData[] = [createScriptDataWithCode()];

  public id = `[${CategoryDataStub.name}]id`;

  public category = 'category name';

  public docs?: DocumentationData;

  public withId(id: string) {
    this.id = id;
    return this;
  }

  public withChildren(children: readonly CategoryOrScriptData[]) {
    this.children = children;
    return this;
  }

  public withName(name: string) {
    this.category = name;
    return this;
  }

  public withDocs(docs: DocumentationData) {
    this.docs = docs;
    return this;
  }
}
