// src/preload/index.ts
import {contextBridge, ipcRenderer} from 'electron'
import {electronAPI} from '@electron-toolkit/preload'

const api = {
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  closeApp: (action: 'hide' | 'quit') => ipcRenderer.send('close-app', action),
  setGhostMode: (enable: boolean) => ipcRenderer.send('set-ghost-mode', enable),
  onGhostModeToggled: (callback: (enabled: boolean) => void) => {
    ipcRenderer.removeAllListeners('ghost-mode-toggled')
    ipcRenderer.on('ghost-mode-toggled', (_, enable) => callback(enable))
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
