import * as vscode from 'vscode';
import { ShellCommand, execute, getCommandLine } from "./command";

export function activate(context: vscode.ExtensionContext) {
	let getOutputCommand = vscode.commands.registerCommand(
		'shell-command.getOutput',
		command(
			s => s.endsWith('\n') ? s.slice(0, s.length - 1) : s,
			s => s.length > 0,
			s => Promise.resolve(s)
		));
	let selectOutputCommand =
		vscode.commands.registerCommand(
			'shell-command.selectOutput',
			command(
				s => s.split('\n').filter(s => s !== ''),
				items => items.length > 0,
				async items => vscode.window.showQuickPick(items)
			));

	context.subscriptions.push(getOutputCommand, selectOutputCommand);
}

export function deactivate() { }

function command<R>(
	mapper: (s: string) => R,
	validator: (r: R) => boolean,
	selector: (r: R) => Promise<string | undefined>): (command: ShellCommand) => Promise<string> {
	return async command => {
		let answer;

		try {
			const stdout = mapper((await execute(command)).stdout);
			if (validator(stdout)) {
				answer = await selector(stdout);
			} else {
				vscode.window.showErrorMessage(`Command '${getCommandLine(command)}' did not produce output`);
			}
		} catch (error) {
			if (error instanceof Error) {
				vscode.window.showErrorMessage(error.message);
				console.debug(error.stack);
			} else {
				console.error(error);
			}
		}

		return answer ? answer : '';
	};
}
