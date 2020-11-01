import * as vscode from 'vscode';
import { spawn, SpawnOptions, CommonOptions } from "child_process";

export enum CaptureStream {
  StdOut = 'stdout',
  StdErr = 'stderr'
}

export interface CommandArgs extends CommonOptions {
  cmd: string,
  args?: string[]
  capture?: CaptureStream
}

export async function runCommand(commandArgs: CommandArgs, stdin?: string): Promise<string> {
  const args = commandArgs.args ? commandArgs.args : [];
  const captureStream = commandArgs.capture ? commandArgs.capture : CaptureStream.StdOut;
  const spawnOptions = {
    ...(commandArgs as SpawnOptions),
    cwd: commandArgs.cwd ?
      commandArgs.cwd :
      vscode.workspace.workspaceFolders ?
        vscode.workspace.workspaceFolders[0].uri.fsPath :
        undefined,
    timeout: commandArgs.timeout ? commandArgs.timeout : 10 * 1000,
    shell: true
  };

  if (!commandArgs.cmd) {
    throw new Error('Command must not be empty');
  }

  return spawnCommand(commandArgs.cmd, args, captureStream, spawnOptions, stdin);
}

async function spawnCommand(
  command: string,
  args: string[],
  captureStream: CaptureStream,
  spawnOptions: SpawnOptions,
  stdin?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, spawnOptions);
    const outputStream = captureStream === CaptureStream.StdOut ?
      process.stdout :
      process.stderr;
    let output = '';

    process.on("error", (error) => reject(error));

    process.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Command '${command}' terminated with exit code ${code}`));
      }
    });

    outputStream?.on('data', (data) => output += data);

    if (stdin) {
      process.stdin?.write(stdin);
      process.stdin?.end();
    }
  });
}