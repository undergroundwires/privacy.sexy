import type { CategoryData, CategoryOrScriptData, DocumentationData } from '@/application/collections/';
import { ScriptDataStub } from './ScriptDataStub';

export class CategoryDataStub implements CategoryData {
  public children: readonly CategoryOrScriptData[] = [ScriptDataStub.createWithCode()];

  public category = 'category name';

  public docs?: DocumentationData;

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
