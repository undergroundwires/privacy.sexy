import { FunctionRenderer } from './FunctionRenderer';

export class AdminRightsFunctionRenderer {
    private readonly functionRenderer: FunctionRenderer;

    constructor() {
        this.functionRenderer = new FunctionRenderer();
    }

    public renderAdminRightsFunction() {
        const name = 'Ensure admin privileges';
        const code = 'fltmc >nul 2>&1 || (\n' +
            '   echo This batch script requires administrator privileges. Right-click on\n' +
            '   echo the script and select "Run as administrator".\n' +
            '   pause\n' +
            '   exit 1\n' +
            ')';
        return this.functionRenderer.renderFunction(name, code);
    }
}
