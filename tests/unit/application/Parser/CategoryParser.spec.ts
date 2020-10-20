import 'mocha';
import { expect } from 'chai';
import { parseCategory } from '@/application/Parser/CategoryParser';
import { YamlCategory, CategoryOrScript, YamlScript } from 'js-yaml-loader!./application.yaml';
import { parseScript } from '@/application/Parser/ScriptParser';
import { parseDocUrls } from '@/application/Parser/DocumentationParser';
import { RecommendationLevel } from '@/domain/RecommendationLevel';

describe('CategoryParser', () => {
    describe('parseCategory', () => {

        it('throws when undefined', () => {
            expect(() => parseCategory(undefined)).to.throw('category is null or undefined');
        });

        it('throws when children is empty', () => {
            const category: YamlCategory = {
                category: 'test',
                children: [],
            };
            expect(() => parseCategory(category)).to.throw('category has no children');
        });

        it('throws when children is undefined', () => {
            const category: YamlCategory = {
                category: 'test',
                children: undefined,
            };
            expect(() => parseCategory(category)).to.throw('category has no children');
        });

        it('throws when name is empty', () => {
            const category: YamlCategory = {
                category: '',
                children: getTestChildren(),
            };
            expect(() => parseCategory(category)).to.throw('category has no name');
        });

        it('throws when name is undefined', () => {
            const category: YamlCategory = {
                category: undefined,
                children: getTestChildren(),
            };
            expect(() => parseCategory(category)).to.throw('category has no name');
        });

        it('returns expected docs', () => {
            // arrange
            const url = 'https://privacy.sexy';
            const expected = parseDocUrls({ docs: url });
            const category: YamlCategory = {
                category: 'category name',
                children: getTestChildren(),
                docs: url,
            };
            // act
            const actual = parseCategory(category).documentationUrls;
            // assert
            expect(actual).to.deep.equal(expected);
        });

        it('returns expected scripts', () => {
            // arrange
            const script = getTestScript();
            const expected = [ parseScript(script) ];
            const category: YamlCategory = {
                category: 'category name',
                children: [ script ],
            };
            // act
            const actual = parseCategory(category).scripts;
            // assert
            expect(actual).to.deep.equal(expected);
        });

        it('returns expected subcategories', () => {
            // arrange
            const expected: YamlCategory[]  = [ {
                category: 'test category',
                children: [ getTestScript() ],
            }];
            const category: YamlCategory = {
                category: 'category name',
                children: expected,
            };
            // act
            const actual = parseCategory(category).subCategories;
            // assert
            expect(actual).to.have.lengthOf(1);
            expect(actual[0].name).to.equal(expected[0].category);
            expect(actual[0].scripts.length).to.equal(expected[0].children.length);
        });
    });
});

function getTestChildren(): ReadonlyArray<CategoryOrScript> {
    return [
        getTestScript(),
    ];
}

function getTestScript(): YamlScript {
    return {
        name: 'script name',
        code: 'script code',
        revertCode: 'revert code',
        recommend: RecommendationLevel[RecommendationLevel.Standard],
    };
}
