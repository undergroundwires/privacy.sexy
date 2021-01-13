import fileSaver from 'file-saver';

export enum FileType {
    BatchFile,
    ShellScript,
}
export class SaveFileDialog {
    public static saveFile(text: string, fileName: string, type: FileType): void {
        const mimeType = this.mimeTypes.get(type);
        this.saveBlob(text, mimeType, fileName);
    }
    private static readonly mimeTypes = new Map<FileType, string>([
        // Some browsers (including firefox + IE) require right mime type
        // otherwise they ignore extension and save the file as text.
        [ FileType.BatchFile,   'application/bat' ],          // https://en.wikipedia.org/wiki/Batch_file
        [ FileType.ShellScript, 'text/x-shellscript' ],     // https://de.wikipedia.org/wiki/Shellskript#MIME-Typ
    ]);

    private static saveBlob(file: BlobPart, fileType: string, fileName: string): void {
        try {
            const blob = new Blob([file], { type: fileType });
            fileSaver.saveAs(blob, fileName);
        } catch (e) {
            window.open(`data:${fileType},${encodeURIComponent(file.toString())}`, '_blank', '');
        }
    }
}
