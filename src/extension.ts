import * as vscode from 'vscode';
import {join} from 'path';
import { existsSync, readFileSync, watchFile } from 'fs';
import { OverReactFormatRunner } from './format_runners/over_react_format_runner';
import { FormatRunner } from './format_runners/format_runner';
import { DartFormatRunner } from './format_runners/dart_format_runner';

let formatRunner: FormatRunner | undefined

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let root = (vscode.workspace.workspaceFolders ?? [])[0]?.uri?.path;
	if (root == null) return;

	const outputChannel = vscode.window.createOutputChannel('OverReact Format');

	function updateFormatter() {
		// updateFormatter is ran anytime the pubspec.yaml is changed. 
		// if we've already ran it, and the format runner isn't null, kill
		// the existing subscription to prevent memory leaks
		formatRunner?.dispose()

		let pubspecPath = join(root, 'pubspec.yaml');
		if (existsSync(pubspecPath) && readFileSync(pubspecPath).toString().includes('  over_react_format:')) {
			formatRunner = new OverReactFormatRunner(root)
		} else {
			formatRunner = new DartFormatRunner();
		}
	}

	updateFormatter();
	watchFile(join(root, 'pubspec.lock'), updateFormatter);

	context.subscriptions.push(
		vscode.languages.registerDocumentFormattingEditProvider('dart', {
			async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
				try {
					let newContent = await formatRunner!.format(document.getText());
					if (newContent.trim() == '') return [];
					
					const start = new vscode.Position(0, 0);
					const end = document.lineAt(document.lineCount - 1).range.end;
					let range = new vscode.Range(start, end);
					
					return [vscode.TextEdit.replace(range, newContent)];
				} catch (e) {
					outputChannel.appendLine(`Error running formatter: ${e}`)

					return [];
				}
			}
		})
	);
}


// This method is called when your extension is deactivated
export function deactivate() {
	formatRunner?.dispose();
}
