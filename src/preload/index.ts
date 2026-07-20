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
      openFile: () => Promise<string | null>
      openFileDialog: () => Promise<{ content: string; filePath: string } | null>
      saveToPath: (filePath: string, data: string) => Promise<boolean>
      onBeforeClose: (callback: () => void) => void
      confirmClose: () => void
      setMenuVisible: (visible: boolean) => void
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', {
      // Écouter les événements du menu
      onMenu: (channel: string, callback: (...args: unknown[]) => void): void => {
        ipcRenderer.removeAllListeners(channel)
        ipcRenderer.on(channel, (_event, ...args) => callback(...args))
      },
      // Enregistrer un fichier
      saveFile: (data: string): Promise<string | null> => ipcRenderer.invoke('dialog:save', data),
      // Enregistrer PDF
      savePdf: (data: string): Promise<string | null> =>
        ipcRenderer.invoke('dialog:save-pdf', data),
      clipboardWrite: (data: string): Promise<void> => ipcRenderer.invoke('clipboard:write', data),
      clipboardRead: (): Promise<string> => ipcRenderer.invoke('clipboard:read'),
      // Ouvrir un fichier (demande au main process)
      openFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:open'),
      // Ouvrir un fichier avec dialogue et retourner contenu + chemin
      openFileDialog: (): Promise<{ content: string; filePath: string } | null> =>
        ipcRenderer.invoke('dialog:open-file'),
      // Enregistrer directement à un chemin donné
      saveToPath: (filePath: string, data: string): Promise<boolean> =>
        ipcRenderer.invoke('file:save-to-path', filePath, data),
      // Avant la fermeture de l'app (main envoie 'app:before-close')
      onBeforeClose: (callback: () => void): void => {
        ipcRenderer.on('app:before-close', () => callback())
      },
      // Confirmer la fermeture depuis le renderer
      confirmClose: (): void => {
        ipcRenderer.send('app:confirm-close')
      },
      // Afficher / masquer le menu application
      setMenuVisible: (visible: boolean): void => {
        ipcRenderer.send('app:set-menu-visible', visible)
      }
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
    },
    openFile: async (): Promise<string | null> => {
      throw new Error('openFile is not supported in non-isolated mode')
    },
    openFileDialog: async (): Promise<{ content: string; filePath: string } | null> => {
      throw new Error('openFileDialog is not supported in non-isolated mode')
    },
    saveToPath: async (): Promise<boolean> => {
      throw new Error('saveToPath is not supported in non-isolated mode')
    },
    onBeforeClose: (_cb: () => void): void => {
      console.warn('onBeforeClose is not supported in non-isolated mode')
    },
    confirmClose: (): void => {
      console.warn('confirmClose is not supported in non-isolated mode')
    },
    setMenuVisible: (_visible: boolean): void => {
      // No-op in non-isolated mode
      console.warn('setMenuVisible is not supported in non-isolated mode')
      void _visible
    }
  }
}

export {}
