// Copyright 2020 Workiva Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as vscode from 'vscode';
import * as process from 'child_process'
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

import { devDependenciesContains, dependencyHasValidMinVersion } from './extension_utils';

export function activate(context: vscode.ExtensionContext) {
	const extension = new RunFormatOnSave(context);

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(() => {
			extension.loadConfig();
		}),

		vscode.commands.registerCommand('overReactFormatOnSave.enableOverReactFormatOnSave', () => {
			extension.setEnabled(true);
		}),

		vscode.commands.registerCommand('overReactFormatOnSave.disableOverReactFormatOnSave', () => {
			extension.setEnabled(false);
		}),

		vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
				extension.onDocumentSave(document);
		})
	);

	return extension;
}

class RunFormatOnSave {
	private context: vscode.ExtensionContext;
	private config!: vscode.WorkspaceConfiguration;
	private channel: vscode.OutputChannel = vscode.window.createOutputChannel('OverReact Format On Save');
	private minOverReactFormatVersion = '>=3.1.0';
	private overReactFormatKey = 'over_react_format';
	private projectDir = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.path : "";
	private useOverReactFormat:Boolean = false; 

	// The last project directory detected. 
	// 
	// This will either be equal to `projectDir` or a directory nested in `projectDir` that contains a `pubspec.yaml` file.
	private currentProjectDir:string | null = null;

	constructor(context: vscode.ExtensionContext) {
		this.context = context;
		this.loadConfig();
		this.showEnablingChannelMessage();
	}

	startProcess(fileName: string) : process.ChildProcess {
		// Config variables
		const customLineLength = this.config.get<Number>('customLineLength', 0);
		const shouldDetectLineLength = this.config.get<Boolean>('detectCustomLineLength');
		const shouldScanForNestedPackages = this.config.get<Boolean>('scanForNestedProjects');

		const shouldUseCustomLineLength = customLineLength > 0;
		let executable : "pub" | "dartfmt";
		const args : Array<string> = [];

		const projectPath = shouldScanForNestedPackages ? this.getProjectPath(this.projectDir, fileName) : this.projectDir;

		if (projectPath !== this.currentProjectDir) {
			this.showChannelMessage('Detected a new current project... Re-processing the pubspec.yaml.');
			this.currentProjectDir = projectPath;

			// Even though `projectPath` most likely found a pubspec in at least the `projectDir`, there is still a possibility
			// it doesn't exist because `getProjectPath` returns `projectDir` even if nothing is found.
			if (existsSync(path.join(this.currentProjectDir, 'pubspec.yaml'))) {
				const pubspecContainsOverReactFormat = devDependenciesContains(this.overReactFormatKey, readFileSync(`${this.currentProjectDir}/pubspec.yaml`, 'utf-8'));
				const overReactFormatRangeIsValid = dependencyHasValidMinVersion(this.overReactFormatKey, this.minOverReactFormatVersion, readFileSync(`${this.currentProjectDir}/pubspec.yaml`, 'utf-8'), true);
	
				if (pubspecContainsOverReactFormat && !overReactFormatRangeIsValid) {
					this.showChannelMessage('over_react_format range is not compatible with OverReact Format on Save.'
					+ ' Bump the minimum to 3.1.0 to use OverReact Format on Save. Defaulting to using dartfmt instead.');
				}
				this.useOverReactFormat =  pubspecContainsOverReactFormat && overReactFormatRangeIsValid;
			// If this is hit, the detected package file has change but contains no pubspec and therefore should always use `dartfmt`.
			} else if (this.useOverReactFormat) {
				this.useOverReactFormat = false;
			}
			// No else condition because there's no penalty for the project not being a Dart project.
			// The `onDocumentSave` command will just be short-circuited if it is run on non-Dart files.
		}

		this.showChannelMessage(`Running ${this.useOverReactFormat ? 'OverReact Format' : 'dartfmt'}...`);

		if (shouldUseCustomLineLength && shouldDetectLineLength) {
			this.showChannelMessage(`Both a custom line-length value and detectCustomLineLength set to true. Skipping line-length detection.`);
		}

		if (this.useOverReactFormat) {
			executable = 'pub'
			args.push('run', 'over_react_format', fileName);
			if (shouldUseCustomLineLength) {
				args.push('-l', `${customLineLength}`);
			} else {
				args.push('-p', this.currentProjectDir);

				if (shouldDetectLineLength) {
					args.push('--detect-line-length');
				}
			} 
		} else {
			// TODO add logic to detect line-length from dart_dev's config.dart
			executable = 'dartfmt';
			args.push('-w', fileName);
			if (shouldUseCustomLineLength) {
				args.push('-l', `${customLineLength}`);
			}
		}

		const command = `${executable} ${args.join(' ')}`;
		this.showChannelMessage(command);
		return process.execFile(executable, args, {cwd: this.currentProjectDir});
	}

	getProjectPath(contentRoot : string, fileName : string) : string {
		let currentPath : string = fileName;

		while (currentPath !== contentRoot) {
			const parentOfCurrentDirectory = path.dirname(currentPath);
			
			if (existsSync(path.join(parentOfCurrentDirectory, 'pubspec.yaml'))) {
				return parentOfCurrentDirectory;
			}

			currentPath = parentOfCurrentDirectory;
		}

		return contentRoot;
	}

	loadConfig() {
		this.config = vscode.workspace.getConfiguration('overReact.formatOnSave');
	}
	
	private showEnablingChannelMessage () {
		const message = `Run OverReact Format on Save is ${this.getEnabled() ? 'enabled' : 'disabled'}`;
		this.showChannelMessage(message);
		this.showStatusMessage(message);
	}

	private showChannelMessage(message: string) {
		this.channel.appendLine(message);
	}

	getEnabled(): boolean {
		return !!this.context.globalState.get('enabled', true);
	}
		
	setEnabled(enabled: boolean) {
		this.context.globalState.update('enabled', enabled);
		this.showEnablingChannelMessage();
	}

	private showStatusMessage(message: string) {
		const disposable = vscode.window.setStatusBarMessage(message, 3000);
		this.context.subscriptions.push(disposable);
	}

	onDocumentSave(document: vscode.TextDocument) {
		if (!this.getEnabled() || document.languageId !== 'dart') {
			return;
		}

		const child:process.ChildProcess = this.startProcess(document.fileName);

		child.stdout!.on('data', data => this.channel.append(data.toString()));
		child.stderr!.on('data', data => this.channel.append(data.toString()));

		child.on('exit', (e) => {
			if (e === 0) {
				this.showStatusMessage('Formatting succeeded');
			}

			if (e !== 0) {
				this.channel.show(true);
			}
		});
	}
}
