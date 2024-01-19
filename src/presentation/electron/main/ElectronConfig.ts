/**
 * Abstraction for electron-vite specific logic and other Electron CLI helpers/wrappers.
 * Allows for agnostic application design and centralizes adjustments when switching wrappers.
 */

/// <reference types="electron-vite/node" />
import { join } from 'node:path';
import appIcon from '@/presentation/public/icon.png?asset';

export const APP_ICON_PATH = appIcon;

export const RENDERER_URL = process.env.ELECTRON_RENDERER_URL;

export const RENDERER_HTML_PATH = join('file://', __dirname, '../renderer/index.html');

export const PRELOADER_SCRIPT_PATH = join(__dirname, '../preload/index.cjs');
