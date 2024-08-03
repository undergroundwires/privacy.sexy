import { describe, it, expect } from 'vitest';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';
import { AppliedFilterResult } from '@/application/Context/State/Filter/Result/AppliedFilterResult';
import type { Category } from '@/domain/Executables/Category/Category';
import type { Script } from '@/domain/Executables/Script/Script';

describe('AppliedFilterResult', () => {
  describe('constructor', () => {
    it('initializes query correctly', () => {
      // arrange
      const expectedQuery = 'expected query';
      const builder = new ResultBuilder()
        .withQuery(expectedQuery);
      // act
      const result = builder.build();
      // assert
      const actualQuery = result.query;
      expect(actualQuery).to.equal(expectedQuery);
    });
  });
  describe('hasAnyMatches', () => {
    it('returns false with no matches', () => {
      // arrange
      const expected = false;
      const result = new ResultBuilder()
        .withScriptMatches([])
        .withCategoryMatches([])
        .build();
      // act
      const actual = result.hasAnyMatches();
      // assert
      expect(actual).to.equal(expected);
    });
    it('returns true with script matches', () => {
      // arrange
      const expected = true;
      const result = new ResultBuilder()
        .withScriptMatches([new ScriptStub('matched-script')])
        .withCategoryMatches([])
        .build();
      // act
      const actual = result.hasAnyMatches();
      expect(actual).to.equal(expected);
    });
    it('returns true with category matches', () => {
      // arrange
      const expected = true;
      const result = new ResultBuilder()
        .withScriptMatches([])
        .withCategoryMatches([new CategoryStub('matched-category')])
        .build();
      // act
      const actual = result.hasAnyMatches();
      expect(actual).to.equal(expected);
    });
    it('returns true with script and category matches', () => {
      // arrange
      const expected = true;
      const result = new ResultBuilder()
        .withScriptMatches([new ScriptStub('matched-script')])
        .withCategoryMatches([new CategoryStub('matched-category')])
        .build();
      // act
      const actual = result.hasAnyMatches();
      expect(actual).to.equal(expected);
    });
  });
});

class ResultBuilder {
  private scriptMatches: readonly Script[] = [
    new ScriptStub(`[${ResultBuilder.name}]matched-script`),
  ];

  private categoryMatches: readonly Category[] = [
    new CategoryStub(`[${ResultBuilder.name}]matched-category`),
  ];

  private query: string = `[${ResultBuilder.name}]query`;

  public withScriptMatches(scriptMatches: readonly Script[]): this {
    this.scriptMatches = scriptMatches;
    return this;
  }

  public withCategoryMatches(categoryMatches: readonly Category[]): this {
    this.categoryMatches = categoryMatches;
    return this;
  }

  public withQuery(query: string) {
    this.query = query;
    return this;
  }

  public build(): AppliedFilterResult {
    return new AppliedFilterResult(
      this.scriptMatches,
      this.categoryMatches,
      this.query,
    );
  }
}
