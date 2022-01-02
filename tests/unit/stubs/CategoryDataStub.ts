import { CategoryData, CategoryOrScriptData, DocumentationUrlsData } from 'js-yaml-loader!@/*';
import { ScriptDataStub } from './ScriptDataStub';

export class CategoryDataStub implements CategoryData {
  public children: readonly CategoryOrScriptData[] = [ScriptDataStub.createWithCode()];

  public category = 'category name';

  public docs?: DocumentationUrlsData;

  public withChildren(children: readonly CategoryOrScriptData[]) {
    this.children = children;
    return this;
  }

  public withName(name: string) {
    this.category = name;
    return this;
  }

  public withDocs(docs: DocumentationUrlsData) {
    this.docs = docs;
    return this;
  }
}
