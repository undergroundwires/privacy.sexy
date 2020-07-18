import { DirectiveOptions } from 'vue';

const attributeName = 'data-interactionDoesNotCollapse';

export function hasDirective(el: Element): boolean {
    if (el.hasAttribute(attributeName)) {
        return true;
    }
    const parent = el.closest(`[${attributeName}]`);
    return !!parent;
}

export const NonCollapsing: DirectiveOptions = {
    inserted(el: HTMLElement) {
        el.setAttribute(attributeName, '');
    },
};
