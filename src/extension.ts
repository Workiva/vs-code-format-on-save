import * as vscode from 'vscode';
import {join, dirname} from 'path';
import { existsSync, mkdirSync, readFileSync, watchFile } from 'fs';
import YAML from 'yaml';
import { OverReactFormatRunner } from './format_runners/over_react_format_runner';
import { FormatRunner } from './format_runners/format_runner';
import { DartFormatRunner } from './format_runners/dart_format_runner';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('OverReact Format');

	let root = (vscode.workspace.workspaceFolders ?? [])[0]?.uri?.path;
	if (root == null) return;

	let formatRunner: FormatRunner

	function updateFormatter() {
		let hasOverReactFormat = false;
		let pubspecPath = join(root, 'pubspec.yaml');
		if (existsSync(pubspecPath)) {
			let pubspec = readFileSync(pubspecPath).toString();
			hasOverReactFormat = pubspec.includes('  over_react_format:');
		}

		let overReactFormatBinary: string

		let pubspecLockPath = join(root, 'pubspec.lock');
		if (existsSync(pubspecLockPath)) {
			let lockfile = YAML.parse(readFileSync(pubspecLockPath).toString());

			let overReactFormatPackage = lockfile.packages['over_react_format'];
			if (overReactFormatPackage != null) {
				let version = overReactFormatPackage.version;
				overReactFormatBinary = join(context.extensionPath, 'bin', `over_react_format-${version}`);

				if (!existsSync(overReactFormatBinary)) {
					outputChannel.appendLine(`Downloading over_react_format v${version} binary`)
					mkdirSync(dirname(overReactFormatBinary), {recursive: true})
				}
			}
		}

		if (hasOverReactFormat) {
			formatRunner = new OverReactFormatRunner(overReactFormatBinary!, root)
		} else {
			formatRunner = new DartFormatRunner();
		}
	}

	updateFormatter();
	watchFile(join(root, 'pubspec.lock'), updateFormatter);

	vscode.languages.registerDocumentFormattingEditProvider('dart', {
		async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
			let newContent = await formatRunner.format(document.getText());
			if (newContent.trim() == '') return [];
			
			const start = new vscode.Position(0, 0);
			const end = document.lineAt(document.lineCount - 1).range.end;
			let range = new vscode.Range(start, end);
			
			return [vscode.TextEdit.replace(range, newContent)];
		}
	})
}


// This method is called when your extension is deactivated
export function deactivate() {}
