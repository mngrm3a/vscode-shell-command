import * as vscode from 'vscode';
import { CommandArgs, runCommand } from './command';

export async function editorCommand() {
  const textEditor = vscode.window.activeTextEditor;

  if (textEditor) {
    const cmdArgs = await showCommandPrompt();
    const selectedText = textEditor.selection.isEmpty ?
      undefined :
      textEditor.document.getText(textEditor.selection);
    const output = await runCommand(cmdArgs, selectedText);

    textEditor.edit(editBuilder => {
      if (selectedText) {
        editBuilder.replace(textEditor.selection, output);
      } else {
        editBuilder.insert(textEditor.selection.active, output.trimEnd());
      }
    });
  }
}

async function showCommandPrompt(token?: vscode.CancellationToken): Promise<CommandArgs> {
  const cmd = await vscode.window.showInputBox(
    {
      prompt: "Enter command",
      ignoreFocusOut: true,
      validateInput: s => s.length === 0 ? 'Command must not be empty' : '',
    },
    token
  );

  return { cmd: cmd ? cmd : '' };
}