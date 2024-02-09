export function parseHtml(htmlString: string): Document {
  const parser = new window.DOMParser();
  const htmlDoc = parser.parseFromString(htmlString, 'text/html');
  return htmlDoc;
}
