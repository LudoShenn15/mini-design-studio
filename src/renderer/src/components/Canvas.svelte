<script lang="ts">
  import { onMount } from 'svelte'
  import Konva from 'konva'
  import { activeTool, elements, selectedIds, selectedId, type CanvasElement } from '../store'

  let container: HTMLDivElement
  let stage: Konva.Stage
  let layer: Konva.Layer
  let transformer: Konva.Transformer
  let isTransforming = false

  function generateId(): string {
    return Math.random().toString(36).substr(2, 9)
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
        fontSize: 24,
        fill: el.fill,
        opacity: el.opacity,
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

        img.on('click', () => {
          selectedIds.set([el.id])
          transformer.nodes([img])
          transformer.moveToTop()
          layer.draw()
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
      const isShift = e.evt.shiftKey
      const isCtrl = e.evt.ctrlKey

      if (isShift || isCtrl) {
        selectedIds.update((ids) => {
          if (ids.includes(el.id)) {
            return ids.filter((id) => id !== el.id)
          }
          return [...ids, el.id]
        })
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
            rotation: shape.rotation(),
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

  onMount(() => {
    stage = new Konva.Stage({
      container: container,
      width: 800,
      height: 600
    })

    layer = new Konva.Layer()
    stage.add(layer)

    transformer = new Konva.Transformer()
    layer.add(transformer)

    // Raccourcis clavier — Undo / Redo / Delete
    window.addEventListener('keydown', (e: KeyboardEvent) => {
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
    })

    // --- Electron menu IPC (renderer) ---
    const w = window as unknown as {
      api?: {
        onMenu: (channel: string, cb: (...args: unknown[]) => void) => void
        saveFile: (data: string) => Promise<string | null>
        savePdf: (data: string) => Promise<string | null>
        clipboardWrite: (data: string) => Promise<void>
        clipboardRead: () => Promise<string>
      }
    }

    if (w.api && typeof w.api.onMenu === 'function') {
      w.api.onMenu('menu:new', () => {
        layer.getChildren().forEach((shape) => {
          if (shape === transformer) return
          shape.destroy()
        })
        transformer.nodes([])
        elements.set([])
        selectedIds.set([])
        layer.draw()
      })

      w.api.onMenu('menu:open', (content: unknown) => {
        try {
          const parsed = JSON.parse(content as string) as CanvasElement[]
          elements.set(parsed)
          selectedIds.set([])
        } catch {
          console.error('Fichier invalide')
        }
      })

      let currentFilePath: string | null = null

      w.api.onMenu('menu:save', async () => {
        const data = JSON.stringify($elements)
        if (currentFilePath) {
          const { writeFileSync } = await import('fs')
          writeFileSync(currentFilePath, data, 'utf-8')
        } else {
          currentFilePath = await w.api.saveFile(data)
        }
      })

      w.api.onMenu('menu:save-as', async () => {
        currentFilePath = await w.api.saveFile(JSON.stringify($elements))
      })

      w.api.onMenu('menu:export-png', () => {
        const dataURL = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/png' })
        const link = document.createElement('a')
        link.download = 'export.png'
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })

      w.api.onMenu('menu:export-jpg', () => {
        const dataURL = stage.toDataURL({ pixelRatio: 2, mimeType: 'image/jpeg', quality: 0.9 })
        const link = document.createElement('a')
        link.download = 'export.jpg'
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })

      w.api.onMenu('menu:export-pdf', async () => {
        const dataURL = stage.toDataURL({ pixelRatio: 2 })
        const { jsPDF } = await import('jspdf')
        const pdf = new jsPDF({ orientation: 'landscape' })
        pdf.addImage(dataURL, 'PNG', 10, 10, 277, 190)
        const pdfData = pdf.output('datauristring').split(',')[1]
        await w.api.savePdf(pdfData)
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
          console.error('Presse-papier invalide')
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
        const maxX = Math.max(...selected.map((e) => e.x + (e.width ?? (e.radiusX ?? e.radius ?? 0))))
        const maxY = Math.max(...selected.map((e) => e.y + (e.height ?? (e.radiusY ?? e.radius ?? 0))))
        return { minX, minY, maxX, maxY }
      }

      const getElementSize = (e: CanvasElement): { w: number; h: number } => {
        return {
          w: e.width ?? (e.radiusX ?? e.radius ? (e.radiusX ?? e.radius) * 2 : 0),
          h: e.height ?? (e.radiusY ?? e.radius ? (e.radiusY ?? e.radius) * 2 : 0)
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
        if (selected.length < 3) return
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
        if (selected.length < 3) return
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

    stage.on('mousedown', () => {
      const tool = $activeTool

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
          text: 'Texte'
        }
      }

      if (newEl) {
        elements.update((els) => [...els, newEl!])
        addShape(newEl)
      }
    })
  })

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
              rotation: el.rotation ?? 0,
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
              rotation: el.rotation ?? 0,
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
            })
            if (el.type === 'rect') {
              shape.setAttrs({ width: el.width, height: el.height })
            } else if (el.type === 'text' && el.text !== undefined) {
              shape.setAttrs({ text: el.text })
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
</script>

<section class="canvas-area" data-tool={$activeTool}>
  <div class="canvas-container" bind:this={container}></div>
</section>

<style>
  .canvas-area {
    flex: 1;
    height: 100vh;
    background-color: #1a1a2e;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .canvas-area[data-tool="select"] {
    cursor: default;
  }

  .canvas-area[data-tool="rect"] {
    cursor: crosshair;
  }

  .canvas-area[data-tool="circle"] {
    cursor: crosshair;
  }

  .canvas-area[data-tool="text"] {
    cursor: text;
  }

  .canvas-container {
    width: 800px;
    height: 600px;
    background-color: #ffffff;
    border-radius: 4px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    transition: box-shadow 0.3s ease;
  }

  .canvas-container:hover {
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5);
  }
</style>
