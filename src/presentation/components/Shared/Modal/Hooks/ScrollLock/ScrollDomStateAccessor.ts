export interface ScrollDomStateAccessor {
  bodyStyleOverflowX: string;
  bodyStyleOverflowY: string;
  htmlScrollLeft: number;
  htmlScrollTop: number;
  bodyStyleLeft: string;
  bodyStyleTop: string;
  bodyStylePosition: string;
  bodyStyleWidth: string;
  bodyStyleHeight: string;
  readonly bodyComputedMarginLeft: string;
  readonly bodyComputedMarginRight: string;
  readonly bodyComputedMarginTop: string;
  readonly bodyComputedMarginBottom: string;
  readonly htmlScrollWidth: number;
  readonly htmlScrollHeight: number;
  readonly htmlClientWidth: number;
  readonly htmlClientHeight: number;
  readonly htmlOffsetWidth: number;
  readonly htmlOffsetHeight: number;
}
