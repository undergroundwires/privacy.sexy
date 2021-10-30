import { app, dialog, shell } from 'electron';
import { ProjectInformation } from '@/domain/ProjectInformation';
import { OperatingSystem } from '@/domain/OperatingSystem';
import { UpdateInfo } from 'electron-updater';
import { UpdateProgressBar } from './UpdateProgressBar';
import fs from 'fs';
import path from 'path';
import log from 'electron-log';
import fetch from 'cross-fetch';

export function requiresManualUpdate(): boolean {
    return process.platform === 'darwin';
}

export async function handleManualUpdate(info: UpdateInfo) {
    const result = await askForVisitingWebsiteForManualUpdate();
    if (result === ManualDownloadDialogResult.NoAction) {
        return;
    }
    const project = new ProjectInformation(
        process.env.VUE_APP_NAME,
        info.version,
        process.env.VUE_APP_REPOSITORY_URL,
        process.env.VUE_APP_HOMEPAGE_URL,
    );
    if (result === ManualDownloadDialogResult.VisitReleasesPage) {
        await shell.openExternal(project.releaseUrl);
    } else if (result === ManualDownloadDialogResult.UpdateNow) {
        await download(info, project);
    }
}

enum ManualDownloadDialogResult {
    NoAction = 0,
    UpdateNow = 1,
    VisitReleasesPage = 2,
}
async function askForVisitingWebsiteForManualUpdate(): Promise<ManualDownloadDialogResult> {
    const visitPageResult = await dialog.showMessageBox({
        type: 'info',
        buttons: [
            'Not now', // First button is shown at bottom after some space in macOS and has default cancel behavior
            'Download and manually update',
            'Visit releases page',
        ],
        message: 'Update available\n\nWould you like to update manually?',
        detail:
            'There are new updates available.'
            + ' privacy.sexy does not support fully auto-update for macOS due to code signing costs.'
            + ' Please manually update your version, because newer versions fix issues and improve privacy and security.',
        defaultId: ManualDownloadDialogResult.UpdateNow,
        cancelId: ManualDownloadDialogResult.NoAction,
    });
    return visitPageResult.response;
}

async function download(info: UpdateInfo, project: ProjectInformation) {
    log.info('Downloading update manually');
    const progressBar = new UpdateProgressBar();
    progressBar.showIndeterminateState();
    try {
        const filePath = `${path.dirname(app.getPath('temp'))}/privacy.sexy/${info.version}-installer.dmg`;
        const parentFolder = path.dirname(filePath);
        if (fs.existsSync(filePath)) {
            log.info('Update is already downloaded');
            await fs.promises.unlink(filePath);
            log.info(`Deleted ${filePath}`);
        } else {
            await fs.promises.mkdir(parentFolder, { recursive: true });
        }
        const dmgFileUrl = project.getDownloadUrl(OperatingSystem.macOS);
        await downloadFileWithProgress(dmgFileUrl, filePath,
            (percentage) => { progressBar.showPercentage(percentage); });
        await shell.openPath(filePath);
        progressBar.close();
        app.quit();
    } catch (e) {
       progressBar.showError(e);
    }
}

type ProgressCallback = (progress: number) => void;

async function downloadFileWithProgress(
    url: string, filePath: string, progressHandler: ProgressCallback) {
    // We don't download through autoUpdater as it cannot download DMG but requires distributing ZIP
    log.info(`Fetching ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
        throw Error(`Unable to download, server returned ${response.status} ${response.statusText}`);
    }
    const contentLength = +response.headers.get('content-length');
    const writer = fs.createWriteStream(filePath);
    log.info(`Writing to ${filePath}, content length: ${contentLength}`);
    if (!contentLength) {
        log.error('Unknown content-length', Array.from(response.headers.entries()));
        progressHandler = () => { /* do nothing */ };
    }
    const reader = getReader(response);
    if (!reader) {
        throw new Error('No response body');
    }
    await streamWithProgress(contentLength, reader, writer, progressHandler);
}

async function streamWithProgress(
    totalLength: number,
    readStream: NodeJS.ReadableStream,
    writeStream: fs.WriteStream,
    progressHandler: ProgressCallback): Promise<void> {
    let receivedLength = 0;
    for await (const chunk of readStream) {
        if (!chunk) {
            throw Error('Empty chunk received during download');
        }
        writeStream.write(Buffer.from(chunk));
        receivedLength += chunk.length;
        const percentage = Math.floor((receivedLength / totalLength) * 100);
        progressHandler(percentage);
        log.debug(`Received ${receivedLength} of ${totalLength}`);
    }
    log.info(`Downloaded successfully`);
}

function getReader(response: Response): NodeJS.ReadableStream {
    // On browser, we could use browser API response.body.getReader()
    // But here, we use cross-fetch that gets node-fetch on a node application
    // This API is node-fetch specific, see https://github.com/node-fetch/node-fetch#streams
    return response.body as unknown as NodeJS.ReadableStream;
}
