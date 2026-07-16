import { app, shell, BrowserWindow, ipcMain, Menu, dialog, clipboard } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { readFileSync, writeFileSync } from 'fs'

let mainWindow: BrowserWindow

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  buildMenu()
}

function buildMenu(): void {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Fichier',
      submenu: [
        {
          label: 'Nouveau',
          accelerator: 'CmdOrCtrl+N',
          click: (): void => {
            mainWindow.webContents.send('menu:new')
          }
        },
        {
          label: 'Ouvrir',
          accelerator: 'CmdOrCtrl+O',
          click: async (): Promise<void> => {
            const result = await dialog.showOpenDialog(mainWindow, {
              filters: [{ name: 'Design Studio', extensions: ['dsc'] }],
              properties: ['openFile']
            })
            if (!result.canceled && result.filePaths[0]) {
              const content = readFileSync(result.filePaths[0], 'utf-8')
              mainWindow.webContents.send('menu:open', content)
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Enregistrer',
          accelerator: 'CmdOrCtrl+S',
          click: (): void => {
            mainWindow.webContents.send('menu:save')
          }
        },
        {
          label: 'Enregistrer sous...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: (): void => {
            mainWindow.webContents.send('menu:save-as')
          }
        },
        { type: 'separator' },
        {
          label: 'Exporter en PNG',
          accelerator: 'CmdOrCtrl+E',
          click: (): void => {
            mainWindow.webContents.send('menu:export-png')
          }
        },
        {
          label: 'Exporter en JPG',
          click: (): void => {
            mainWindow.webContents.send('menu:export-jpg')
          }
        },
        {
          label: 'Exporter en PDF',
          click: (): void => {
            mainWindow.webContents.send('menu:export-pdf')
          }
        },
        { type: 'separator' },
        {
          label: 'Quitter',
          accelerator: 'CmdOrCtrl+Q',
          click: (): void => {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Édition',
      submenu: [
        {
          label: 'Annuler',
          accelerator: 'CmdOrCtrl+Z',
          click: (): void => {
            mainWindow.webContents.send('menu:undo')
          }
        },
        {
          label: 'Rétablir',
          accelerator: 'CmdOrCtrl+Y',
          click: (): void => {
            mainWindow.webContents.send('menu:redo')
          }
        },
        { type: 'separator' },
        {
          label: 'Couper',
          accelerator: 'CmdOrCtrl+X',
          click: (): void => {
            mainWindow.webContents.send('menu:cut')
          }
        },
        {
          label: 'Copier',
          accelerator: 'CmdOrCtrl+C',
          click: (): void => {
            mainWindow.webContents.send('menu:copy')
          }
        },
        {
          label: 'Coller',
          accelerator: 'CmdOrCtrl+V',
          click: (): void => {
            mainWindow.webContents.send('menu:paste')
          }
        },
        {
          label: 'Dupliquer',
          accelerator: 'CmdOrCtrl+D',
          click: (): void => {
            mainWindow.webContents.send('menu:duplicate')
          }
        },
        { type: 'separator' },
        {
          label: 'Supprimer',
          accelerator: 'Delete',
          click: (): void => {
            mainWindow.webContents.send('menu:delete')
          }
        }
      ]
    },
    {
      label: 'Sélection',
      submenu: [
        {
          label: 'Tout sélectionner',
          accelerator: 'CmdOrCtrl+A',
          click: (): void => {
            mainWindow.webContents.send('menu:select-all')
          }
        },
        {
          label: 'Désélectionner tout',
          accelerator: 'Escape',
          click: (): void => {
            mainWindow.webContents.send('menu:deselect-all')
          }
        },
        {
          label: 'Inverser la sélection',
          accelerator: 'CmdOrCtrl+Shift+I',
          click: (): void => {
            mainWindow.webContents.send('menu:invert-selection')
          }
        }
      ]
    },
    {
      label: 'Disposition',
      submenu: [
        {
          label: 'Mettre au premier plan',
          accelerator: 'CmdOrCtrl+Shift+Up',
          click: (): void => {
            mainWindow.webContents.send('menu:bring-front')
          }
        },
        {
          label: 'Avancer',
          accelerator: 'CmdOrCtrl+Up',
          click: (): void => {
            mainWindow.webContents.send('menu:bring-forward')
          }
        },
        {
          label: 'Reculer',
          accelerator: 'CmdOrCtrl+Down',
          click: (): void => {
            mainWindow.webContents.send('menu:send-backward')
          }
        },
        {
          label: 'Mettre en arrière-plan',
          accelerator: 'CmdOrCtrl+Shift+Down',
          click: (): void => {
            mainWindow.webContents.send('menu:send-back')
          }
        },
        { type: 'separator' },
        {
          label: 'Aligner à gauche',
          click: (): void => {
            mainWindow.webContents.send('menu:align-left')
          }
        },
        {
          label: 'Centrer horizontalement',
          click: (): void => {
            mainWindow.webContents.send('menu:align-center-h')
          }
        },
        {
          label: 'Aligner à droite',
          click: (): void => {
            mainWindow.webContents.send('menu:align-right')
          }
        },
        { type: 'separator' },
        {
          label: 'Aligner en haut',
          click: (): void => {
            mainWindow.webContents.send('menu:align-top')
          }
        },
        {
          label: 'Centrer verticalement',
          click: (): void => {
            mainWindow.webContents.send('menu:align-center-v')
          }
        },
        {
          label: 'Aligner en bas',
          click: (): void => {
            mainWindow.webContents.send('menu:align-bottom')
          }
        },
        { type: 'separator' },
        {
          label: 'Distribuer horizontalement',
          click: (): void => {
            mainWindow.webContents.send('menu:distribute-h')
          }
        },
        {
          label: 'Distribuer verticalement',
          click: (): void => {
            mainWindow.webContents.send('menu:distribute-v')
          }
        }
      ]
    }
  ])

  Menu.setApplicationMenu(menu)
}

ipcMain.handle('dialog:save', async (_, data: string) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'Design Studio', extensions: ['dsc'] }],
    defaultPath: 'mon-design.dsc'
  })
  if (!result.canceled && result.filePath) {
    writeFileSync(result.filePath, data, 'utf-8')
    return result.filePath
  }
  return null
})

ipcMain.handle('dialog:save-pdf', async (_, data: string) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
    defaultPath: 'export.pdf'
  })
  if (!result.canceled && result.filePath) {
    writeFileSync(result.filePath, Buffer.from(data, 'base64'))
    return result.filePath
  }
  return null
})

ipcMain.handle('clipboard:write', (_, data: string) => {
  clipboard.writeText(data)
})

ipcMain.handle('clipboard:read', () => {
  return clipboard.readText()
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  ipcMain.on('ping', () => console.log('pong'))
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
