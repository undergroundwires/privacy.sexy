export class ExpressionRegexBuilder {
  private readonly parts = new Array<string>();

  public expectCharacters(characters: string) {
    return this.addRawRegex(
      characters
        .replaceAll('$', '\\$')
        .replaceAll('.', '\\.'),
    );
  }

  public expectOneOrMoreWhitespaces() {
    return this
      .addRawRegex('\\s+');
  }

  public matchPipeline() {
    return this
      .expectZeroOrMoreWhitespaces()
      .addRawRegex('(\\|\\s*.+?)?');
  }

  public matchUntilFirstWhitespace() {
    return this
      .addRawRegex('([^|\\s]+)');
  }

  public matchMultilineAnythingExceptSurroundingWhitespaces() {
    return this
      .expectZeroOrMoreWhitespaces()
      .addRawRegex('([\\S\\s]+?)')
      .expectZeroOrMoreWhitespaces();
  }

  public expectExpressionStart() {
    return this
      .expectCharacters('{{')
      .expectZeroOrMoreWhitespaces();
  }

  public expectExpressionEnd() {
    return this
      .expectZeroOrMoreWhitespaces()
      .expectCharacters('}}');
  }

  public buildRegExp(): RegExp {
    return new RegExp(this.parts.join(''), 'g');
  }

  private expectZeroOrMoreWhitespaces() {
    return this
      .addRawRegex('\\s*');
  }

  private addRawRegex(regex: string) {
    this.parts.push(regex);
    return this;
  }
}
