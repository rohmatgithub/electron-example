import fs from 'fs';
import { exec, execSync } from 'child_process';
import { ipcMain } from 'electron';
import axios from 'axios';
import path from 'path';
import { Config, IPC_MESSAGES } from './constanta';
// import fetch from 'node-fetch';

const fetchJsonData = async (url: string) => {
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data;
    // You can now use the data directly
  } catch (error) {
    console.error('Error fetching JSON data:', error);
  }
};

async function downloadFileWithProgress(
  url: string,
  outputPath: string,
  event: Electron.IpcMainEvent,
) {
  try {
    console.log(`URL: ${url}`);
    console.log(`Output Path: ${outputPath}`);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
      onDownloadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        console.log(`Download progress: ${percentCompleted}%`);
        event.reply(IPC_MESSAGES.EXECUTE_FILE, percentCompleted);
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

export const readFile = async (event: Electron.IpcMainEvent) => {
  // fs.readdir('./', (err, files) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   console.log('FILE --> ', files); // Array of file names in the directory
  // });

  // READ FILE CONFIG
  let config: Config = {
    version: '',
  };
  const dataConfig = fs.readFileSync('./config.json', 'utf8');
  config = JSON.parse(dataConfig);
  console.log('CONFIG : ', config.version);

  // GET VERSION.JSON FROM NEXUS
  let jsonVersion: any;
  const url =
    'https://downloads.nexcloud.id/repository/nexpos-releases/testing-electron/version.json';
  await fetchJsonData(url)
    .then((data) => {
      jsonVersion = data;
      console.log(jsonVersion);
      // Now you can access properties on the data object
      console.log(
        `Version now = ${config.version}, Version Latest = ${jsonVersion.linux.version}`,
      );
    })
    .catch((error) => {
      console.error('Error in fetchJsonData:', error);
    });

  console.info('END FETCHING JSON DATA');

  // CHECK VERSION ELECTRON
  if (config.version !== jsonVersion.linux.version) {
    console.log('CREATE DIR TEMP');
    const dirPath = './temp/';

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    console.log('UPDATE VERSION');
    // DOWNLOAD FILE
    // Example usage
    let fileName = path.basename(jsonVersion.linux.url_downloaded);
    const url = jsonVersion.linux.url_downloaded;
    const outputPath = `./temp/${fileName}`;

    event.reply(IPC_MESSAGES.EXECUTE_FILE, 'DOWNLOAD FILE');

    await downloadFileWithProgress(url, outputPath, event)
      .then(() => console.log('File downloaded successfully'))
      .catch((error) => console.error('Error downloading file:', error));

    fs.cpSync(outputPath, './nexpos-latest.AppImage');
    // UPDATE VERSION ON CONFIG
    config.version = jsonVersion.linux.version;

    fs.closeSync;
    try {
      fs.writeFileSync('./config.json', JSON.stringify(config));
      console.log('update config file successfully');
    } catch (err) {
      console.error('Error writing file:', err);
    }
  } else {
    console.log('NO UPDATE VERSION');
    event.reply(IPC_MESSAGES.EXECUTE_FILE, 'NO_UPDATE_VERSION');
  }

  try {
    // Example command: List all files in the current directory
    const commandOutput = execSync('./config.sh', { encoding: 'utf8' });
    console.log('Command Output:', commandOutput);
   } catch (error) {
    // Handle errors
    console.error('Error:', error);
   }
  // const execFile = execSync('./config.sh');
  // console.log(execFile);
};
