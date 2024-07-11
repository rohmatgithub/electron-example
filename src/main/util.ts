/* eslint import/prefer-default-export: off */
import { URL } from 'url';
import path from 'path';
import axios from 'axios';

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export const IPC_MESSAGES = {
  EXAMPLE: 'ipc-example',
  EXECUTE_FILE: 'execute-file',
} as const;

export async function downloadFileWithProgress(
  url: string,
  outputPath: string,
  event?: Electron.IpcMainEvent,
) {
  try {
    console.log(`URL: ${url}`);
    console.log(`Output Path: ${outputPath}`);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const total: number =
          progressEvent.total === undefined || progressEvent.total === 0
            ? 1
            : progressEvent.total;
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / total,
        );
        console.log(`Download progress: ${percentCompleted}%`);
        if (event) {
          event.reply(IPC_MESSAGES.EXECUTE_FILE, percentCompleted);
        }
        // Here you can update your UI to reflect the progress
      },
    });

    // Assuming you're using Node.js and want to save the file
    const fs = require('fs');
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading file:', error);
  }
}
