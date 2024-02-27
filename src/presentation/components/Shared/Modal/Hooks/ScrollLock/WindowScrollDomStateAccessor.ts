import type { ScrollDomStateAccessor } from './ScrollDomStateAccessor';

const HtmlElement = document.documentElement;
const BodyElement = document.body;

export function getWindowDomState(): ScrollDomStateAccessor {
  return new WindowScrollDomState();
}

class WindowScrollDomState implements ScrollDomStateAccessor {
  get bodyStyleOverflowX(): string { return BodyElement.style.overflowX; }

  set bodyStyleOverflowX(value: string) { BodyElement.style.overflowX = value; }

  get bodyStyleOverflowY(): string { return BodyElement.style.overflowY; }

  set bodyStyleOverflowY(value: string) { BodyElement.style.overflowY = value; }

  get htmlScrollLeft(): number { return HtmlElement.scrollLeft; }

  set htmlScrollLeft(value: number) { HtmlElement.scrollLeft = value; }

  get htmlScrollTop(): number { return HtmlElement.scrollTop; }

  set htmlScrollTop(value: number) { HtmlElement.scrollTop = value; }

  get bodyStyleLeft(): string { return BodyElement.style.left; }

  set bodyStyleLeft(value: string) { BodyElement.style.left = value; }

  get bodyStyleTop(): string { return BodyElement.style.top; }

  set bodyStyleTop(value: string) { BodyElement.style.top = value; }

  get bodyStylePosition(): string { return BodyElement.style.position; }

  set bodyStylePosition(value: string) { BodyElement.style.position = value; }

  get bodyStyleWidth(): string { return BodyElement.style.width; }

  set bodyStyleWidth(value: string) { BodyElement.style.width = value; }

  get bodyStyleHeight(): string { return BodyElement.style.height; }

  set bodyStyleHeight(value: string) { BodyElement.style.height = value; }

  get bodyComputedMarginLeft(): string { return window.getComputedStyle(BodyElement).marginLeft; }

  get bodyComputedMarginRight(): string { return window.getComputedStyle(BodyElement).marginRight; }

  get bodyComputedMarginTop(): string { return window.getComputedStyle(BodyElement).marginTop; }

  get bodyComputedMarginBottom(): string {
    return window.getComputedStyle(BodyElement).marginBottom;
  }

  get htmlScrollWidth(): number { return HtmlElement.scrollWidth; }

  get htmlScrollHeight(): number { return HtmlElement.scrollHeight; }

  get htmlClientWidth(): number { return HtmlElement.clientWidth; }

  get htmlClientHeight(): number { return HtmlElement.clientHeight; }
}
