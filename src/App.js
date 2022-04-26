import { useState } from 'react'
import WebcamVideo from './components/WebcamVideo'

function App() {

  const [videoActive, setVideoActive] = useState(false)

  return (
    <div>
      <div className="app-container vertical-layout flex-space">
        <h2>Face detection</h2>

        <div className='vertical-layout grow'>
          {/* Video */}
          {videoActive ? <WebcamVideo /> : null}

          {/* Actions */}
          <button onClick={() => setVideoActive(c => !c)}>
            {`${videoActive ? 'Stop' : 'Start'} webcam`}
          </button>
        </div>

        {/* Footer */}
        <div className='vertical-layout text-small'>
          EECS 442 | Winter 2022
        </div>
      </div>
      <div className='app-overlay'>

      </div>
    </div>
  );
}

export default App;
