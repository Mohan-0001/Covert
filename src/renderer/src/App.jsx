import { useEffect, useState } from 'react'
import TopBar from './components/TopBar'
import ScreenshotQueue from './components/ScreenshotQueue' // Import the new component
import ChatSection from './components/ChatSection'

function App({ screenshotQueue, setScreenshotQueue }) {
  const [isOverlay, setIsOverlay] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  // const [screenshotQueue, setScreenshotQueue] = useState([]) // State to hold the array of screenshots

  useEffect(() => {
    // Overlay toggle listener from Electron
    window.electron.on('overlay-mode', (event, isOverlayOn) => {
      setIsOverlay(!isOverlayOn)
    })

    // New listener for the screenshot queue
    window.electron.onScreenshotQueueUpdate((queue) => {
      setScreenshotQueue(queue)
    })

    return () => {
      window.electron.removeAllListeners('overlay-mode')
      window.electron.removeAllListeners('screenshot-queue-update')
    }
  }, [])

  const handleRemoveScreenshot = (index) => {
    window.electron.removeScreenshot(index) // IPC call to remove from the queue in main process
  }

  return (
     <div className="w-screen h-screen overflow-y-scroll scrollbar-hide overflow-hidden flex flex-col items-center justify-center p-4 bg-transparent font-inter">
      {screenshotQueue.length > 0 && (
        // Display Screenshot Queue and TopBar when screenshots exist
        <div className="w-full overflow-y-scroll scrollbar-hide max-w-2xl h-full flex flex-col rounded-2xl shadow-2xl backdrop-filter backdrop-blur-lg bg-transparent border border-gray-700">
          <ScreenshotQueue screenshots={screenshotQueue} onRemove={handleRemoveScreenshot} />
        </div>
      )}
      <div className="w-screen h-screen max-w-2xl rounded-xl shadow-2xl backdrop-filter backdrop-blur-lg bg-opacity-70">
        {!isOverlay && (
          <TopBar isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} />
        )}
        <div className={!isOverlay ? 'mt-4' : ''}>
          {console.log(isSettingsOpen)}
          {!isSettingsOpen && <ChatSection isOverlay={isOverlay} />}
        </div>
      </div>
    </div>
  )
}

export default App
