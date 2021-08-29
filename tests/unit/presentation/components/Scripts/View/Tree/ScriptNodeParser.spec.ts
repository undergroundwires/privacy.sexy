import 'mocha';
import { expect } from 'chai';
import { getScriptNodeId, getScriptId, getCategoryNodeId, getCategoryId } from '@/presentation/components/Scripts/View/ScriptsTree/ScriptNodeParser';
import { parseSingleCategory,
    parseAllCategories } from '@/presentation/components/Scripts/View/ScriptsTree/ScriptNodeParser';
import { INode, NodeType } from '@/presentation/components/Scripts/View/ScriptsTree/SelectableTree/Node/INode';
import { IScript } from '@/domain/IScript';
import { ICategory } from '@/domain/ICategory';
import { CategoryStub } from '@tests/unit/stubs/CategoryStub';
import { ScriptStub } from '@tests/unit/stubs/ScriptStub';
import { CategoryCollectionStub } from '@tests/unit/stubs/CategoryCollectionStub';

describe('ScriptNodeParser', () => {
    it('can convert script id and back', () => {
        // arrange
        const script = new ScriptStub('test');
        // act
        const nodeId = getScriptNodeId(script);
        const scriptId = getScriptId(nodeId);
        // assert
        expect(scriptId).to.equal(script.id);
    });
    it('can convert category id and back', () => {
        // arrange
        const category = new CategoryStub(55);
        // act
        const nodeId = getCategoryNodeId(category);
        const scriptId = getCategoryId(nodeId);
        // assert
        expect(scriptId).to.equal(category.id);
    });
    describe('parseSingleCategory', () => {
        it('can parse when category has sub categories', () => {
            // arrange
            const categoryId = 31;
            const firstSubCategory = new CategoryStub(11).withScriptIds('111', '112');
            const secondSubCategory = new CategoryStub(categoryId)
                .withCategory(new CategoryStub(33).withScriptIds('331', '331'))
                .withCategory(new CategoryStub(44).withScriptIds('44'));
            const collection = new CategoryCollectionStub().withAction(new CategoryStub(categoryId)
                .withCategory(firstSubCategory)
                .withCategory(secondSubCategory));
            // act
            const nodes = parseSingleCategory(categoryId, collection);
            // assert
            expect(nodes).to.have.lengthOf(2);
            expectSameCategory(nodes[0], firstSubCategory);
            expectSameCategory(nodes[1], secondSubCategory);
        });
        it('can parse when category has sub scripts', () => {
            // arrange
            const categoryId = 31;
            const scripts = [ new ScriptStub('script1'), new ScriptStub('script2'), new ScriptStub('script3') ];
            const collection = new CategoryCollectionStub()
                .withAction(new CategoryStub(categoryId).withScripts(...scripts));
            // act
            const nodes = parseSingleCategory(categoryId, collection);
            // assert
            expect(nodes).to.have.lengthOf(3);
            expectSameScript(nodes[0], scripts[0]);
            expectSameScript(nodes[1], scripts[1]);
            expectSameScript(nodes[2], scripts[2]);
        });
    });

    it('parseAllCategories parses as expected', () => {
        // arrange
        const collection = new CategoryCollectionStub()
            .withAction(new CategoryStub(0).withScriptIds('1, 2'))
            .withAction(new CategoryStub(1).withCategories(
                new CategoryStub(3).withScriptIds('3', '4'),
                new CategoryStub(4).withCategory(new CategoryStub(5).withScriptIds('6')),
            ));
        // act
        const nodes = parseAllCategories(collection);
        // assert
        expect(nodes).to.have.lengthOf(2);
        expectSameCategory(nodes[0], collection.actions[0]);
        expectSameCategory(nodes[1], collection.actions[1]);
    });
});

function isReversible(category: ICategory): boolean {
    if (category.scripts) {
        return category.scripts.every((s) => s.canRevert());
    }
    return category.subCategories.every((c) => isReversible(c));
}

function expectSameCategory(node: INode, category: ICategory): void {
    expect(node.type).to.equal(NodeType.Category, getErrorMessage('type'));
    expect(node.id).to.equal(getCategoryNodeId(category), getErrorMessage('id'));
    expect(node.documentationUrls).to.equal(category.documentationUrls, getErrorMessage('documentationUrls'));
    expect(node.text).to.equal(category.name, getErrorMessage('name'));
    expect(node.isReversible).to.equal(isReversible(category), getErrorMessage('isReversible'));
    expect(node.children).to.have.lengthOf(category.scripts.length || category.subCategories.length, getErrorMessage('name'));
    for (let i = 0; i < category.subCategories.length; i++)  {
        expectSameCategory(node.children[i], category.subCategories[i]);
    }
    for (let i = 0; i < category.scripts.length; i++)  {
        expectSameScript(node.children[i], category.scripts[i]);
    }
    function getErrorMessage(field: string) {
        return  `Unexpected node field: ${field}.\n` +
                `\nActual node:\n${print(node)}` +
                `\nExpected category:\n${print(category)}`;
    }
}

function expectSameScript(node: INode, script: IScript): void {
    expect(node.type).to.equal(NodeType.Script, getErrorMessage('type'));
    expect(node.id).to.equal(getScriptNodeId(script), getErrorMessage('id'));
    expect(node.documentationUrls).to.equal(script.documentationUrls, getErrorMessage('documentationUrls'));
    expect(node.text).to.equal(script.name, getErrorMessage('name'));
    expect(node.isReversible).to.equal(script.canRevert(), getErrorMessage('canRevert'));
    expect(node.children).to.equal(undefined);
    function getErrorMessage(field: string) {
        return  `Unexpected node field: ${field}.` +
                `\nActual node:\n${print(node)}\n` +
                `\nExpected script:\n${print(script)}`;
    }
}

function print(object: any) {
    return JSON.stringify(object, null, 2);
}
