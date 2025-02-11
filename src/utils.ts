import * as vscode from 'vscode';
import {join} from 'path';

export function getDartBinaryPath() {
    let dartConfigPath = vscode.workspace.getConfiguration('dart').get<string>('sdkPath')
    if (dartConfigPath) join(dartConfigPath, 'bin/dart');

    // if there's no `dart.sdkPath`, fall back to `dart`
    return 'dart';
}