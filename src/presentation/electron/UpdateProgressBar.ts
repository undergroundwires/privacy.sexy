import ProgressBar from 'electron-progressbar';
import { ProgressInfo } from 'electron-builder';
import { app } from 'electron';
import log from 'electron-log';

export class UpdateProgressBar {
    private progressBar: ProgressBar;
    private showingProgress = false;
    public showIndeterminateState() {
        this.progressBar?.close();
        this.progressBar = progressBarFactory.createWithIndeterminateState();
    }
    public showProgress(progress: ProgressInfo) {
        if (!this.showingProgress) { // First time showing progress
            this.progressBar?.close();
            this.showingProgress = true;
        } else {
            updateProgressBar(progress, this.progressBar);
        }
    }
    public showError(e: Error) {
        const reportUpdateError = () => {
            this.progressBar.detail =
                'An error occurred while fetching updates.\n'
                + (e && e.message ? e.message : e);
            this.progressBar._window.setClosable(true);
        };
        if (this.progressBar._window) {
            reportUpdateError();
        } else {
            this.progressBar.on('ready', () => reportUpdateError());
        }
    }
    public close() {
        if (!this.progressBar.isCompleted()) {
            this.progressBar.close();
        }
    }
}

function getUpdatePercent(progress: ProgressInfo) {
    let percent = progress.percent;
    if (percent) {
        percent = Math.round(percent * 100) / 100;
    }
    return percent;
}

const progressBarFactory = {
    createWithIndeterminateState: () => {
        return new ProgressBar({
            title: `${app.name} Update`,
            text: `Downloading ${app.name} update...`,
        });
    },
    createWithPercentile: (initialProgress: ProgressInfo) => {
        const percent = getUpdatePercent(initialProgress);
        const progressBar = new ProgressBar({
            indeterminate: false,
            title: `${app.name} Update`,
            text: `Downloading ${app.name} update...`,
            detail: `${percent}% ...`,
            initialValue: percent,
        });
        progressBar
            .on('completed', () => {
                progressBar.detail = 'Download completed.';
            })
            .on('aborted', (value) => {
                log.info(`progress aborted... ${value}`);
            })
            .on('progress', (value) => {
                progressBar.detail = `${value}% ...`;
            })
            .on('ready', () => {
                // initialValue doesn't set the UI, so this is needed to render it correctly
                progressBar.value = percent;
            });
        return progressBar;
    },
};


function updateProgressBar(progress: ProgressInfo, progressBar: ProgressBar) {
    progressBar.value = getUpdatePercent(progress);
}
