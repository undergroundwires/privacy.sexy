export class Clipboard {
  public static copyText(text: string): void {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', ''); // to avoid focus
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}
