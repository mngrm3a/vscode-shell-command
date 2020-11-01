import * as vscode from 'vscode';
import { CommandArgs, runCommand } from './command';

export const EOL: RegExp = /\r\n|\r|\n/;

interface ShellCommandArgs extends CommandArgs {
  quickPick?: boolean
}

export async function shellCommand(commandArgs: ShellCommandArgs): Promise<string | undefined> {
  const output = (await runCommand(commandArgs as CommandArgs)).trimEnd();

  return (commandArgs?.quickPick !== false) ?
    await showQuickPick(output) :
    output;
}

async function showQuickPick(stdout: string): Promise<string | undefined> {
  const items = stdout.split(EOL).map(l => l.trim()).filter(l => l.length > 0);
  if (items.length > 1) {
    return await vscode.window.showQuickPick(
      items,
      {
        canPickMany: false,
        ignoreFocusOut: true
      });
  } else {
    return stdout;
  }
}