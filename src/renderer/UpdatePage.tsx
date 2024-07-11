import { CircularProgressbar } from 'react-circular-progressbar';
import packageJson from '../../package.json';
import { IPC_MESSAGES } from '../main/constanta';

interface UpdatePageProps {
  loading: boolean;
  percentage: number;
  setLoading: (loading: boolean) => void;
  setPercentage: (percentage: number) => void;
}

export default function UpdatePage({
  loading,
  percentage,
  setLoading,
  setPercentage,
}: UpdatePageProps) {
  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1>NEXPOS VERSION {packageJson.appVersion}</h1>
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
              // eslint-disable-next-line no-console
              console.log(`percentage: ${p}`);

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
    </>
  );
}
