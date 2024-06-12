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

  public isInInsideOf(potentialParent: ExpressionPosition): boolean {
    if (this.isSame(potentialParent)) {
      return false;
    }
    return potentialParent.start <= this.start
      && potentialParent.end >= this.end;
  }

  public isSame(other: ExpressionPosition): boolean {
    return other.start === this.start
      && other.end === this.end;
  }

  public isIntersecting(other: ExpressionPosition): boolean {
    return (other.start < this.end && other.end > this.start)
      || (this.end > other.start && other.start >= this.start);
  }
}
