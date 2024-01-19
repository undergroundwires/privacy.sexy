import { ObjectDirective } from 'vue';

const attributeName = 'data-interaction-does-not-collapse';

export function hasDirective(el: Element): boolean {
  if (el.hasAttribute(attributeName)) {
    return true;
  }
  const parent = el.closest(`[${attributeName}]`);
  return !!parent;
}

export const NonCollapsing: ObjectDirective<HTMLElement> = {
  mounted(el: HTMLElement) {
    el.setAttribute(attributeName, '');
  },
};
