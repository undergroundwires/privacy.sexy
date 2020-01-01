import { CodeRenderer } from './CodeRenderer';

export class AsciiArtRenderer extends CodeRenderer {
    public renderAsciiArt(version: string): string {
        if (!version) {
            throw new Error('Version is not defined');
        }
        return (
                    '██████╗ ██████╗ ██╗██╗   ██╗ █████╗  ██████╗██╗   ██╗███████╗███████╗██╗  ██╗██╗   ██╗\n' +
                    '██╔══██╗██╔══██╗██║██║   ██║██╔══██╗██╔════╝╚██╗ ██╔╝██╔════╝██╔════╝╚██╗██╔╝╚██╗ ██╔╝\n' +
                    '██████╔╝██████╔╝██║██║   ██║███████║██║      ╚████╔╝ ███████╗█████╗   ╚███╔╝  ╚████╔╝ \n' +
                    '██╔═══╝ ██╔══██╗██║╚██╗ ██╔╝██╔══██║██║       ╚██╔╝  ╚════██║██╔══╝   ██╔██╗   ╚██╔╝  \n' +
                    '██║     ██║  ██║██║ ╚████╔╝ ██║  ██║╚██████╗   ██║██╗███████║███████╗██╔╝ ██╗   ██║   \n' +
                    '╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝ ╚═════╝   ╚═╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝   ╚═╝ ')
            .split('\n').map((line) => this.renderComment(line)).join('\n') +
            `\n${this.renderComment(`https://privacy.sexy — v${version} — ${new Date().toUTCString()}`)}`;
    }
}
