// src/preload/index.ts
import {contextBridge, ipcRenderer} from 'electron'
import {electronAPI} from '@electron-toolkit/preload'

const api = {
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  // Phase 2: Accept the user's setting to determine the close behavior
  closeApp: (action: 'hide' | 'quit') => ipcRenderer.send('close-app', action)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
