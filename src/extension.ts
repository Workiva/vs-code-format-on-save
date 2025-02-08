import * as vscode from 'vscode';
import { execFile } from "child_process";
import {join} from 'path';
import { existsSync, readFileSync } from 'fs';
import YAML from 'yaml'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('OverReact Format');

	let folder = vscode.workspace.workspaceFolders![0].uri.path;

	let hasDartDev = false;
	let pubspecPath = join(folder, 'pubspec.yaml');
	if (existsSync(pubspecPath)) {
		let pubspec = YAML.parse(readFileSync(pubspecPath).toString())

		hasDartDev = pubspec['dev_dependencies']['dart_dev'] != null;
	}

	let dartBinaryPath: string
	let dartConfigPath = vscode.workspace.getConfiguration('dart').get<string>('sdkPath')
	if (dartConfigPath) {
		dartBinaryPath = join(dartConfigPath, 'bin/dart');
	} else {
		// if there's no `dart.sdkPath`, fall back to `dart`
		dartBinaryPath = 'dart';
	}

	vscode.languages.registerDocumentFormattingEditProvider('dart', {
		provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
			const args = [];
			if (hasDartDev) {
				args.push('run', 'dart_dev', 'hackFastFormat', document.uri.path)
			} else {
				args.push('format', document.uri.path)
			}

			execFile(dartBinaryPath, args, { cwd: folder })
				.on('error', (e) => outputChannel.appendLine(`error encountered: ${e}`));

			return [];
		}
	})
}

// This method is called when your extension is deactivated
export function deactivate() {}
