type ElectronAPI = import('@electron-toolkit/preload').ElectronAPI

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      onMenu: (channel: string, callback: (...args: unknown[]) => void) => void
      saveFile: (data: string) => Promise<string | null>
      savePdf: (data: string) => Promise<string | null>
      clipboardWrite: (data: string) => Promise<void>
      clipboardRead: () => Promise<string>
    }
  }
}
