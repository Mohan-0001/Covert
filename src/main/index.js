import { app, shell, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import screenshot from 'screenshot-desktop'
let Store
import('electron-store').then((module) => {
  const Store = module.default
  const store = new Store()

  ipcMain.on('save-api-key', (event, key) => {
    store.set('apiKey', key)
  })

  ipcMain.handle('load-api-key', () => {
    return store.get('apiKey', '')
  })

  ipcMain.on('save-api-provider', (event, provider) => {
    store.set('apiProvider', provider)
  })

  ipcMain.handle('load-api-provider', () => {
    return store.get('apiProvider', 'openai') // default fallback
  })
})

// Global variables for the window and overlay state.
// Declaring them here makes them accessible to all functions.
let mainWindow
let isOverlayOn = false

// Set the global hotkey to a less common combination to avoid conflicts.
const toggleOverLayHotkey = 'CommandOrControl+Shift+Space'
let screenshotQueue = []

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 725,
    height: 495,
    show: false,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    skipTaskbar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      // --- START OF REQUIRED CSP FIX ---
      // This line tells Electron that it's safe to connect to Google's API.
      contentSecurityPolicy: "connect-src 'self' https://generativelanguage.googleapis.com"

      // --- END OF REQUIRED CSP FIX ---
    }
  })

  // Set the window to be always on top of other windows.
  mainWindow.setAlwaysOnTop(true, 'screen')

  // Screen capture protection for different platforms.
  // This prevents the window from being captured in screenshots or screen shares.
  if (process.platform === 'darwin') {
    mainWindow.setHiddenInMissionControl(true)
    console.log('Screen capture protection enabled for macOS')
  } else if (process.platform === 'win32') {
    mainWindow.setContentProtection(true)
    console.log('Screen capture protection enabled for Windows')
  } else {
    console.log('Screen capture protection not supported on this platform.')
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  app.setPath('userData', join(app.getPath('documents'), 'MyElectronCache'))

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // A more robust way to hide the app from the macOS dock is to use app.dock.hide().
  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  // Create the main window.
  createWindow()

  globalShortcut.register('CommandOrControl+Up', () => moveWindow(0, -30))
  globalShortcut.register('CommandOrControl+Down', () => moveWindow(0, 30))
  globalShortcut.register('CommandOrControl+Left', () => moveWindow(-30, 0))
  globalShortcut.register('CommandOrControl+Right', () => moveWindow(30, 0))

  // --- START of corrected code for global shortcut ---
  // The global shortcut should be registered here, after the app is ready and the window is created.
  const success = globalShortcut.register(toggleOverLayHotkey, () => {
    // We toggle the state of the overlay.
    isOverlayOn = !isOverlayOn
    // We ignore mouse events when the overlay is active.
    mainWindow.setIgnoreMouseEvents(!isOverlayOn)

    // We send a message to the renderer process to update the UI.
    mainWindow.webContents.send('overlay-mode', isOverlayOn)
    console.log('Overlay toggled:', isOverlayOn)
  })

  if (!success) {
    console.log('❌ Failed to register global shortcut:', toggleOverLayHotkey)
  }

  function moveWindow(xDelta, yDelta) {
    if (!mainWindow) return

    const { x, y, width, height } = mainWindow.getBounds()

    mainWindow.setBounds({
      x: x + xDelta,
      y: y + yDelta,
      width,
      height
    })
  }

  // It's good practice to unregister all shortcuts when the app is about to quit.
  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })
  // --- END of corrected code ---

  // IPC handler to remove a screenshot from the queue
  ipcMain.on('remove-screenshot-from-queue', (event, index) => {
    if (index >= 0 && index < screenshotQueue.length) {
      screenshotQueue.splice(index, 1)
      // After removal, send the updated queue to the renderer
      if (mainWindow) {
        mainWindow.webContents.send('screenshot-queue-update', screenshotQueue)
      }
    }
  })

  ipcMain.on('clear-screenshot-queue', () => {
    screenshotQueue = []
    mainWindow.webContents.send('screenshot-queue-update', screenshotQueue)
  })

  globalShortcut.register('CommandOrControl+Shift+1', () => {
    const win = BrowserWindow.getFocusedWindow() || mainWindow
    if (win) win.close()
  })

  globalShortcut.register('CommandOrControl+Shift+M', () => {
    const win = BrowserWindow.getFocusedWindow() || mainWindow

    if (!win) return

    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      // win.focus() // Optional: brings window to front
    }
  })

  globalShortcut.register('CommandOrControl+Shift+Space', () => {
    isOverlayOn = !isOverlayOn
    mainWindow.setIgnoreMouseEvents(!isOverlayOn)
    mainWindow.webContents.send('overlay-mode', isOverlayOn)
    console.log('Overlay toggled (global):', isOverlayOn)
  })

  // Register the global shortcut
  // globalShortcut.register('CommandOrControl+Shift+S', async () => {
  //   const win = BrowserWindow.getFocusedWindow() || mainWindow

  //   if (!win) return

  //   try {
  //     // Hide the Electron window to exclude it from the screenshot
  //     win.hide()

  //     // Wait briefly to allow window to disappear
  //     await new Promise((res) => setTimeout(res, 400)) // adjust if needed

  //     // Take screenshot
  //     const img = await screenshot({ format: 'png' })

  //     // You can save it or send to renderer
  //     const fs = require('fs')
  //     const path = require('path')
  //     const screenshotPath = path.join(app.getPath('pictures'), `screenshot-${Date.now()}.png`)
  //     fs.writeFileSync(screenshotPath, img)

  //     console.log('Screenshot saved at', screenshotPath)

  //     // Show window again
  //     win.show()
  //     win.focus()
  //   } catch (err) {
  //     console.error('Screenshot failed:', err)
  //     win.show() // Ensure it doesn't stay hidden on error
  //   }
  // })

  globalShortcut.register('CommandOrControl+Shift+S', async () => {
    if (!mainWindow) return

    try {
      // Hide window to avoid capturing it
      mainWindow.hide()
      await new Promise((res) => setTimeout(res, 400))

      const img = await screenshot({ format: 'png' })
      const base64Image = `data:image/png;base64,${img.toString('base64')}`

      // Add to queue
      screenshotQueue.unshift(base64Image)
      console.log(`Screenshot captured. Queue size: ${screenshotQueue.length}`)

      // Show window again
      mainWindow.show()
      mainWindow.focus()

      // Always send queue AFTER the UI is visible
      setTimeout(() => {
        mainWindow.webContents.send('screenshot-queue-update', screenshotQueue)
      }, 100) // small delay ensures renderer is ready
    } catch (err) {
      console.error('Screenshot failed:', err)
      mainWindow.show()
    }
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
