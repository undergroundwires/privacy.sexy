import fileSaver from 'file-saver';

export class SaveFileDialog {
    public static saveText(text: string, fileName: string): void {
        this.saveBlob(text, 'text/plain;charset=utf-8', fileName);
    }

    private static saveBlob(file: BlobPart, fileType: string, fileName: string): void {
        try {
            const blob = new Blob([file], { type: fileType });
            fileSaver.saveAs(blob, fileName);
        } catch (e) {
            window.open('data:' + fileType + ',' + encodeURIComponent(file.toString()), '_blank', '');
        }
    }
}
