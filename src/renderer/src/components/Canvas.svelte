<script lang="ts">
  import { onMount } from 'svelte'
  import Konva from 'konva'
  import {
    activeTool,
    elements,
    selectedIds,
    selectedId,
    canvasFormat,
    showToast,
    hideToast,
    isDirty,
    zoomLevel,
    type CanvasElement,
    type SaveFile,
    type CanvasFormat
  } from '../store'

  export let onMounted: (() => void) | null = null

  let container: HTMLDivElement
  let stage: Konva.Stage
  let layer: Konva.Layer
  let transformer: Konva.Transformer
  let isTransforming = false

  // Sélection par rectangle
  let selectionRect: Konva.Rect | null = null
  let isSelecting = false
  let selectionStart = { x: 0, y: 0 }

  function generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  function applyZoom(scale: number): void {
    const clampedScale = Math.min(Math.max(scale, 0.1), 5)
    zoomLevel.set(clampedScale)
  }

  export function zoomIn(): void {
    applyZoom($zoomLevel * 1.1)
  }

  export function zoomOut(): void {
    applyZoom($zoomLevel / 1.1)
  }

  export function resetZoom(): void {
    applyZoom(1)
  }

  function addShape(el: CanvasElement): void {
    let shape: Konva.Shape

    if (el.type === 'rect') {
      shape = new Konva.Rect({
        id: el.id,
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        fill: el.fill,
        stroke: el.stroke,
        strokeWidth: el.strokeWidth,
        opacity: el.opacity,
        draggable: true,
        cornerRadius: 4
      })
    } else if (el.type === 'circle') {
      shape = new Konva.Ellipse({
        id: el.id,
        x: el.x,
        y: el.y,
        radiusX: el.radiusX ?? el.radius ?? 60,
        radiusY: el.radiusY ?? el.radius ?? 60,
        fill: el.fill,
        stroke: el.stroke,
        strokeWidth: el.strokeWidth,
        opacity: el.opacity,
        scaleX: el.scaleX ?? 1,
        scaleY: el.scaleY ?? 1,
        rotation: el.rotation ?? 0,
        draggable: true
      })
    } else if (el.type === 'text') {
      shape = new Konva.Text({
        id: el.id,
        x: el.x,
        y: el.y,
        text: el.text ?? 'Texte',
        fontSize: el.fontSize ?? 24,
        fontFamily: el.fontFamily ?? 'Arial',
        fontStyle: el.fontStyle ?? 'normal',
        textDecoration: el.textDecoration ?? '',
        fill: el.fill,
        opacity: el.opacity,
        scaleX: el.scaleX ?? 1,
        scaleY: el.scaleY ?? 1,
        rotation: el.rotation ?? 0,
        draggable: true
      })
    } else if (el.type === 'image') {
      const imageObj = new window.Image()
      imageObj.onload = (): void => {
        const img = new Konva.Image({
          id: el.id,
          x: el.x,
          y: el.y,
          image: imageObj,
          width: el.width,
          height: el.height,
          opacity: el.opacity,
          draggable: true
        })

        img.on('click', (e) => {
          const isShift = e.evt.shiftKey
          const isCtrl = e.evt.ctrlKey

          if (isCtrl) {
            selectedIds.update((ids) =>
              ids.includes(el.id) ? ids.filter((id) => id !== el.id) : [...ids, el.id]
            )
          } else if (isShift) {
            const allIds = $elements.map((e) => e.id)
            const currentIds = $selectedIds
            if (currentIds.length === 0) {
              selectedIds.set([el.id])
              return
            }
            const lastId = currentIds[currentIds.length - 1]
            const lastIndex = allIds.indexOf(lastId)
            const currentIndex = allIds.indexOf(el.id)
            const start = Math.min(lastIndex, currentIndex)
            const end = Math.max(lastIndex, currentIndex)
            const rangeIds = allIds.slice(start, end + 1)
            selectedIds.update((ids) => [...new Set([...ids, ...rangeIds])])
          } else {
            selectedIds.set([el.id])
          }
        })

        img.on('dragend', () => {
          elements.update((els) =>
            els.map((e) => (e.id === el.id ? { ...e, x: img.x(), y: img.y() } : e))
          )
        })

        img.on('transformstart', () => {
          isTransforming = true
        })

        img.on('transformend', () => {
          const scaleX = img.scaleX()
          const scaleY = img.scaleY()

          elements.update((els) =>
            els.map((e) =>
              e.id === el.id
                ? {
                    ...e,
                    x: img.x(),
                    y: img.y(),
                    scaleX,
                    scaleY,
                    rotation: img.rotation(),
                    width: img.width() * scaleX,
                    height: img.height() * scaleY
                  }
                : e
            )
          )
          img.scaleX(1)
          img.scaleY(1)
          isTransforming = false
          layer.draw()
        })

        layer.add(img)
        transformer.moveToTop()
        layer.draw()
      }
      imageObj.src = el.src ?? ''
      return
    }

    shape.on('click', (e) => {
      // Pas de restriction sur l'outil — on sélectionne toujours
      const isShift = e.evt.shiftKey
      const isCtrl = e.evt.ctrlKey

      if (isCtrl) {
        selectedIds.update((ids) =>
          ids.includes(el.id) ? ids.filter((id) => id !== el.id) : [...ids, el.id]
        )
      } else if (isShift) {
        const allIds = $elements.map((e) => e.id)
        const currentIds = $selectedIds
        if (currentIds.length === 0) {
          selectedIds.set([el.id])
          return
        }
        const lastId = currentIds[currentIds.length - 1]
        const lastIndex = allIds.indexOf(lastId)
        const currentIndex = allIds.indexOf(el.id)
        const start = Math.min(lastIndex, currentIndex)
        const end = Math.max(lastIndex, currentIndex)
        const rangeIds = allIds.slice(start, end + 1)
        selectedIds.update((ids) => [...new Set([...ids, ...rangeIds])])
      } else {
        selectedIds.set([el.id])
      }
    })

    shape.on('transformstart', () => {
      isTransforming = true
    })

    shape.on('transformend', () => {
      const scaleX = shape.scaleX()
      const scaleY = shape.scaleY()

      elements.update((els) =>
        els.map((e) => {
          if (e.id !== el.id) return e

          const base = {
            ...e,
            x: shape.x(),
            y: shape.y(),
            scaleX,
            scaleY,
            rotation: shape.rotation()
          }

          if (el.type === 'rect') {
            return {
              ...base,
              width: (shape as Konva.Rect).width() * scaleX,
              height: (shape as Konva.Rect).height() * scaleY,
              scaleX: 1,
              scaleY: 1
            }
          }

          if (el.type === 'circle') {
            const ellipse = shape as Konva.Ellipse
            return {
              ...base,
              radiusX: ellipse.radiusX() * scaleX,
              radiusY: ellipse.radiusY() * scaleY,
              scaleX: 1,
              scaleY: 1
            }
          }

          return base
        })
      )

      shape.scaleX(1)
      shape.scaleY(1)
      isTransforming = false
      layer.draw()
    })

    if (el.type === 'text') {
      shape.on('dblclick', () => {
        const textNode = shape as Konva.Text

        textNode.hide()
        transformer.hide()
        layer.draw()

        const textPosition = textNode.absolutePosition()
        const stageBox = stage.container().getBoundingClientRect()

        const textarea = document.createElement('textarea')
        document.body.appendChild(textarea)

        textarea.value = textNode.text()
        textarea.style.position = 'absolute'
        textarea.style.top = `${stageBox.top + textPosition.y}px`
        textarea.style.left = `${stageBox.left + textPosition.x}px`
        textarea.style.minWidth = '60px'
        textarea.style.minHeight = `${textNode.fontSize()}px`
        textarea.style.fontSize = `${textNode.fontSize()}px`
        textarea.style.fontFamily = textNode.fontFamily()
        textarea.style.color = textNode.fill() as string
        textarea.style.border = '1px solid #e94560'
        textarea.style.padding = '0'
        textarea.style.margin = '0'
        textarea.style.overflow = 'hidden'
        textarea.style.background = 'rgba(255,255,255,0.95)'
        textarea.style.outline = 'none'
        textarea.style.resize = 'none'
        textarea.style.lineHeight = '1.2'
        textarea.style.borderRadius = '4px'
        textarea.style.whiteSpace = 'pre'
        textarea.rows = 1
        textarea.focus()

        // Redimensionner dynamiquement
        function resize(): void {
          textarea.style.height = 'auto'
          textarea.style.width = 'auto'
          textarea.style.height = `${textarea.scrollHeight}px`
          textarea.style.width = `${textarea.scrollWidth + 10}px`
        }

        resize()
        textarea.addEventListener('input', resize)

        function finish(): void {
          const newText = textarea.value || 'Texte'
          elements.update((els) => els.map((e) => (e.id === el.id ? { ...e, text: newText } : e)))
          document.body.removeChild(textarea)
          textNode.show()
          transformer.show()
          layer.draw()
        }

        // Escape uniquement pour valider — Enter fait un saut de ligne naturellement
        textarea.addEventListener('keydown', (ev: KeyboardEvent) => {
          if (ev.key === 'Escape') {
            finish()
          }
        })

        textarea.addEventListener('blur', () => {
          finish()
        })
      })
    }

    shape.on('dragend', () => {
      elements.update((els) =>
        els.map((e) => (e.id === el.id ? { ...e, x: shape.x(), y: shape.y() } : e))
      )
    })

    // Add entry animation
    shape.opacity(0)
    shape.scale({ x: 0.8, y: 0.8 })

    layer.add(shape)
    transformer.moveToTop()
    layer.draw()

    // Animate in
    shape.to({
      opacity: el.opacity,
      scaleX: el.scaleX ?? 1,
      scaleY: el.scaleY ?? 1,
      duration: 0.2,
      easing: Konva.Easings.BackEaseOut
    })
  }

  // Exposed APIs and current file path
  const w = window as unknown as {
    api: {
      onMenu: (channel: string, cb: (...args: unknown[]) => void) => void
      saveFile: (data: string) => Promise<string | null>
      savePdf: (data: string) => Promise<string | null>
      clipboardWrite: (data: string) => Promise<void>
      clipboardRead: () => Promise<string>
      openFile: () => Promise<string | null>
      saveToPath: (filePath: string, data: string) => Promise<boolean>
      onBeforeClose: (cb: () => void) => void
      confirmClose: () => void
      setMenuVisible: (visible: boolean) => void
    }
  }
  let currentFilePath: string | null = null

  function loadFile(content: string, filePath?: string): void {
    try {
      if (filePath) currentFilePath = filePath

      const parsed = JSON.parse(content) as SaveFile

      // 1. Détruire toutes les shapes existantes sur le canvas
      layer.getChildren().forEach((shape) => {
        if (shape === transformer) return
        shape.destroy()
      })
      transformer.nodes([])

      // 2. Charger le format et les éléments
      if (Array.isArray(parsed)) {
        elements.set(parsed)
      } else {
        canvasFormat.set(parsed.format)
        elements.set(parsed.elements)
      }

      // 3. Redimensionner le stage selon le format chargé
      const format = Array.isArray(parsed) ? $canvasFormat : parsed.format
      stage.width(format.width)
      stage.height(format.height)

      // 4. Forcer le redessin de tous les éléments
      const els = Array.isArray(parsed) ? parsed : parsed.elements
      els.forEach((el) => addShape(el))

      selectedIds.set([])
      isDirty.set(false)
      layer.draw()
      showToast('Fichier ouvert', 'success')
    } catch {
      showToast('Fichier invalide ou corrompu', 'error')
    }
  }

  async function doSave(): Promise<void> {
    showToast('Enregistrement en cours...', 'loading')
    const saveData = JSON.stringify({ format: $canvasFormat, elements: $elements })

    if (currentFilePath) {
      const ok = await w.api.saveToPath(currentFilePath, saveData)
      hideToast()
      if (ok) {
        isDirty.set(false)
        showToast('Fichier enregistré ✓', 'success')
      } else {
        showToast("Erreur lors de l'enregistrement", 'error')
      }
    } else {
      currentFilePath = await w.api.saveFile(saveData)
      hideToast()
      if (currentFilePath) {
        isDirty.set(false)
        showToast('Fichier enregistré ✓', 'success')
      }
    }
  }

  // Écouter la création d'un nouveau fichier (format) depuis App.svelte
  window.addEventListener('app:create-new', () => {
    if (!layer) return
    // Détruire toutes les shapes et réinitialiser l'état
    layer.getChildren().forEach((shape) => {
      if (shape === transformer) return
      shape.destroy()
    })
    transformer.nodes([])
    elements.set([])
    selectedIds.set([])
    currentFilePath = null
    // le format est appliqué via le store canvasFormat — le reactive block ajuste la stage
    layer.draw()
    showToast('Nouveau fichier créé', 'success')
  })

  onMount(() => {
    stage = new Konva.Stage({
      container: container,
      width: $canvasFormat.width,
      height: $canvasFormat.height
    })

    layer = new Konva.Layer()
    stage.add(layer)

    transformer = new Konva.Transformer()
    layer.add(transformer)

    // Écouter les événements de redimensionnement du canvas
    window.addEventListener('canvas:resize', (e: Event) => {
      const format = (e as CustomEvent<CanvasFormat>).detail
      stage.width(format.width)
      stage.height(format.height)
      layer.draw()
    })

    // Notifier App que le canvas est prêt
    onMounted?.()

    // Écouter le chargement différé depuis le splash screen
    window.addEventListener('canvas:load-file', (e: Event) => {
      const { content, filePath } = (e as CustomEvent).detail
      loadFile(content, filePath)
    })

    // Raccourcis clavier — Undo / Redo / Delete
    window.addEventListener('keydown', async (e: KeyboardEvent) => {
      // Undo (Ctrl/Cmd + Z)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        elements.undo()
        selectedIds.set([])
        return
      }

      // Redo (Ctrl/Cmd + Y)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        elements.redo()
        selectedIds.set([])
        return
      }

      // Delete
      if (e.key === 'Delete') {
        const ids = $selectedIds
        if (ids.length === 0) return
        elements.update((els) => els.filter((el) => !ids.includes(el.id)))
        selectedIds.set([])
        transformer.nodes([])
        layer.draw()
      }

      // Save (Ctrl/Cmd + S)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        await doSave()
        return
      }

      // Déplacement avec touches directionnelles
      const STEP = e.shiftKey ? 10 : 1 // Shift = grands pas

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        if ($selectedIds.length === 0) return

        elements.update((els) =>
          els.map((el) => {
            if (!$selectedIds.includes(el.id)) return el
            return {
              ...el,
              x: el.x + (e.key === 'ArrowRight' ? STEP : e.key === 'ArrowLeft' ? -STEP : 0),
              y: el.y + (e.key === 'ArrowDown' ? STEP : e.key === 'ArrowUp' ? -STEP : 0)
            }
          })
        )
        return
      }

      // Zoom shortcuts
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        applyZoom($zoomLevel * 1.1)
      }
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault()
        applyZoom($zoomLevel / 1.1)
      }
      if (e.ctrlKey && e.key === '0') {
        e.preventDefault()
        applyZoom(1)
      }
    })

    // Zoom with Ctrl+MouseWheel
    stage.on('wheel', (e) => {
      e.evt.preventDefault()
      if (!e.evt.ctrlKey) return

      const scaleBy = 1.08
      const newScale = e.evt.deltaY < 0 ? $zoomLevel * scaleBy : $zoomLevel / scaleBy
      applyZoom(newScale)
    })

    // Zoom slider event listener
    window.addEventListener('zoom:set', (e: Event) => {
      const scale = (e as CustomEvent<number>).detail
      applyZoom(scale)
    })

    // --- Electron menu IPC (renderer) ---

    if (w.api && typeof w.api.onMenu === 'function') {
      w.api.onMenu('menu:new', () => {
        // Ouvrir la modale de création de nouveau fichier dans App.svelte
        window.dispatchEvent(new CustomEvent('app:new-file'))
      })

      w.api.onMenu('menu:open', (content: unknown, filePath?: unknown) => {
        loadFile(content as string, filePath as string)
      })

      w.api.onMenu('menu:save', async () => {
        await doSave()
      })

      w.api.onMenu('menu:save-as', async () => {
        const saveData = JSON.stringify({ format: $canvasFormat, elements: $elements })
        currentFilePath = await w.api.saveFile(saveData)
        if (currentFilePath) {
          isDirty.set(false)
          showToast('Fichier enregistré', 'success')
        }
      })

      w.api.onMenu('menu:export-png', () => {
        const dataURL = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/png' })
        const link = document.createElement('a')
        link.download = 'export.png'
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast('Export PNG réussi', 'success')
      })

      w.api.onMenu('menu:export-jpg', () => {
        const dataURL = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/jpeg', quality: 0.9 })
        const link = document.createElement('a')
        link.download = 'export.jpg'
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast('Export JPG réussi', 'success')
      })

      w.api.onMenu('menu:export-pdf', async () => {
        const dataURL = stage.toDataURL({ pixelRatio: 2 })
        const { jsPDF } = await import('jspdf')
        const pdf = new jsPDF({ orientation: 'landscape' })
        pdf.addImage(dataURL, 'PNG', 10, 10, 277, 190)
        const pdfData = pdf.output('datauristring').split(',')[1]
        await w.api.savePdf(pdfData)
        showToast('Export PDF réussi', 'success')
      })

      w.api.onMenu('menu:undo', () => {
        elements.undo()
        selectedIds.set([])
      })
      w.api.onMenu('menu:redo', () => {
        elements.redo()
        selectedIds.set([])
      })

      w.api.onMenu('menu:copy', async () => {
        const selected = $elements.filter((e) => $selectedIds.includes(e.id))
        if (selected.length === 0) return
        await w.api.clipboardWrite(JSON.stringify(selected))
      })

      w.api.onMenu('menu:cut', async () => {
        const selected = $elements.filter((e) => $selectedIds.includes(e.id))
        if (selected.length === 0) return
        await w.api.clipboardWrite(JSON.stringify(selected))
        elements.update((els) => els.filter((e) => !$selectedIds.includes(e.id)))
        selectedIds.set([])
      })

      w.api.onMenu('menu:paste', async () => {
        const text = await w.api.clipboardRead()
        try {
          const copied = JSON.parse(text) as CanvasElement[]
          const newEls = copied.map((e) => ({
            ...e,
            id: Math.random().toString(36).substr(2, 9),
            x: e.x + 20,
            y: e.y + 20
          }))
          elements.update((els) => [...els, ...newEls])
          selectedIds.set(newEls.map((e) => e.id))
        } catch {
          showToast('Rien à coller', 'warning')
        }
      })

      w.api.onMenu('menu:duplicate', () => {
        const selected = $elements.filter((e) => $selectedIds.includes(e.id))
        if (selected.length === 0) return
        const newEls = selected.map((e) => ({
          ...e,
          id: Math.random().toString(36).substr(2, 9),
          x: e.x + 20,
          y: e.y + 20
        }))
        elements.update((els) => [...els, ...newEls])
        selectedIds.set(newEls.map((e) => e.id))
      })

      w.api.onMenu('menu:delete', () => {
        const ids = $selectedIds
        if (ids.length === 0) return
        elements.update((els) => els.filter((el) => !ids.includes(el.id)))
        selectedIds.set([])
        transformer.nodes([])
        layer.draw()
      })

      w.api.onMenu('menu:select-all', () => {
        selectedIds.set($elements.map((e) => e.id))
      })

      w.api.onMenu('menu:deselect-all', () => {
        selectedIds.set([])
      })

      w.api.onMenu('menu:invert-selection', () => {
        const allIds = $elements.map((e) => e.id)
        selectedIds.set(allIds.filter((id) => !$selectedIds.includes(id)))
      })

      w.api.onMenu('menu:bring-front', () => {
        elements.update((els) => {
          const selected = els.filter((e) => $selectedIds.includes(e.id))
          const rest = els.filter((e) => !$selectedIds.includes(e.id))
          return [...rest, ...selected]
        })
      })

      w.api.onMenu('menu:send-back', () => {
        elements.update((els) => {
          const selected = els.filter((e) => $selectedIds.includes(e.id))
          const rest = els.filter((e) => !$selectedIds.includes(e.id))
          return [...selected, ...rest]
        })
      })

      w.api.onMenu('menu:bring-forward', () => {
        elements.update((els) => {
          const arr = [...els]
          $selectedIds.forEach((id) => {
            const idx = arr.findIndex((e) => e.id === id)
            if (idx < arr.length - 1) {
              ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
            }
          })
          return arr
        })
      })

      w.api.onMenu('menu:send-backward', () => {
        elements.update((els) => {
          const arr = [...els]
          $selectedIds.forEach((id) => {
            const idx = arr.findIndex((e) => e.id === id)
            if (idx > 0) {
              ;[arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]]
            }
          })
          return arr
        })
      })

      const getSelectionBounds = (): { minX: number; minY: number; maxX: number; maxY: number } => {
        const selected = $elements.filter((e) => $selectedIds.includes(e.id))
        const minX = Math.min(...selected.map((e) => e.x))
        const minY = Math.min(...selected.map((e) => e.y))
        const maxX = Math.max(...selected.map((e) => e.x + (e.width ?? e.radiusX ?? e.radius ?? 0)))
        const maxY = Math.max(
          ...selected.map((e) => e.y + (e.height ?? e.radiusY ?? e.radius ?? 0))
        )
        return { minX, minY, maxX, maxY }
      }

      const getElementSize = (e: CanvasElement): { w: number; h: number } => {
        return {
          w: e.width ?? ((e.radiusX ?? e.radius) ? (e.radiusX ?? e.radius) * 2 : 0),
          h: e.height ?? ((e.radiusY ?? e.radius) ? (e.radiusY ?? e.radius) * 2 : 0)
        }
      }

      w.api.onMenu('menu:align-left', () => {
        const { minX } = getSelectionBounds()
        elements.update((els) =>
          els.map((e) => ($selectedIds.includes(e.id) ? { ...e, x: minX } : e))
        )
      })

      w.api.onMenu('menu:align-right', () => {
        const { maxX } = getSelectionBounds()
        elements.update((els) =>
          els.map((e) => {
            if (!$selectedIds.includes(e.id)) return e
            const { w } = getElementSize(e)
            return { ...e, x: maxX - w }
          })
        )
      })

      w.api.onMenu('menu:align-center-h', () => {
        const { minX, maxX } = getSelectionBounds()
        const centerX = (minX + maxX) / 2
        elements.update((els) =>
          els.map((e) => {
            if (!$selectedIds.includes(e.id)) return e
            const { w } = getElementSize(e)
            return { ...e, x: centerX - w / 2 }
          })
        )
      })

      w.api.onMenu('menu:align-top', () => {
        const { minY } = getSelectionBounds()
        elements.update((els) =>
          els.map((e) => ($selectedIds.includes(e.id) ? { ...e, y: minY } : e))
        )
      })

      w.api.onMenu('menu:align-bottom', () => {
        const { maxY } = getSelectionBounds()
        elements.update((els) =>
          els.map((e) => {
            if (!$selectedIds.includes(e.id)) return e
            const { h } = getElementSize(e)
            return { ...e, y: maxY - h }
          })
        )
      })

      w.api.onMenu('menu:align-center-v', () => {
        const { minY, maxY } = getSelectionBounds()
        const centerY = (minY + maxY) / 2
        elements.update((els) =>
          els.map((e) => {
            if (!$selectedIds.includes(e.id)) return e
            const { h } = getElementSize(e)
            return { ...e, y: centerY - h / 2 }
          })
        )
      })

      w.api.onMenu('menu:distribute-h', () => {
        const selected = $elements.filter((e) => $selectedIds.includes(e.id))
        if (selected.length < 3) {
          showToast('Sélectionne au moins 3 éléments pour distribuer', 'warning')
          return
        }
        const sorted = [...selected].sort((a, b) => a.x - b.x)
        const totalWidth = sorted.reduce((acc, e) => acc + getElementSize(e).w, 0)
        const gap =
          (sorted[sorted.length - 1].x +
            getElementSize(sorted[sorted.length - 1]).w -
            sorted[0].x -
            totalWidth) /
          (sorted.length - 1)
        let currentX = sorted[0].x
        const positions: Record<string, number> = {}
        sorted.forEach((e) => {
          positions[e.id] = currentX
          currentX += getElementSize(e).w + gap
        })
        elements.update((els) =>
          els.map((e) => ($selectedIds.includes(e.id) ? { ...e, x: positions[e.id] } : e))
        )
      })

      w.api.onMenu('menu:distribute-v', () => {
        const selected = $elements.filter((e) => $selectedIds.includes(e.id))
        if (selected.length < 3) {
          showToast('Sélectionne au moins 3 éléments pour distribuer', 'warning')
          return
        }
        const sorted = [...selected].sort((a, b) => a.y - b.y)
        const totalHeight = sorted.reduce((acc, e) => acc + getElementSize(e).h, 0)
        const gap =
          (sorted[sorted.length - 1].y +
            getElementSize(sorted[sorted.length - 1]).h -
            sorted[0].y -
            totalHeight) /
          (sorted.length - 1)
        let currentY = sorted[0].y
        const positions: Record<string, number> = {}
        sorted.forEach((e) => {
          positions[e.id] = currentY
          currentY += getElementSize(e).h + gap
        })
        elements.update((els) =>
          els.map((e) => ($selectedIds.includes(e.id) ? { ...e, y: positions[e.id] } : e))
        )
      })
    }

    stage.on('click', (e) => {
      if (e.target === stage) {
        selectedIds.set([])
        transformer.nodes([])
        layer.draw()
      }
    })

    // Sélection par rectangle - mousemove
    stage.on('mousemove', () => {
      if (!isSelecting || !selectionRect) return

      const pos = stage.getPointerPosition()!
      const x = Math.min(pos.x, selectionStart.x)
      const y = Math.min(pos.y, selectionStart.y)
      const width = Math.abs(pos.x - selectionStart.x)
      const height = Math.abs(pos.y - selectionStart.y)

      selectionRect.setAttrs({ x, y, width, height })
      layer.draw()
    })

    // Sélection par rectangle - mouseup
    stage.on('mouseup', () => {
      if (!isSelecting || !selectionRect) return
      isSelecting = false

      // Coordonnées du rectangle de sélection dans l'espace du stage
      const x1 = selectionStart.x
      const y1 = selectionStart.y
      const pos = stage.getPointerPosition()!
      const x2 = pos.x
      const y2 = pos.y

      const selBox = {
        x: Math.min(x1, x2),
        y: Math.min(y1, y2),
        width: Math.abs(x2 - x1),
        height: Math.abs(y2 - y1)
      }

      selectionRect.destroy()
      selectionRect = null

      // Ignorer si le rectangle est trop petit (simple clic)
      if (selBox.width < 5 && selBox.height < 5) {
        selectedIds.set([])
        layer.draw()
        return
      }

      // Trouver les éléments qui intersectent
      const selected = $elements.filter((el) => {
        const shape = layer.findOne(`#${el.id}`)
        if (!shape) return false

        // Position de la shape dans l'espace du stage (sans scale)
        const shapePos = shape.getAbsolutePosition()
        const scaleX = stage.scaleX()
        const scaleY = stage.scaleY()
        const stagePos = stage.position()

        const sx = (shapePos.x - stagePos.x) / scaleX
        const sy = (shapePos.y - stagePos.y) / scaleY
        const sw = shape.width() * shape.scaleX() || 60
        const sh = shape.height() * shape.scaleY() || 60

        return (
          selBox.x < sx + sw &&
          selBox.x + selBox.width > sx &&
          selBox.y < sy + sh &&
          selBox.y + selBox.height > sy
        )
      })

      if (selected.length > 0) {
        selectedIds.set(selected.map((e) => e.id))
      } else {
        selectedIds.set([])
      }

      layer.draw()
    })

    stage.on('mousedown', (e) => {
      const tool = $activeTool

      // Sélection par rectangle — mode select + clic sur fond
      if (tool === 'select' && e.target === stage) {
        isSelecting = true
        const pos = stage.getPointerPosition()!
        selectionStart = { x: pos.x, y: pos.y }

        selectionRect = new Konva.Rect({
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: 'rgba(233, 69, 96, 0.1)',
          stroke: '#e94560',
          strokeWidth: 1,
          dash: [4, 4]
        })
        layer.add(selectionRect)
        layer.draw()
        return
      }

      // Création de forme — autres outils + clic sur fond
      if (tool === 'select') return
      if (e.target !== stage) return

      const pos = stage.getPointerPosition()
      if (!pos) return

      const id = generateId()
      let newEl: CanvasElement | null = null

      if (tool === 'rect') {
        newEl = {
          id,
          type: 'rect',
          name: 'Rectangle',
          visible: true,
          x: pos.x,
          y: pos.y,
          width: 160,
          height: 100,
          fill: '#4f8ef7',
          stroke: '#2563eb',
          strokeWidth: 1,
          opacity: 1
        }
      } else if (tool === 'circle') {
        newEl = {
          id,
          type: 'circle',
          name: 'Cercle',
          visible: true,
          x: pos.x,
          y: pos.y,
          radiusX: 60,
          radiusY: 60,
          fill: '#e94560',
          stroke: '#be123c',
          strokeWidth: 1,
          opacity: 1
        }
      } else if (tool === 'text') {
        newEl = {
          id,
          type: 'text',
          name: 'Texte',
          visible: true,
          x: pos.x,
          y: pos.y,
          fill: '#1a1a2e',
          stroke: '',
          strokeWidth: 0,
          opacity: 1,
          text: 'Texte',
          fontSize: 24,
          fontFamily: 'Arial',
          fontStyle: 'normal'
        }
      }

      if (newEl) {
        elements.update((els) => [...els, newEl!])
        addShape(newEl)
      }
    })
  })

  $: {
    if (stage) {
      // Ajuster la taille du stage si le format change
      stage.width($canvasFormat.width)
      stage.height($canvasFormat.height)
      layer && layer.draw()
    }
  }

  $: {
    if (layer && !isTransforming) {
      $elements.forEach(() => {})

      // Supprimer shapes qui ne sont plus dans le store
      layer.getChildren().forEach((shape) => {
        if (shape === transformer) return
        const stillExists = $elements.find((e) => e.id === shape.id())
        if (!stillExists) {
          if ($selectedId === shape.id()) transformer.nodes([])
          // Animate out before destroying
          shape.to({
            opacity: 0,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 0.15,
            easing: Konva.Easings.EaseInOut,
            onFinish: () => shape.destroy()
          })
        }
      })

      // Ajouter les shapes qui sont dans le store mais pas encore sur le canvas
      $elements.forEach((el) => {
        const existing = layer.findOne(`#${el.id}`)
        if (!existing) {
          addShape(el)
        }
      })

      // Sync toutes les propriétés + visibilité + ordre
      $elements.forEach((el, index) => {
        const shape = layer.findOne(`#${el.id}`)
        if (shape) {
          shape.visible(el.visible)
          shape.zIndex(index)
          if (el.type === 'image') {
            shape.setAttrs({
              opacity: el.opacity,
              x: el.x,
              y: el.y,
              width: el.width,
              height: el.height,
              scaleX: el.scaleX ?? 1,
              scaleY: el.scaleY ?? 1,
              rotation: el.rotation ?? 0
            })
          } else if (el.type === 'circle') {
            shape.setAttrs({
              radiusX: el.radiusX ?? el.radius ?? 60,
              radiusY: el.radiusY ?? el.radius ?? 60,
              fill: el.fill,
              stroke: el.stroke,
              strokeWidth: el.strokeWidth,
              opacity: el.opacity,
              x: el.x,
              y: el.y,
              scaleX: el.scaleX ?? 1,
              scaleY: el.scaleY ?? 1,
              rotation: el.rotation ?? 0
            })
          } else {
            shape.setAttrs({
              fill: el.fill,
              stroke: el.stroke,
              strokeWidth: el.strokeWidth,
              opacity: el.opacity,
              x: el.x,
              y: el.y,
              scaleX: el.scaleX ?? 1,
              scaleY: el.scaleY ?? 1,
              rotation: el.rotation ?? 0,
              ...(el.type === 'rect' ? { cornerRadius: el.cornerRadius ?? 0 } : {})
            })
            if (el.type === 'rect') {
              shape.setAttrs({ width: el.width, height: el.height })
            } else if (el.type === 'text' && el.text !== undefined) {
              shape.setAttrs({
                text:
                  el.type === 'text' && el.textTransform === 'uppercase'
                    ? el.text.toUpperCase()
                    : el.type === 'text' && el.textTransform === 'lowercase'
                      ? el.text.toLowerCase()
                      : el.text,
                fontFamily: el.fontFamily ?? 'Arial',
                fontSize: el.fontSize ?? 24,
                fontStyle: el.fontStyle ?? 'normal',
                textDecoration: el.textDecoration ?? ''
              })
            }
          }
        }
      })

      transformer.moveToTop()
      layer.draw()
    }
  }

  $: {
    if (layer) {
      const shapes = $selectedIds
        .map((id) => layer.findOne(`#${id}`))
        .filter((s): s is Konva.Node => !!s)
      transformer.nodes(shapes)
      transformer.moveToTop()
      layer.draw()
    }
  }

  export function exportPNG(): void {
    if (!stage) return
    const dataURL = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = 'canvas-export.png'
    link.href = dataURL
    link.click()
    document.body.removeChild(link)
  }

  export async function saveFile(): Promise<void> {
    await doSave()
  }

  export async function triggerOpen(): Promise<void> {
    if (!w.api || typeof w.api.openFile !== 'function') return
    const content = await w.api.openFile()
    if (!content) return
    try {
      const parsed = JSON.parse(content as string) as CanvasElement[]
      elements.set(parsed)
      selectedIds.set([])
      currentFilePath = null
      isDirty.set(false)
      showToast('Fichier ouvert', 'success')
    } catch {
      showToast('Fichier invalide ou corrompu', 'error')
    }
  }
</script>

<section class="canvas-area" data-tool={$activeTool}>
  <div
    class="canvas-container"
    bind:this={container}
    style="width: {$canvasFormat.width}px; height: {$canvasFormat.height}px; transform: scale({$zoomLevel});"
  ></div>
</section>

<style>
  .canvas-area {
    height: 100vh;
    background-color: #1a1a2e;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .canvas-area[data-tool='select'] {
    cursor: default;
  }

  .canvas-area[data-tool='rect'] {
    cursor: crosshair;
  }

  .canvas-area[data-tool='circle'] {
    cursor: crosshair;
  }

  .canvas-area[data-tool='text'] {
    cursor: text;
  }

  .canvas-container {
    background-color: #ffffff;
    border-radius: 4px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    transition: box-shadow 0.3s ease;
  }

  .canvas-container:hover {
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  }
</style>
