import * as vscode from 'vscode';
import { getShellCommandOutputCommand } from "./output";

export function activate(context: vscode.ExtensionContext) {
	let getOutputCommand = vscode.commands.registerCommand(
		'shell-command.getOutput',
		getShellCommandOutputCommand
	);

	context.subscriptions.push(getOutputCommand);
}

export function deactivate() { }
