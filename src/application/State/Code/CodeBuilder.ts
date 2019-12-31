import { AdminRightsFunctionRenderer } from './Renderer/AdminRightsFunctionRenderer';
import { AsciiArtRenderer } from './Renderer/AsciiArtRenderer';
import { FunctionRenderer } from './Renderer/FunctionRenderer';
import { Script } from '@/domain/Script';

export class CodeBuilder {
    private readonly functionRenderer: FunctionRenderer;
    private readonly adminRightsFunctionRenderer: AdminRightsFunctionRenderer;
    private readonly asciiArtRenderer: AsciiArtRenderer;

    public constructor() {
        this.functionRenderer = new FunctionRenderer();
        this.adminRightsFunctionRenderer = new AdminRightsFunctionRenderer();
        this.asciiArtRenderer = new AsciiArtRenderer();
    }

    public buildCode(scripts: ReadonlyArray<Script>, version: string): string {
        if (!scripts) { throw new Error('scripts is undefined'); }
        if (!version) { throw new Error('version is undefined'); }
        return `@echo off\n\n${this.asciiArtRenderer.renderAsciiArt(version)}\n\n`
            + `${this.adminRightsFunctionRenderer.renderAdminRightsFunction()}\n\n`
            + scripts.map((script) => this.functionRenderer.renderFunction(script.name, script.code)).join('\n\n')
            + '\n\n'
            + 'pause\n'
            + 'exit /b 0';
    }
}
