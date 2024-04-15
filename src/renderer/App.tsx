import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { IPC_MESSAGES } from '../main/constanta';

function Hello() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1>NEXPOS VERSION 2.0.0</h1>
      <button
        type="button"
        onClick={() => {
          console.log('TEST');
          window.electron.ipcRenderer.sendMessage(
            IPC_MESSAGES.EXECUTE_FILE,
            'execute file',
          );

          window.electron.ipcRenderer.on(IPC_MESSAGES.EXECUTE_FILE, (arg) => {
            // eslint-disable-next-line no-console
            console.log(arg);
          });
        }}
      >
        UPDATE APLIKASI
      </button>
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
