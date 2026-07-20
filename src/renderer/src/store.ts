import { writable, derived, type Writable } from 'svelte/store'

export type Tool = 'select' | 'rect' | 'circle' | 'text' | 'image'
export const activeTool = writable<Tool>('select')

export type CanvasElement = {
  id: string
  type: 'rect' | 'circle' | 'text' | 'image'
  name: string
  visible: boolean
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  radiusX?: number
  radiusY?: number
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  text?: string
  src?: string
  scaleX?: number
  scaleY?: number
  rotation?: number
  // Texte
  fontFamily?: string
  fontSize?: number
  fontStyle?: string   // 'normal' | 'bold' | 'italic' | 'bold italic'
  textDecoration?: string  // 'underline' | ''
  textTransform?: 'none' | 'uppercase' | 'lowercase'
  // Rectangle
  cornerRadius?: number
}

export type CanvasFormat = {
  name: string
  width: number
  height: number
}

export type SaveFile = {
  format: CanvasFormat
  elements: CanvasElement[]
}

export const canvasFormat = writable<CanvasFormat>({
  name: 'A4 Portrait',
  width: 794,
  height: 1123
})

export type ToastType = 'info' | 'success' | 'error' | 'warning' | 'loading'

export const toast = writable<{ message: string; type: ToastType; show: boolean }>({
  message: '',
  type: 'info',
  show: false
})

let toastTimer: ReturnType<typeof setTimeout>

export function showToast(message: string, type: ToastType = 'info', duration = 3000): void {
  clearTimeout(toastTimer)
  toast.set({ message, type, show: true })

  // Le loading ne se ferme pas automatiquement
  if (type === 'loading') return

  toastTimer = setTimeout(() => {
    toast.update((t) => ({ ...t, show: false }))
  }, duration)
}

export function hideToast(): void {
  clearTimeout(toastTimer)
  toast.update((t) => ({ ...t, show: false }))
}

export const isDirty = writable(false)

export interface ElementsStore extends Writable<CanvasElement[]> {
  undo: () => void
  redo: () => void
}

// Historique pour undo/redo
const history: CanvasElement[][] = []
let historyIndex = -1

function createElementsStore(): ElementsStore {
  const { subscribe, set, update } = writable<CanvasElement[]>([])

  function pushHistory(state: CanvasElement[]): void {
    history.splice(historyIndex + 1)
    history.push(JSON.parse(JSON.stringify(state)))
    historyIndex = history.length - 1
    // mark dirty when history changes
    isDirty.set(true)
  }

  return {
    subscribe,
    set: (value: CanvasElement[]): void => {
      pushHistory(value)
      set(value)
    },
    update: (fn: (els: CanvasElement[]) => CanvasElement[]): void => {
      update((current) => {
        const next = fn(current)
        pushHistory(next)
        return next
      })
    },
    undo: (): void => {
      if (historyIndex <= 0) return
      historyIndex--
      set(JSON.parse(JSON.stringify(history[historyIndex])))
      isDirty.set(true)
    },
    redo: (): void => {
      if (historyIndex >= history.length - 1) return
      historyIndex++
      set(JSON.parse(JSON.stringify(history[historyIndex])))
      isDirty.set(true)
    }
  }
}

export const elements: ElementsStore = createElementsStore()
export const selectedIds = writable<string[]>([])
export const selectedId = derived(selectedIds, ($ids) => $ids[0] ?? null)
export const zoomLevel = writable<number>(1)
