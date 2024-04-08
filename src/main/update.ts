import fs from 'fs';
import { exec } from 'child_process';
import { ipcMain } from 'electron';
import axios from 'axios';

interface Config {
  version: string;
}
const fetchJsonData = async (url: string) => {
  try {
    const response = await axios.get(url);
    const data = response.data;
    console.log('JSON data:', data);
    return data;
    // You can now use the data directly
  } catch (error) {
    console.error('Error fetching JSON data:', error);
  }
};

export const readFile = () => {
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
    console.log('CONFIG : ', config);
  });

  // GET VERSION.JSON FROM NEXUS
  let versionLatest: string = 'test';
  const url =
    'https://downloads.nexcloud.id/repository/nexpos-releases/testing-electron/version.json';
  fetchJsonData(url)
    .then((data) => {
      // Now you can access properties on the data object
      versionLatest = data.version; // Assuming data has a 'version' property
    })
    .catch((error) => {
      console.error('Error in fetchJsonData:', error);
    });

  console.log(
    `Version now = ${config.version}, Version Latest = ${versionLatest}`,
  );

  // CHECK VERSION ELECTRON

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
