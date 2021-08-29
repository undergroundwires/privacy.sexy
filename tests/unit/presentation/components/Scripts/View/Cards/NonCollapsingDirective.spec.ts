import 'mocha';
import { expect } from 'chai';
import { NonCollapsing } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';
import { hasDirective } from '@/presentation/components/Scripts/View/Cards/NonCollapsingDirective';

const expectedAttributeName = 'data-interaction-does-not-collapse';

describe('NonCollapsingDirective', () => {
    describe('NonCollapsing', () => {
        it('adds expected attribute to the element when inserted', () => {
            // arrange
            const element = getElementMock();
            // act
            NonCollapsing.inserted(element, undefined, undefined, undefined);
            // assert
            expect(element.hasAttribute(expectedAttributeName));
        });
    });
    describe('hasDirective', () => {
        it('returns true if the element has expected attribute', () => {
            // arrange
            const element = getElementMock();
            element.setAttribute(expectedAttributeName, undefined);
            // act
            const actual = hasDirective(element);
            // assert
            expect(actual).to.equal(true);
        });
        it('returns true if the element has a parent with expected attribute', () => {
            // arrange
            const parent = getElementMock();
            const element = getElementMock();
            parent.appendChild(element);
            element.setAttribute(expectedAttributeName, undefined);
            // act
            const actual = hasDirective(element);
            // assert
            expect(actual).to.equal(true);
        });
        it('returns false if nor the element or its parent has expected attribute', () => {
            // arrange
            const element = getElementMock();
            // act
            const actual = hasDirective(element);
            // assert
            expect(actual).to.equal(false);
        });
    });
});

function getElementMock(): HTMLElement {
    const element = document.createElement('div');
    return element;
}
