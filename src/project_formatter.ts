import { outputChannel, searchFilesByName } from './utils';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
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

    async formatRanges(path: string, content: string): Promise<string[]> {
        return [];
    }

    private async determineFormatter(pkgDir: string): Promise<FormatRunner> {
        let pubspec = (await fs.readFile(path.join(pkgDir, 'pubspec.yaml'))).toString();

        if (!pubspec.includes('  over_react_format:')) {
            outputChannel.appendLine(`'${pkgDir}': dart format`);
            return new DartFormatRunner();
        }

        try {
            let pubspecLock = (await fs.readFile(path.join(pkgDir, 'pubspec.lock'))).toString();

            let overReactFormatVersion = pubspecLock.match(/over_react_format:[\s\S]+?version:.*(\d+\.\d+\.\d+)/)?.[1]
            if (overReactFormatVersion == null) {
                throw Error('over_react_format exists in the pubspec, but not the lockfile. \'run pub get\' to resolve')
            }

            const supportedOverReactVersion = '3.39.0';
            if (semverGte(overReactFormatVersion, supportedOverReactVersion)) {
                outputChannel.appendLine(`'${pkgDir}': over_react_format`);
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

            outputChannel.appendLine(`'${pkgDir}': no op formatter (Reason: '${message}')`)

            return new NoOpFormatRunner();
        }
    }
}

function semverGte(version1: string, version2: string) {
    const parseVersion = (version: string) => version.split('.').map(parseInt);
  
    const v1 = parseVersion(version1);
    const v2 = parseVersion(version2);
  
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
      const num1 = v1[i] || 0; // Treat missing segments as 0
      const num2 = v2[i] || 0;
  
      if (num1 > num2) return true;
      if (num1 < num2) return false;
    }
  
    return true; // versions are equal
  }
  