import { execFileSync } from "child_process"
import { FormatRunner } from "./format_runner"

import {join} from 'path';

import * as vscode from 'vscode';

export class DartFormatRunner implements FormatRunner {
    private dartBinaryPath: string

    constructor() {
        let dartConfigPath = vscode.workspace.getConfiguration('dart').get<string>('sdkPath')
        if (dartConfigPath) {
            this.dartBinaryPath = join(dartConfigPath, 'bin/dart');
        } else {
            // if there's no `dart.sdkPath`, fall back to `dart`
            this.dartBinaryPath = 'dart';
        }
    }

    async format(content: string): Promise<string> {
        return new Promise((acc, rej) => {
            let res = execFileSync(
                this.dartBinaryPath, 
                ['format'],
                { input: content }
            )

            acc(res.toString());
        })
    }
}