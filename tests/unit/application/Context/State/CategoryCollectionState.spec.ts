import { describe, it, expect } from 'vitest';
import { UserSelectionStub } from '@tests/unit/shared/Stubs/UserSelectionStub';
import { CategoryCollectionState } from '@/application/Context/State/CategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';
import { ScriptMetadataStub } from '@tests/unit/shared/Stubs/ScriptMetadataStub';
import type { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { ApplicationCodeStub } from '@tests/unit/shared/Stubs/ApplicationCodeStub';
import type { ScriptMetadata } from '@/domain/ScriptMetadata/ScriptMetadata';
import { expectExists } from '@tests/shared/Assertions/ExpectExists';
import type { ReadonlyScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import { ScriptSelectionStub } from '@tests/unit/shared/Stubs/ScriptSelectionStub';
import type { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import type { CodeFactory, FilterFactory, SelectionFactory } from '@/application/Context/State/CategoryCollectionState';
import { FilterContextStub } from '@tests/unit/shared/Stubs/FilterContextStub';

describe('CategoryCollectionState', () => {
  describe('code', () => {
    it('uses the correct script metadata', () => {
      // arrange
      const expected = new ScriptMetadataStub();
      const collection = new CategoryCollectionStub()
        .withScriptMetadata(expected);
      let actual: ScriptMetadata | undefined;
      const codeFactoryMock: CodeFactory = (_, scriptMetadata) => {
        actual = scriptMetadata;
        return new ApplicationCodeStub();
      };
      // act
      new CategoryCollectionStateBuilder()
        .withCollection(collection)
        .withCodeFactory(codeFactoryMock)
        .build();
      // assert
      expectExists(actual);
      expect(actual).to.equal(expected);
    });
    it('initializes with the expected script selection', () => {
      // arrange
      const expectedScriptSelection = new ScriptSelectionStub();
      const selectionFactoryMock: SelectionFactory = () => {
        return new UserSelectionStub().withScripts(expectedScriptSelection);
      };
      let actualScriptSelection: ReadonlyScriptSelection | undefined;
      const codeFactoryMock: CodeFactory = (scriptSelection) => {
        actualScriptSelection = scriptSelection;
        return new ApplicationCodeStub();
      };
      // act
      new CategoryCollectionStateBuilder()
        .withCodeFactory(codeFactoryMock)
        .withSelectionFactory(selectionFactoryMock)
        .build();
      // assert
      expectExists(actualScriptSelection);
      expect(actualScriptSelection).to.equal(expectedScriptSelection);
    });
  });
  describe('os', () => {
    it('matches the operating system of the collection', () => {
      // arrange
      const expected = OperatingSystem.macOS;
      const collection = new CategoryCollectionStub()
        .withOs(expected);
      // act
      const sut = new CategoryCollectionStateBuilder()
        .withCollection(collection)
        .build();
      // assert
      const actual = sut.os;
      expect(expected).to.equal(actual);
    });
  });
  describe('selection', () => {
    it('initializes with empty scripts', () => {
      // arrange
      const expectedScripts: readonly SelectedScript[] = [];
      let actualScripts: readonly SelectedScript[] | undefined;
      const selectionFactoryMock: SelectionFactory = (_, scripts) => {
        actualScripts = scripts;
        return new UserSelectionStub();
      };
      // act
      new CategoryCollectionStateBuilder()
        .withSelectionFactory(selectionFactoryMock)
        .build();
      // assert
      expectExists(actualScripts);
      expect(actualScripts).to.deep.equal(expectedScripts);
    });
    it('initializes with the provided collection', () => {
      // arrange
      const expectedCollection = new CategoryCollectionStub();
      let actualCollection: CategoryCollection | undefined;
      const selectionFactoryMock: SelectionFactory = (collection) => {
        actualCollection = collection;
        return new UserSelectionStub();
      };
      // act
      new CategoryCollectionStateBuilder()
        .withCollection(expectedCollection)
        .withSelectionFactory(selectionFactoryMock)
        .build();
      // assert
      expectExists(actualCollection);
      expect(actualCollection).to.equal(expectedCollection);
    });
  });
  describe('filter', () => {
    it('initializes with the provided collection for filtering', () => {
      // arrange
      const expectedCollection = new CategoryCollectionStub();
      let actualCollection: CategoryCollection | undefined;
      const filterFactoryMock: FilterFactory = (collection) => {
        actualCollection = collection;
        return new FilterContextStub();
      };
      // act
      new CategoryCollectionStateBuilder()
        .withCollection(expectedCollection)
        .withFilterFactory(filterFactoryMock)
        .build();
      // assert
      expectExists(expectedCollection);
      expect(expectedCollection).to.equal(actualCollection);
    });
  });
});

class CategoryCollectionStateBuilder {
  private collection: CategoryCollection = new CategoryCollectionStub();

  private codeFactory: CodeFactory = () => new ApplicationCodeStub();

  private selectionFactory: SelectionFactory = () => new UserSelectionStub();

  private filterFactory: FilterFactory = () => new FilterContextStub();

  public withCollection(collection: CategoryCollection): this {
    this.collection = collection;
    return this;
  }

  public withCodeFactory(codeFactory: CodeFactory): this {
    this.codeFactory = codeFactory;
    return this;
  }

  public withSelectionFactory(selectionFactory: SelectionFactory): this {
    this.selectionFactory = selectionFactory;
    return this;
  }

  public withFilterFactory(filterFactory: FilterFactory): this {
    this.filterFactory = filterFactory;
    return this;
  }

  public build() {
    return new CategoryCollectionState(
      this.collection,
      this.selectionFactory,
      this.codeFactory,
      this.filterFactory,
    );
  }
}
