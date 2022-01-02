export class ExpressionPosition {
  constructor(
    public readonly start: number,
    public readonly end: number,
  ) {
    if (start === end) {
      throw new Error(`no length (start = end = ${start})`);
    }
    if (start > end) {
      throw Error(`start (${start}) after end (${end})`);
    }
    if (start < 0) {
      throw Error(`negative start position: ${start}`);
    }
  }
}
