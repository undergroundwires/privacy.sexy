import { describe, it, expect } from 'vitest';
import { FilterResult } from '@/application/Context/State/Filter/FilterResult';
import { CategoryStub } from '@tests/unit/shared/Stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/shared/Stubs/ScriptStub';

describe('FilterResult', () => {
  describe('hasAnyMatches', () => {
    it('false when no matches', () => {
      const sut = new FilterResult(
        /* scriptMatches */ [],
        /* categoryMatches */ [],
        'query',
      );
      const actual = sut.hasAnyMatches();
      expect(actual).to.equal(false);
    });
    it('true when script matches', () => {
      const sut = new FilterResult(
        /* scriptMatches */ [new ScriptStub('id')],
        /* categoryMatches */ [],
        'query',
      );
      const actual = sut.hasAnyMatches();
      expect(actual).to.equal(true);
    });
    it('true when category matches', () => {
      const sut = new FilterResult(
        /* scriptMatches */ [],
        /* categoryMatches */ [new CategoryStub(5)],
        'query',
      );
      const actual = sut.hasAnyMatches();
      expect(actual).to.equal(true);
    });
    it('true when script + category matches', () => {
      const sut = new FilterResult(
        /* scriptMatches */ [new ScriptStub('id')],
        /* categoryMatches */ [new CategoryStub(5)],
        'query',
      );
      const actual = sut.hasAnyMatches();
      expect(actual).to.equal(true);
    });
  });
});
