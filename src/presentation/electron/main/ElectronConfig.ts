/**
 * Abstraction for electron-vite specific logic and other Electron CLI helpers/wrappers.
 * Allows for agnostic application design and centralizes adjustments when switching wrappers.
 */

/// <reference types="electron-vite/node" />
import { join } from 'node:path';
import { app } from 'electron/main';
import appIcon from '@/presentation/public/icon-512x512.png?asset';

export const APP_ICON_PATH = appIcon;

export const RENDERER_DEV_SERVER_URL = process.env.ELECTRON_RENDERER_URL;

export const RENDERER_HTML_PATH = join(__dirname, '../renderer/index.html');

export const PRELOADER_SCRIPT_PATH = join(__dirname, '../preload/index.mjs');

export const IS_DEVELOPMENT = !app.isPackaged;
