import { describe, it, expect } from 'vitest';
import type { Category } from '@/domain/Executables/Category/Category';
import { OperatingSystem } from '@/domain/OperatingSystem';
import type { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { ScriptingLanguage } from '@/domain/ScriptingLanguage';
import { RecommendationLevel } from '@/domain/Executables/Script/RecommendationLevel';
import { getEnumValues } from '@/application/Common/Enum';
import { CategoryCollection } from '@/domain/Collection/CategoryCollection';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { EnumRangeTestRunner } from '@tests/unit/application/Common/EnumRangeTestRunner';

describe('CategoryCollection', () => {
  describe('getScriptsByLevel', () => {
    it('filters out scripts without levels', () => {
      // arrange
      const recommendationLevels = getEnumValues(RecommendationLevel);
      const scriptsWithLevels = recommendationLevels.map(
        (level, index) => new ScriptStub(`Script${index}`).withLevel(level),
      );
      const toIgnore = new ScriptStub('script-to-ignore').withLevel(undefined);
      for (const currentLevel of recommendationLevels) {
        const category = new CategoryStub('parent-action')
          .withScripts(...scriptsWithLevels)
          .withScript(toIgnore);
        const sut = new TestContext()
          .withActions([category])
          .construct();
        // act
        const actual = sut.getScriptsByLevel(currentLevel);
        // assert
        expect(actual).to.not.include(toIgnore);
      }
    });
    it(`${RecommendationLevel[RecommendationLevel.Standard]} filters ${RecommendationLevel[RecommendationLevel.Strict]}`, () => {
      // arrange
      const level = RecommendationLevel.Standard;
      const expected = [
        new ScriptStub('S1').withLevel(level),
        new ScriptStub('S2').withLevel(level),
      ];
      const actions = [
        new CategoryStub('parent-category').withScripts(
          ...expected,
          new ScriptStub('S3').withLevel(RecommendationLevel.Strict),
        ),
      ];
      const sut = new TestContext()
        .withActions(actions)
        .construct();
      // act
      const actual = sut.getScriptsByLevel(level);
      // assert
      expect(expected).to.deep.equal(actual);
    });
    it(`${RecommendationLevel[RecommendationLevel.Strict]} includes ${RecommendationLevel[RecommendationLevel.Standard]}`, () => {
      // arrange
      const level = RecommendationLevel.Strict;
      const expected = [
        new ScriptStub('S1').withLevel(RecommendationLevel.Standard),
        new ScriptStub('S2').withLevel(RecommendationLevel.Strict),
      ];
      const actions = [
        new CategoryStub('parent-category').withScripts(...expected),
      ];
      const sut = new TestContext()
        .withActions(actions)
        .construct();
      // act
      const actual = sut.getScriptsByLevel(level);
      // assert
      expect(expected).to.deep.equal(actual);
    });
    describe('throws when given invalid level', () => {
      new EnumRangeTestRunner<RecommendationLevel>((level) => {
        // arrange
        const sut = new TestContext()
          .construct();
        // act
        sut.getScriptsByLevel(level);
      })
      // assert
        .testOutOfRangeThrows()
        .testValidValueDoesNotThrow(RecommendationLevel.Standard);
    });
  });
  describe('totalScripts', () => {
    it('returns total of initial scripts', () => {
      // arrange
      const categories = [
        new CategoryStub('category-1').withScripts(
          new ScriptStub('S1').withLevel(RecommendationLevel.Standard),
        ),
        new CategoryStub('category-2').withScripts(
          new ScriptStub('S2'),
          new ScriptStub('S3').withLevel(RecommendationLevel.Strict),
        ),
        new CategoryStub('category-3').withCategories(
          new CategoryStub('category-3-subcategory-1').withScripts(new ScriptStub('S4')),
        ),
      ];
      // act
      const sut = new TestContext()
        .withActions(categories)
        .construct();
      // assert
      expect(sut.totalScripts).to.equal(4);
    });
  });
  describe('totalCategories', () => {
    it('returns total of initial categories', () => {
      // arrange
      const expected = 4;
      const categories = [
        new CategoryStub('category-1').withScripts(new ScriptStub('S1').withLevel(RecommendationLevel.Strict)),
        new CategoryStub('category-2').withScripts(new ScriptStub('S2'), new ScriptStub('S3')),
        new CategoryStub('category-3').withCategories(new CategoryStub('category-3-subcategory-1').withScripts(new ScriptStub('S4'))),
      ];
      // act
      const sut = new TestContext()
        .withActions(categories)
        .construct();
      // assert
      expect(sut.totalCategories).to.equal(expected);
    });
  });
  describe('os', () => {
    it('sets os as expected', () => {
      // arrange
      const expected = OperatingSystem.macOS;
      // act
      const sut = new TestContext()
        .withOs(expected)
        .construct();
      // assert
      expect(sut.os).to.deep.equal(expected);
    });
  });
  describe('scriptingDefinition', () => {
    it('sets scriptingDefinition as expected', () => {
      // arrange
      const expected = getValidScriptingDefinition();
      // act
      const sut = new TestContext()
        .withScripting(expected)
        .construct();
      // assert
      expect(sut.scripting).to.deep.equal(expected);
    });
  });
  describe('getCategory', () => {
    it('throws if category is not found', () => {
      // arrange
      const missingCategoryId = 'missing-category-id';
      const expectedError = `Missing category with ID: "${missingCategoryId}"`;
      const collection = new TestContext()
        .withActions([new CategoryStub(`different than ${missingCategoryId}`).withMandatoryScripts()])
        .construct();
      // act
      const act = () => collection.getCategory(missingCategoryId);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('finds correct category', () => {
      // arrange
      const existingCategoryId = 'expected-action-category-id';
      const expectedCategory = new CategoryStub(existingCategoryId).withMandatoryScripts();
      const collection = new TestContext()
        .withActions([expectedCategory])
        .construct();
      // act
      const actualCategory = collection.getCategory(existingCategoryId);
      // assert
      expect(actualCategory).to.equal(expectedCategory);
    });
  });
  describe('getScript', () => {
    it('throws if script is not found', () => {
      // arrange
      const scriptId = 'missingScript';
      const expectedError = `Missing script: ${scriptId}`;
      const collection = new TestContext()
        .withActions([new CategoryStub('parent-action').withMandatoryScripts()])
        .construct();
      // act
      const act = () => collection.getScript(scriptId);
      // assert
      expect(act).to.throw(expectedError);
    });
    it('finds correct script', () => {
      // arrange
      const scriptId = 'existingScript';
      const expectedScript = new ScriptStub(scriptId);
      const parentCategory = new CategoryStub('parent-action')
        .withMandatoryScripts()
        .withScript(expectedScript);
      const collection = new TestContext()
        .withActions([parentCategory])
        .construct();
      // act
      const actualScript = collection.getScript(scriptId);
      // assert
      expect(actualScript).to.equal(expectedScript);
    });
  });
});

function getValidScriptingDefinition(): IScriptingDefinition {
  return {
    fileExtension: '.bat',
    language: ScriptingLanguage.batchfile,
    startCode: 'start',
    endCode: 'end',
  };
}

class TestContext {
  private os = OperatingSystem.Windows;

  private actions: readonly Category[] = [
    new CategoryStub(`[${TestContext.name}]-action-1`).withMandatoryScripts(),
  ];

  private scriptingDefinition: IScriptingDefinition = getValidScriptingDefinition();

  public withOs(os: OperatingSystem): this {
    this.os = os;
    return this;
  }

  public withActions(actions: readonly Category[]): this {
    this.actions = actions;
    return this;
  }

  public withScripting(scriptingDefinition: IScriptingDefinition): this {
    this.scriptingDefinition = scriptingDefinition;
    return this;
  }

  public construct(): CategoryCollection {
    return new CategoryCollection(this.os, this.actions, this.scriptingDefinition);
  }
}
