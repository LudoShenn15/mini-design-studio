import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: typeof electronAPI
    api: {
      onMenu: (channel: string, callback: (...args: unknown[]) => void) => void
      saveFile: (data: string) => Promise<string | null>
      savePdf: (data: string) => Promise<string | null>
      clipboardWrite: (data: string) => Promise<void>
      clipboardRead: () => Promise<string>
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
      // Écouter les événements du menu
      onMenu: (channel: string, callback: (...args: unknown[]) => void): void => {
        ipcRenderer.on(channel, (_event, ...args) => callback(...args))
      },
      // Enregistrer un fichier
      saveFile: (data: string): Promise<string | null> => ipcRenderer.invoke('dialog:save', data),
      // Enregistrer PDF
      savePdf: (data: string): Promise<string | null> =>
        ipcRenderer.invoke('dialog:save-pdf', data),
      clipboardWrite: (data: string): Promise<void> => ipcRenderer.invoke('clipboard:write', data),
      clipboardRead: (): Promise<string> => ipcRenderer.invoke('clipboard:read')
    })
  } catch (e) {
    console.error(e)
  }
} else {
  window.electron = electronAPI
  window.api = {
    onMenu: (_channel: string, _callback: (...args: unknown[]) => void): void => {
      void _channel
      void _callback
      // In non-isolated mode, menu IPC is unavailable.
      console.warn('window.api.onMenu is not supported in non-isolated mode')
    },
    saveFile: async (): Promise<string | null> => {
      throw new Error('saveFile is not supported in non-isolated mode')
    },
    savePdf: async (): Promise<string | null> => {
      throw new Error('savePdf is not supported in non-isolated mode')
    },
    clipboardWrite: async (): Promise<void> => {
      throw new Error('clipboardWrite is not supported in non-isolated mode')
    },
    clipboardRead: async (): Promise<string> => {
      throw new Error('clipboardRead is not supported in non-isolated mode')
    }
  }
}

export {}
