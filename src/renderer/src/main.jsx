import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import UserContext from './context/UserContext'

import { useState } from 'react'

function Root() {
  const [screenshotQueue, setScreenshotQueue] = useState([])

  return (
    <UserContext
      screenshotQueue={screenshotQueue}
      setScreenshotQueue={setScreenshotQueue}
    >
      <App
        screenshotQueue={screenshotQueue}
        setScreenshotQueue={setScreenshotQueue}
      />
    </UserContext>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
)
