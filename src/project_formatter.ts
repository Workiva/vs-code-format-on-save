import { searchFilesByName } from './utils';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FormatRunner } from './format_runners/format_runner';
import { OverReactFormatRunner } from './format_runners/over_react_format_runner';
import { DartFormatRunner } from './format_runners/dart_format_runner';

export class ProjectFormatter implements vscode.Disposable{
    private root: string;

    private formatters: Map<string, FormatRunner> = new Map();

    constructor(root: string) {
        this.root = root;
    }

    dispose() {
        for (let formatter of this.formatters.values()) {
            formatter.dispose();
        }
    }

    async init() {
        // TODO: this is slow, consider improving the perf
        let pubspecs = await searchFilesByName(this.root, 'pubspec.yaml', 5);

        await Promise.all(pubspecs.map(async (pubspecPath) => {
            let pkgDir = path.dirname(pubspecPath);
            let pubspec = (await fs.readFile(pubspecPath)).toString();

            let hasOverReactFormat = pubspec.includes('  over_react_format:');
            let formatter: FormatRunner = hasOverReactFormat 
                ? new OverReactFormatRunner(pkgDir)
                : new DartFormatRunner();

            this.formatters.set(pkgDir, formatter);
        }));
    }

    async format(path: string, content: string): Promise<string> {
        let projects = [...this.formatters.keys()];
        projects.sort((a, b) => b.length - a.length);

        let key = projects.find((key) => path.startsWith(key));
        if (key == null) return content;

        let formatter = this.formatters.get(key)!;
        return formatter.format(content);
    }
}

interface PackageConfig {
    path: string;
    formatter: 'over_react_format' | 'dart_format';
    formatterVersion: string | undefined;
}