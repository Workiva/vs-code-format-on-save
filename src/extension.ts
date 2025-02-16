import * as vscode from 'vscode';
import { ProjectFormatter } from './project_formatter';

let formatter: ProjectFormatter | undefined

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	let root = (vscode.workspace.workspaceFolders ?? [])[0]?.uri?.path;
	if (root == null) return;

	const outputChannel = vscode.window.createOutputChannel('OverReact Format');

	formatter = new ProjectFormatter(root);
	await formatter.init();

	context.subscriptions.push(
		vscode.languages.registerDocumentFormattingEditProvider('dart', {
			async provideDocumentFormattingEdits(document: vscode.TextDocument): Promise<vscode.TextEdit[]> {
				try {
					let path = document.uri.toString().replace('file://', '');

					let oldContent = document.getText();
					let newContent = await formatter!.format(path, oldContent);
					if (oldContent == newContent || newContent.trim() == '') return [];
					
					const start = new vscode.Position(0, 0);
					const end = document.lineAt(document.lineCount - 1).range.end;
					let range = new vscode.Range(start, end);
					
					return [vscode.TextEdit.replace(range, newContent)];
				} catch (e) {
					// this could just be because of a parsing error, dont display the error to the user
					outputChannel.appendLine(`Error running formatter: ${e}`)

					return [];
				}
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {
	formatter?.dispose();
}
