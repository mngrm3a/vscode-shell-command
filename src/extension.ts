import * as vscode from 'vscode';
import { exec, ExecException, ExecOptions, ExecOptionsWithStringEncoding } from "child_process";

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

interface CommandOptions {
	command: string
	encoding?: BufferEncoding;
	cwd?: string;
	env?: NodeJS.ProcessEnv;
}

function command<R>(
	mapper: (s: string) => R,
	validator: (r: R) => boolean,
	selector: (r: R) => Promise<string | undefined>): (commandOptions: CommandOptions) => Promise<string> {
	return async commandOptions => {
		let answer;

		try {
			const result = await execCommand(commandOptions, mapper);
			if (validator(result.stdout)) {
				answer = await selector(result.stdout);
			} else {
				vscode.window.showErrorMessage(`Command '${commandOptions.command}' did not produce output`);
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

async function execCommand<R>(commandOptions: CommandOptions, mapper: (s: string) => R): Promise<{ stdout: R, stderr: R }> {
	return new Promise((resolve, reject) => {
		const callback = (error: ExecException | null, stdout: string, stderr: string) => {
			if (error) {
				reject(error);
			}
			resolve({
				stdout: mapper(stdout),
				stderr: mapper(stderr)
			});
		};

		const command = commandOptions.command;
		const execOptions = commandOptions.encoding ?
			commandOptions as ExecOptionsWithStringEncoding :
			commandOptions as ExecOptions;

		if (execOptions) {
			exec(command, execOptions, callback);
		} else {
			exec(command, callback);
		}
	});
}
