import * as vscode from 'vscode';
import {join} from 'path';

import fs from 'fs/promises';

export const outputChannel = vscode.window.createOutputChannel('OverReact Format');

export function getDartBinaryPath() {
    let dartConfigPath = vscode.workspace.getConfiguration('dart').get<string>('sdkPath')
    if (dartConfigPath) join(dartConfigPath, 'bin/dart');

    // if there's no `dart.sdkPath`, fall back to `dart`
    return 'dart';
}

export async function searchFilesByName(dir: string, targetFile: string, maxDepth: number, currentDepth = 0) {
    if (currentDepth > maxDepth) return [];

    let results: string[] = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);

            if (entry.isFile() && entry.name === targetFile) {
                results.push(fullPath);
            } else if (entry.isDirectory()) {

                const subResults = await searchFilesByName(fullPath, targetFile, maxDepth, currentDepth + 1);
                results = results.concat(subResults);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
    }

    return results;
}