import { CategoryStub } from '../../../../stubs/CategoryStub';
import { ScriptStub } from '../../../../stubs/ScriptStub';
import { FilterResult } from '@/application/Context/State/Filter/FilterResult';
import 'mocha';
import { expect } from 'chai';

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
                /* scriptMatches */ [ new ScriptStub('id') ],
                /* categoryMatches */ [],
                'query',
            );
            const actual = sut.hasAnyMatches();
            expect(actual).to.equal(true);
        });
        it('true when category matches', () => {
            const sut = new FilterResult(
                /* scriptMatches */ [ ],
                /* categoryMatches */ [ new CategoryStub(5) ],
                'query',
            );
            const actual = sut.hasAnyMatches();
            expect(actual).to.equal(true);
        });
        it('true when script + category matches', () => {
            const sut = new FilterResult(
                /* scriptMatches */ [ new ScriptStub('id') ],
                /* categoryMatches */ [ new CategoryStub(5) ],
                'query',
            );
            const actual = sut.hasAnyMatches();
            expect(actual).to.equal(true);
        });
    });
});
