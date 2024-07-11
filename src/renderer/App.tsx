import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { IPC_MESSAGES } from '../main/constanta';
// import UpdatePage from './UpdatePage';
// import ViewCrypto from './Crypto';

function Hello() {
  const [version, setVersion] = useState('TEST');
  // const [percentage, setPercentage] = useState(0);
  // const [loading, setLoading] = useState(false);
  const [inputString, setInputString] = useState('');
  const [outputString, setOutputString] = useState();

  useEffect(() => {
    window.electron.ipcRenderer.once(IPC_MESSAGES.GET_VERSION, (arg: any) => {
      // eslint-disable-next-line no-console
      setVersion(arg);
    });

    window.electron.ipcRenderer.sendMessage(
      IPC_MESSAGES.GET_VERSION,
      'GET VERSION FROM CONFIG',
    );
  }, [version]);

  const decrypt = () => {
    window.electron.ipcRenderer.sendMessage('decrypt', inputString);

    window.electron.ipcRenderer.once('decrypt', (arg: any) => {
      setOutputString(arg);
    });
  };

  const encrypt = () => {
    window.electron.ipcRenderer.sendMessage('encrypt', inputString);

    window.electron.ipcRenderer.once('encrypt', (arg: any) => {
      setOutputString(arg);
    });
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={inputString}
          onChange={(e) => {
            setInputString(e.target.value);
          }}
          placeholder="Enter text here"
        />
      </div>

      <br />
      <div>
        <button type="button" onClick={encrypt}>
          Encrypt
        </button>
      </div>

      <br />
      <div>
        <button type="button" onClick={decrypt}>
          Decrypt
        </button>
      </div>

      <br />
      <div>
        <textarea
          value={outputString}
          readOnly
          placeholder="Output will appear here"
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
