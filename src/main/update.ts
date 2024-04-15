import fs from 'fs';
import { exec } from 'child_process';
import { ipcMain } from 'electron';
import axios from 'axios';
import path from 'path';
import { IPC_MESSAGES } from './constanta';
// import fetch from 'node-fetch';

interface Config {
  version: string;
}
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
        event.reply(
          IPC_MESSAGES.EXECUTE_FILE,
          `Download progress: ${percentCompleted}%`,
        );
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
  fs.readFile('./config.json', 'utf8', (error, data) => {
    if (error) {
      console.error(error);
      return;
    }
    config = JSON.parse(data);
    console.log('CONFIG : ', config.version);
  });

  // GET VERSION.JSON FROM NEXUS
  let versionLatest: string = 'test';
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

    // downloadFileWithProgress(url, outputPath, event)
    //   .then(() => console.log('File downloaded successfully'))
    //   .catch((error) => console.error('Error downloading file:', error));

    // UPDATE VERSION ON CONFIG
    config.version = jsonVersion.linux.version;

    try {
      fs.writeFileSync('./config.json', JSON.stringify(config));
      console.log('update config file successfully');
    } catch (err) {
      console.error('Error writing file:', err);
    }
  } else {
    console.log('NO UPDATE VERSION');
  }

  // exec('./config.sh', (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error executing file: ${error.message}`);
  //     return;
  //   }
  //   if (stderr) {
  //     console.error(`Error output: ${stderr}`);
  //     return;
  //   }
  //   console.log(`File output: ${stdout}`);
  // });
};
