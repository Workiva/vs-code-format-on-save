import { searchFilesByName } from './utils';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as yaml from 'yaml';
import semver from 'semver';
import { FormatRunner } from './format_runners/format_runner';
import { OverReactFormatRunner } from './format_runners/over_react_format_runner';
import { DartFormatRunner } from './format_runners/dart_format_runner';
import { NoOpFormatRunner } from './format_runners/no_op_format_runner';

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
            let dir = path.dirname(pubspecPath);
            this.formatters.set(dir, await this.determineFormatter(dir));
        }));
    }

    async format(path: string, content: string): Promise<string> {
        let projects = [...this.formatters.keys()];
        projects.sort((a, b) => b.length - a.length);

        let key = projects.find((key) => path.startsWith(key));
        if (key == null) return content;

        let formatter = this.formatters.get(key);
        if (formatter == null) return content;

        return formatter.format(content);
    }

    private async determineFormatter(pkgDir: string): Promise<FormatRunner> {
        let pubspec = (await fs.readFile(path.join(pkgDir, 'pubspec.yaml'))).toString();

        if (!pubspec.includes('  over_react_format:')) {
            return new DartFormatRunner();
        }

        try {
            let pubspecLock = (await fs.readFile(path.join(pkgDir, 'pubspec.lock'))).toString();
            let overReactFormatVersion = yaml.parse(pubspecLock)['packages']['over_react_format']['version'];

            const supportedOverReactVersion = '3.37.0';
            if (semver.gte(overReactFormatVersion, supportedOverReactVersion)) {
                return new OverReactFormatRunner(pkgDir);
            }
            throw Error(`over_react_format must be greater than v${supportedOverReactVersion}`)
        } catch (e: any) {
            let message = 'Unknown error';
            if (e.code === 'ENOENT') {
                message = 'Unable to locate pubspec.lock, run \'dart pub get\' to resolve';
            } else if (e instanceof Error) {
                message = e.message;
            }

            vscode.window.showErrorMessage(`Unable format with over_react_format. Disabling formatting.\nReason: '${message}'`);

            return new NoOpFormatRunner();
        }
    }
}