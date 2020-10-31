import { exec, ExecException, ExecOptions, ExecOptionsWithStringEncoding } from "child_process";

export interface ShellCommand {
  command?: string
  encoding?: BufferEncoding
  cwd?: string
  env?: NodeJS.ProcessEnv
}

export interface ShellCommandResult {
  stdout: string;
  stderr: string;
}


export async function execute(command: ShellCommand): Promise<ShellCommandResult> {
  return new Promise((resolve, reject) => {
    const callback = (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        reject(error);
      }
      resolve({
        stdout: stdout,
        stderr: stderr
      });
    };

    const commandString = getCommandLine(command);
    const execOptions = getExecOptions(command);

    if (execOptions) {
      exec(commandString, execOptions, callback);
    } else {
      exec(commandString, callback);
    }
  });
}

export class ShellCommandError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = ShellCommandError.name;
  }
}

export function getCommandLine(command: ShellCommand): string {
  const commandLine = command.command;

  if (commandLine) {
    return commandLine;
  }

  throw new ShellCommandError('Command is empty');
}

function getExecOptions(command: ShellCommand): ExecOptions | ExecOptionsWithStringEncoding {
  return command.encoding ?
    command as ExecOptionsWithStringEncoding :
    command as ExecOptions;
}
