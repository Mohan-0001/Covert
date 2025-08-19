import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const windowControls = {
  minimize: () => ipcRenderer.send('minimize-window'),
  maximize: () => ipcRenderer.send('maximize-window'),
  close: () => ipcRenderer.send('close-window')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      windowControls, // 👈 Expose grouped API
      on: (channel, listener) => ipcRenderer.on(channel, listener),
      removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
      send: (channel, data) => ipcRenderer.send(channel, data),
      onInputFocus: (callback) => ipcRenderer.on("input-focus", callback),


      // New API for managing the screenshot queue
      onScreenshotQueueUpdate: (callback) =>
        ipcRenderer.on('screenshot-queue-update', (event, queue) => callback(queue)),
      removeScreenshot: (index) => ipcRenderer.send('remove-screenshot-from-queue', index),
      clearScreenshotQueue: () => ipcRenderer.send('clear-screenshot-queue'), // 👈 new

      apiStorage: {
        saveKey: (key) => ipcRenderer.send('save-api-key', key),
        loadKey: () => ipcRenderer.invoke('load-api-key'),
        saveProvider: (provider) => ipcRenderer.send('save-api-provider', provider),
        loadProvider: () => ipcRenderer.invoke('load-api-provider')
      }
    })
  } catch (error) {
    console.error('Preload expose error:', error)
  }
} else {
  window.electron = {
    ...electronAPI,
    windowControls,
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
    send: (channel, data) => ipcRenderer.send(channel, data),

    // New API for managing the screenshot queue
    onScreenshotQueueUpdate: (callback) =>
      ipcRenderer.on('screenshot-queue-update', (event, queue) => callback(queue)),
    removeScreenshot: (index) => ipcRenderer.send('remove-screenshot-from-queue', index),
    apiStorage: {
      saveKey: (key) => ipcRenderer.send('save-api-key', key),
      loadKey: () => ipcRenderer.invoke('load-api-key'),
      saveProvider: (provider) => ipcRenderer.send('save-api-provider', provider),
      loadProvider: () => ipcRenderer.invoke('load-api-provider')
    }
  }
}
