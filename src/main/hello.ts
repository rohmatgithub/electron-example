import fs from 'fs';
import { exec } from 'child_process';
import { ipcMain } from 'electron';

export const readFile = () => {
  fs.readdir('/home/nexsoft/NEXPOS/start-electron/file-test', (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('FILE --> ', files); // Array of file names in the directory
  });

  exec(
    '/home/nexsoft/NEXPOS/start-electron/file-test/test-linux.sh',
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing file: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Error output: ${stderr}`);
        return;
      }
      console.log(`File output: ${stdout}`);
    },
  );
};
