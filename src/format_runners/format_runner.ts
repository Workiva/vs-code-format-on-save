import * as vscode from 'vscode';

export interface FormatRunner extends vscode.Disposable {
    format(content: string): Promise<string>
}