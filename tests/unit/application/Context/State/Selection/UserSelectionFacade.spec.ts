import { describe, it } from 'vitest';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { UserSelectionFacade } from '@/application/Context/State/Selection/UserSelectionFacade';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import type { ScriptsFactory, CategoriesFactory } from '@/application/Context/State/Selection/UserSelectionFacade';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';
import { CategorySelectionStub } from '@tests/unit/shared/Stubs/CategorySelectionStub';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import { SelectedScriptStub } from '@tests/unit/shared/Stubs/SelectedScriptStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import type { ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';

describe('UserSelectionFacade', () => {
  describe('ctor', () => {
    describe('scripts', () => {
      it('constructs with expected collection', () => {
        // arrange
        const expectedCollection = new CategoryCollectionStub();
        let actualCollection: CategoryCollection | undefined;
        const factoryMock: ScriptsFactory = (collection) => {
          actualCollection = collection;
          return new ScriptSelectionStub();
        };
        const builder = new UserSelectionFacadeBuilder()
          .withCollection(expectedCollection)
          .withScriptsFactory(factoryMock);
        // act
        builder.construct();
        // assert
        expectExists(actualCollection);
        expect(actualCollection).to.equal(expectedCollection);
      });
      it('constructs with expected selected scripts', () => {
        // arrange
        const expectedScripts: readonly SelectedScript[] = [
          new SelectedScriptStub(new ScriptStub('1')),
        ];
        let actualScripts: readonly SelectedScript[] | undefined;
        const factoryMock: ScriptsFactory = (_, scripts) => {
          actualScripts = scripts;
          return new ScriptSelectionStub();
        };
        const builder = new UserSelectionFacadeBuilder()
          .withSelectedScripts(expectedScripts)
          .withScriptsFactory(factoryMock);
        // act
        builder.construct();
        // assert
        expectExists(actualScripts);
        expect(actualScripts).to.equal(expectedScripts);
      });
    });
    describe('categories', () => {
      it('constructs with expected collection', () => {
        // arrange
        const expectedCollection = new CategoryCollectionStub();
        let actualCollection: CategoryCollection | undefined;
        const factoryMock: CategoriesFactory = (_, collection) => {
          actualCollection = collection;
          return new CategorySelectionStub();
        };
        const builder = new UserSelectionFacadeBuilder()
          .withCollection(expectedCollection)
          .withCategoriesFactory(factoryMock);
        // act
        builder.construct();
        // assert
        expectExists(actualCollection);
        expect(actualCollection).to.equal(expectedCollection);
      });
      it('constructs with expected scripts', () => {
        // arrange
        const expectedScriptSelection = new ScriptSelectionStub();
        let actualScriptsSelection: ScriptSelection | undefined;
        const categoriesFactoryMock: CategoriesFactory = (selection) => {
          actualScriptsSelection = selection;
          return new CategorySelectionStub();
        };
        const scriptsFactoryMock: ScriptsFactory = () => {
          return expectedScriptSelection;
        };
        const builder = new UserSelectionFacadeBuilder()
          .withCategoriesFactory(categoriesFactoryMock)
          .withScriptsFactory(scriptsFactoryMock);
        // act
        builder.construct();
        // assert
        expectExists(actualScriptsSelection);
        expect(actualScriptsSelection).to.equal(expectedScriptSelection);
      });
    });
  });
});

class UserSelectionFacadeBuilder {
  private collection: CategoryCollection = new CategoryCollectionStub();

  private selectedScripts: readonly SelectedScript[] = [];

  private scriptsFactory: ScriptsFactory = () => new ScriptSelectionStub();

  private categoriesFactory: CategoriesFactory = () => new CategorySelectionStub();

  public withCollection(collection: CategoryCollection): this {
    this.collection = collection;
    return this;
  }

  public withSelectedScripts(selectedScripts: readonly SelectedScript[]): this {
    this.selectedScripts = selectedScripts;
    return this;
  }

  public withScriptsFactory(scriptsFactory: ScriptsFactory): this {
    this.scriptsFactory = scriptsFactory;
    return this;
  }

  public withCategoriesFactory(categoriesFactory: CategoriesFactory): this {
    this.categoriesFactory = categoriesFactory;
    return this;
  }

  public construct(): UserSelectionFacade {
    return new UserSelectionFacade(
      this.collection,
      this.selectedScripts,
      this.scriptsFactory,
      this.categoriesFactory,
    );
  }
}
