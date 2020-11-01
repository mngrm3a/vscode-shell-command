# VSCode Shell Command

The *VSCode Shell Command* extension aims to add  some useful shell integrations.

## Task Input

![Task Input](assets/task-input.gif)

### Configuration

| Argument    | Description                                                                                                                                                                                                     |
|-------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cmd`       | Command to be executed by a shell.                                                                                                                                                                              |
| `args`      | Additional command line arguments.                                                                                                                                                                              |
| `capture`   | Output stream to be captured. Can be set to `stdout` or `stderr`. If not set, `stdout` is captured.                                                                                                             |
| `quickPick` | Whether a QuickPick should be displayed to select a specific line of the command output . Can be set to `true` or `false`. If not set, a QuickPick will be displayed if the command outputs more than one line. |
| `cwd`       | Current working directory. If not set, the project root directory is used.                                                                                                                                      |
| `env`       | Dictionary of environment variables.                                                                                                                                                                            |
| `timeout`   | Timeout in milliseconds. Default is 10s.                                                                                                                                                                        |


Additionally, all options defined in [`CommonOptions`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/8ed72417dd350bde3f0af55ac85375d78382f526/types/node/v12/child_process.d.ts#L130) can be set.

### Example

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Shell Command: Task Input Example",
      "type": "shell",
      "isBackground": false,
      "command": "echo '${input:example}'"
    }
  ],
  "inputs": [
    {
      "type": "command",
      "id": "example",
      "command": "shell-command.run",
      "args": {
        "cmd": "ls",
        "args": [
          "-1",
        ],
        "env": {
          "SOME_ENV_VAR": "SOME_ENV_VAR_VALUE",
          "ANOTHER_ENV_VAR": "ANOTHER_ENV_VAR_VALUE"
        },
        "cwd": "/",
        "capture": "stdout",
        "quickPick": "true"
      },
    }
  ]
}
```

## Inserting the command output into the current document

![Task Input](assets/task-insert.gif)

## Piping the current selection through a command

![Task Input](assets/task-edit.gif)
