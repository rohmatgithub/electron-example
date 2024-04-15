import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { IPC_MESSAGES } from '../main/constanta';
import { useEffect, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { relative } from 'path';

function Hello() {
  const [version, setVersion] = useState('TEST');
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(false);
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1>NEXPOS VERSION {version}</h1>
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            window.electron.ipcRenderer.sendMessage(
              IPC_MESSAGES.EXECUTE_FILE,
              'execute file',
            );

            window.electron.ipcRenderer.on(IPC_MESSAGES.EXECUTE_FILE, (arg) => {
              // eslint-disable-next-line no-console
              // console.log(arg);
              if ((arg as string) === 'NO_UPDATE_VERSION') {
                setLoading(false);
                return;
              }
              const p = arg as number;
              console.log('percentage: ' + p);

              setPercentage(p);

              if (p === 100) {
                setLoading(false);
              }
            });
          }}
        >
          UPDATE APLIKASI
        </button>
      </div>
      {loading && (
        <div style={{ minWidth: 100, maxWidth: 100, position: 'absolute' }}>
          <CircularProgressbar value={percentage} text={`${percentage}%`} />
        </div>
      )}
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
