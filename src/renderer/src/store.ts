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
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  text?: string
  src?: string
  radiusX?: number
  radiusY?: number
  scaleX?: number
  scaleY?: number
  rotation?: number
}
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
    },
    redo: (): void => {
      if (historyIndex >= history.length - 1) return
      historyIndex++
      set(JSON.parse(JSON.stringify(history[historyIndex])))
    }
  }
}

export const elements: ElementsStore = createElementsStore()
export const selectedIds = writable<string[]>([])
export const selectedId = derived(selectedIds, ($ids) => $ids[0] ?? null)
