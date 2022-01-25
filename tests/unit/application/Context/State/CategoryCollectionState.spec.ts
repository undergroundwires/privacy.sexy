import 'mocha';
import { expect } from 'chai';
import { UserSelection } from '@/application/Context/State/Selection/UserSelection';
import { ApplicationCode } from '@/application/Context/State/Code/ApplicationCode';
import { CategoryCollectionState } from '@/application/Context/State/CategoryCollectionState';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { IScript } from '@/domain/IScript';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { CategoryCollectionStub } from '@tests/unit/shared/Stubs/CategoryCollectionStub';

describe('CategoryCollectionState', () => {
  describe('code', () => {
    it('initialized with empty code', () => {
      // arrange
      const collection = new CategoryCollectionStub();
      const sut = new CategoryCollectionState(collection);
      // act
      const code = sut.code.current;
      // assert
      expect(!code);
    });
    it('reacts to selection changes as expected', () => {
      // arrange
      const collection = new CategoryCollectionStub()
        .withAction(new CategoryStub(0).withScriptIds('scriptId'));
      const selectionStub = new UserSelection(collection, []);
      const expectedCodeGenerator = new ApplicationCode(selectionStub, collection.scripting);
      selectionStub.selectAll();
      const expectedCode = expectedCodeGenerator.current;
      // act
      const sut = new CategoryCollectionState(collection);
      sut.selection.selectAll();
      const actualCode = sut.code.current;
      // assert
      expect(actualCode).to.equal(expectedCode);
    });
  });
  describe('os', () => {
    it('same as its collection', () => {
      // arrange
      const expected = OperatingSystem.macOS;
      const collection = new CategoryCollectionStub()
        .withOs(expected);
      // act
      const sut = new CategoryCollectionState(collection);
      // assert
      const actual = sut.os;
      expect(expected).to.equal(actual);
    });
  });
  describe('selection', () => {
    it('initialized with no selection', () => {
      // arrange
      const collection = new CategoryCollectionStub();
      const sut = new CategoryCollectionState(collection);
      // act
      const actual = sut.selection.selectedScripts.length;
      // assert
      expect(actual).to.equal(0);
    });
    it('can select a script from current collection', () => {
      // arrange
      const expectedScript = new ScriptStub('scriptId');
      const collection = new CategoryCollectionStub()
        .withAction(new CategoryStub(0).withScript(expectedScript));
      const sut = new CategoryCollectionState(collection);
      // act
      sut.selection.selectAll();
      // assert
      expect(sut.selection.selectedScripts.length).to.equal(1);
      expect(sut.selection.isSelected(expectedScript.id)).to.equal(true);
    });
  });
  describe('filter', () => {
    it('initialized with an empty filter', () => {
      // arrange
      const collection = new CategoryCollectionStub();
      const sut = new CategoryCollectionState(collection);
      // act
      const actual = sut.filter.currentFilter;
      // assert
      expect(actual).to.equal(undefined);
    });
    it('can match a script from current collection', () => {
      // arrange
      const scriptNameFilter = 'scriptName';
      const expectedScript = new ScriptStub('scriptId')
        .withName(scriptNameFilter);
      const collection = new CategoryCollectionStub()
        .withAction(new CategoryStub(0).withScript(expectedScript));
      const sut = new CategoryCollectionState(collection);
      // act
      let actualScript: IScript;
      sut.filter.filtered.on((result) => {
        [actualScript] = result.scriptMatches;
      });
      sut.filter.setFilter(scriptNameFilter);
      // assert
      expect(expectedScript).to.equal(actualScript);
    });
  });
});
