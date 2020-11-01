import * as vscode from 'vscode';
import { editorCommand } from './editor_command';
import { shellCommand } from "./shell_command";

export function activate(context: vscode.ExtensionContext) {
	const channel = vscode.window.createOutputChannel('Shell Command');

	context.subscriptions.push(
		vscode.commands.registerCommand(
			'shell-command.run',
			run(
				shellCommand,
				channel, {
				label: 'Configure Task',
				handler: () => { vscode.commands.executeCommand('workbench.action.tasks.configureTaskRunner'); }
			})),
		vscode.commands.registerTextEditorCommand(
			'shell-command.edit',
			run(editorCommand, channel)
		)
	);
}

export function deactivate() { }

interface Action {
	label: string
	handler: () => void
}

function run<T>(
	fn: (...args: any[]) => Promise<T>,
	channel: vscode.OutputChannel,
	action?: Action):
	(...args: any[]) => Promise<T | undefined> {
	return async (...args: any[]) => {
		try {
			return await fn(...args);
		} catch (error) {
			showError(error, channel, action);
		}
	};
}

async function showError(error: any, channel: vscode.OutputChannel, action?: Action) {
	const displayMessage = error instanceof Error ?
		error.message :
		error;
	const logMessage = error instanceof Error && error.stack ?
		error.stack :
		displayMessage;

	channel.appendLine(logMessage);

	if (action) {
		const answer = await vscode.window.showErrorMessage(displayMessage, action.label);
		if (answer === action.label) {
			action.handler();
		}
	} else {
		vscode.window.showErrorMessage(displayMessage);
	}
}
