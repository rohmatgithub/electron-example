import fs from 'fs';
import { exec, execSync } from 'child_process';
import { ipcMain } from 'electron';
import axios from 'axios';
import path from 'path';
import { Config, IPC_MESSAGES } from './constanta';
import { downloadFileWithProgress } from './util';
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

export const readFile = async (event: Electron.IpcMainEvent) => {
  // fs.readdir('./', (err, files) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   console.log('FILE --> ', files); // Array of file names in the directory
  // });

  console.info('STEP 1: READ FILE CONFIG');
  let config: Config = {
    version: '',
  };
  const dataConfig = fs.readFileSync('./config.json', 'utf8');
  config = JSON.parse(dataConfig);
  console.log('config : ', config);

  console.info('STEP 2: GET VERSION.JSON FROM NEXUS');

  let jsonVersion: any;
  const url =
    'https://downloads.nexcloud.id/repository/nexpos-releases/testing-electron/version.json';
  await fetchJsonData(url)
    .then((data) => {
      jsonVersion = data;
      console.log(jsonVersion);
      // Now you can access properties on the data object
      console.log(
        `Version local = ${config.version}, Version Latest = ${jsonVersion.linux.version}`,
      );
    })
    .catch((error) => {
      console.error('Error in fetchJsonData:', error);
    });

  console.info('STEP 3: BANDINGKAN VERSION LOCAL & VERSION NEXUS');
  if (config.version !== jsonVersion.linux.version) {
    console.info('STEP 4 = CREATE DIR TEMP');
    const dirPath = './temp/';

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    console.info('STEP 5 = DOWNLOAD FILE FROM NEXUS');
    // DOWNLOAD FILE
    let fileName = path.basename(jsonVersion.linux.url_downloaded);
    const url = jsonVersion.linux.url_downloaded;
    const outputPath = `./temp/${fileName}`;

    await downloadFileWithProgress(url, outputPath, event)
      .then(() => console.log('File downloaded successfully'))
      .catch((error) => console.error('Error downloading file:', error));

    console.info('STEP 6 = MOVE FILE FROM TEMP');
    fs.cpSync(outputPath, './nexpos-latest.AppImage');
    // UPDATE VERSION ON CONFIG
    config.version = jsonVersion.linux.version;

    fs.closeSync;

    console.info('STEP 7 = SAVE NEW VERSION ON FILE CONFIG');
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

  console.info('STEP 8: EXECUTE FILE .SH');
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
