// src/main/index.ts
import {app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, nativeTheme, shell, Tray} from 'electron'
import {join} from 'path'
import {electronApp, is, optimizer} from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow
let tray: Tray | null = null
let isQuitting = false
let isGhostMode = false

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  function createWindow(): void {
    mainWindow = new BrowserWindow({
      width: 320,
      height: 480,
      resizable: false,
      maximizable: false,
      alwaysOnTop: true,
      show: false,
      frame: false,
      backgroundMaterial: 'mica',
      ...(process.platform === 'linux' ? {icon} : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    mainWindow.on('ready-to-show', () => {
      mainWindow.show()
    })

    mainWindow.on('close', (event) => {
      if (!isQuitting) {
        event.preventDefault()
        mainWindow.hide()
      }
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return {action: 'deny'}
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    ipcMain.on('minimize-app', () => {
      if (mainWindow) mainWindow.minimize()
    })

    ipcMain.on('close-app', (_, action) => {
      if (action === 'quit') {
        isQuitting = true
        app.quit()
      } else {
        if (mainWindow) mainWindow.hide()
      }
    })

    // Listen for the saved theme mode from React and apply it
    ipcMain.on('set-color-mode', (_, mode) => {
      nativeTheme.themeSource = mode
    })

    ipcMain.on('resize-window', (event, width) => {
      const win = BrowserWindow.fromWebContents(event.sender)
      if (win) {
        const bounds = win.getBounds()
        win.setBounds({x: bounds.x, y: bounds.y, width: width, height: bounds.height}, true)
      }
    })

    ipcMain.on('set-ghost-mode', (_, enable) => {
      isGhostMode = enable
      if (mainWindow) {
        mainWindow.setIgnoreMouseEvents(enable)
        mainWindow.setOpacity(enable ? 0.3 : 1.0)
      }
    })

    globalShortcut.register('Alt+C', () => {
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide()
      } else {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.show()
        mainWindow.focus()
      }
    })

    globalShortcut.register('CommandOrControl+Shift+G', () => {
      isGhostMode = !isGhostMode
      if (mainWindow) {
        mainWindow.setIgnoreMouseEvents(isGhostMode)
        mainWindow.setOpacity(isGhostMode ? 0.3 : 1.0)
        mainWindow.webContents.send('ghost-mode-toggled', isGhostMode)
      }
    })

    const iconPath = join(__dirname, '../../resources/icon.png')
    const trayIcon = nativeImage.createFromPath(iconPath).resize({width: 16, height: 16})
    tray = new Tray(trayIcon)

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Calculator',
        click: () => {
          mainWindow.show()
          mainWindow.focus()
        }
      },
      {
        label: 'Toggle Light / Dark Mode',
        click: () => {
          // Instantly flips the OS-level theme for this window
          nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark'
        }
      },
      {type: 'separator'},
      {
        label: 'Quit Calculator',
        click: () => {
          isQuitting = true
          app.quit()
        }
      }
    ])

    tray.setToolTip('Matrix Calculator')
    tray.setContextMenu(contextMenu)

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show()
        mainWindow.focus()
      }
    })

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('before-quit', () => {
    isQuitting = true
  })

  app.on('will-quit', () => {
    globalShortcut.unregisterAll()
  })


  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('quit', () => {
    if (tray) {
      tray.destroy()
    }
  })
}
