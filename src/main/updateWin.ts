import path from 'path';
import { downloadFileWithProgress } from './util';
import { app, ipcRenderer } from 'electron';
import fs from 'fs';
import { execFile } from 'child_process';

export default async function updateWin(event: Electron.IpcMainEvent) {
  const appPath = app.getPath('exe');
  console.log('appPath : ', appPath);

  const tempPath = app.getPath('temp');
  console.log('tempPath : ', tempPath);

  const url =
    'https://downloads.nexcloud.id/repository/nexpos-releases/testing-electron/windows/ElectronReact%20Setup%204.6.0.exe';
  const decodedUrl = decodeURIComponent(url);
  const fileName = path.basename(decodedUrl);

  const outputPath = path.join(tempPath, fileName);

  // console.log('outputPath : ', outputPath);

  await downloadFileWithProgress(url, outputPath, event)
    .then(() => console.log('File downloaded successfully'))
    .catch((error) => console.error('Error downloading file:', error));

  execFile(outputPath, (error: any) => {
    if (error) {
      console.error('Error installing update:', error);
    } else {
      app.quit();
    }
  });
}
