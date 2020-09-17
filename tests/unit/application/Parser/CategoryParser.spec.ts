import 'mocha';
import { expect } from 'chai';
import { parseCategory } from '@/application/Parser/CategoryParser';
import { YamlCategory, CategoryOrScript, YamlScript } from 'js-yaml-loader!./application.yaml';
import { parseScript } from '@/application/Parser/ScriptParser';
import { parseDocUrls } from '@/application/Parser/DocumentationParser';
import { ScriptCompilerStub } from '../../stubs/ScriptCompilerStub';
import { YamlScriptStub } from '../../stubs/YamlScriptStub';

describe('CategoryParser', () => {
    describe('parseCategory', () => {
        describe('invalid category', () => {
            it('throws when undefined', () => {
                // arrange
                const expectedMessage = 'category is null or undefined';
                const category = undefined;
                const compiler = new ScriptCompilerStub();
                // act
                const act = () => parseCategory(category, compiler);
                // assert
                expect(act).to.throw(expectedMessage);
            });
            it('throws when children are empty', () => {
                // arrange
                const expectedMessage = 'category has no children';
                const category: YamlCategory = {
                    category: 'test',
                    children: [],
                };
                const compiler = new ScriptCompilerStub();
                // act
                const act = () => parseCategory(category, compiler);
                // assert
                expect(act).to.throw(expectedMessage);
            });
            it('throws when children are undefined', () => {
                // arrange
                const expectedMessage = 'category has no children';
                const category: YamlCategory = {
                    category: 'test',
                    children: undefined,
                };
                const compiler = new ScriptCompilerStub();
                // act
                const act = () => parseCategory(category, compiler);
                // assert
                expect(act).to.throw(expectedMessage);
            });
            it('throws when name is empty or undefined', () => {
                // arrange
                const expectedMessage = 'category has no name';
                const invalidNames = ['', undefined];
                invalidNames.forEach((invalidName) => {
                    const category: YamlCategory = {
                        category: invalidName,
                        children: getTestChildren(),
                    };
                    const compiler = new ScriptCompilerStub();
                    // act
                    const act = () => parseCategory(category, compiler);
                    // assert
                    expect(act).to.throw(expectedMessage);
                });
            });
        });
        it('throws when compiler is undefined', () => {
            // arrange
            const expectedError = 'undefined compiler';
            const compiler = undefined;
            const category = getValidCategory();
            // act
            const act = () => parseCategory(category, compiler);
            // assert
            expect(act).to.throw(expectedError);
        });
        it('returns expected docs', () => {
            // arrange
            const url = 'https://privacy.sexy';
            const expected = parseDocUrls({ docs: url });
            const compiler = new ScriptCompilerStub();
            const category: YamlCategory = {
                category: 'category name',
                children: getTestChildren(),
                docs: url,
            };
            // act
            const actual = parseCategory(category, compiler).documentationUrls;
            // assert
            expect(actual).to.deep.equal(expected);
        });
        describe('parses expected subscript', () => {
            it('single script with code', () => {
                // arrange
                const script = YamlScriptStub.createWithCode();
                const compiler = new ScriptCompilerStub();
                const expected = [ parseScript(script, compiler) ];
                const category: YamlCategory = {
                    category: 'category name',
                    children: [ script ],
                };
                // act
                const actual = parseCategory(category, compiler).scripts;
                // assert
                expect(actual).to.deep.equal(expected);
            });
            it('single script with function call', () => {
                // arrange
                const script = YamlScriptStub.createWithCall();
                const compiler = new ScriptCompilerStub()
                    .withCompileAbility(script);
                const expected = [ parseScript(script, compiler) ];
                const category: YamlCategory = {
                    category: 'category name',
                    children: [ script ],
                };
                // act
                const actual = parseCategory(category, compiler).scripts;
                // assert
                expect(actual).to.deep.equal(expected);
            });
            it('multiple scripts with function call and code', () => {
                // arrange
                const callableScript = YamlScriptStub.createWithCall();
                const scripts = [ callableScript, YamlScriptStub.createWithCode() ];
                const compiler = new ScriptCompilerStub()
                    .withCompileAbility(callableScript);
                const expected = scripts.map((script) => parseScript(script, compiler));
                const category: YamlCategory = {
                    category: 'category name',
                    children: scripts,
                };
                // act
                const actual = parseCategory(category, compiler).scripts;
                // assert
                expect(actual).to.deep.equal(expected);
            });
        });
        it('returns expected subcategories', () => {
            // arrange
            const expected: YamlCategory[]  = [ {
                category: 'test category',
                children: [ YamlScriptStub.createWithCode() ],
            }];
            const category: YamlCategory = {
                category: 'category name',
                children: expected,
            };
            const compiler = new ScriptCompilerStub();
            // act
            const actual = parseCategory(category, compiler).subCategories;
            // assert
            expect(actual).to.have.lengthOf(1);
            expect(actual[0].name).to.equal(expected[0].category);
            expect(actual[0].scripts.length).to.equal(expected[0].children.length);
        });
    });
});

function getValidCategory(): YamlCategory {
    return {
        category: 'category name',
        children: getTestChildren(),
        docs: undefined,
    };
}

function getTestChildren(): ReadonlyArray<CategoryOrScript> {
    return [
        YamlScriptStub.createWithCode(),
    ];
}
