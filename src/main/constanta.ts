export const IPC_MESSAGES = {
  EXAMPLE: 'ipc-example',
  EXECUTE_FILE: 'execute-file',
  GET_VERSION: 'get-version',
} as const;

export interface Config {
  version: string;
}
