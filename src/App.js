import { useCallback, useState } from 'react';
import WebcamVideo from './components/WebcamVideo';

function App() {

  const [videoActive, setVideoActive] = useState(false)

  return (
    <div className="app-container vertical-layout">
      <h2>Face detection</h2>

      {/* Video */}
      {videoActive ? <WebcamVideo /> : null}

      {/* Actions */}
      <button onClick={() => setVideoActive(c => !c)}>
        {`${videoActive ? 'Stop' : 'Start'} webcam`}
      </button>
    </div>
  );
}

export default App;
