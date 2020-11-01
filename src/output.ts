import * as vscode from 'vscode';
import { ShellCommand, execute, ShellCommandError, getCommandLine } from "./command";

export interface ShellCommandOutputCommand extends ShellCommand {
  showQuickPick?: boolean
}

// if command undefined -> triggered from prompt, otherwise triggered from task 
export async function getShellCommandOutputCommand(command: ShellCommandOutputCommand) {
  let answer: string | undefined;

  if (!command) {
    command = {
      command: await vscode.window.showInputBox({
        prompt: "Enter command",
        placeHolder: 'this could be your command',
        ignoreFocusOut: true
      })
    };
  }

  try {
    const stdout = (await execute(command)).stdout;
    if (!stdout.length) {
      throw new ShellCommandError(`Command ${getCommandLine(command)} did not produce any output`);
    }

    answer = await queryAnswer(stdout, command.showQuickPick || false);
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(error.message);
      console.debug(error.stack);
    } else {
      vscode.window.showErrorMessage(`Unknown error during execution of command ${getCommandLine(command)}`);
      console.error(error);
    }
  }

  return answer ? answer : '';
}

async function queryAnswer(stdout: string, showQuickPick: boolean): Promise<string> {
  let answer: string | undefined;

  if (showQuickPick) {
    const items = stdout.split('\n').filter(s => s !== '');
    answer = await vscode.window.showQuickPick(items);
  } else {
    answer = stdout.endsWith('\n') ? stdout.slice(0, stdout.length - 1) : stdout;
  }

  return answer ? answer : '';
}
