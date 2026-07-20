<script lang="ts">
  import { onMount } from 'svelte'
  import Toolbar from './components/Toolbar.svelte'
  import Canvas from './components/Canvas.svelte'
  import LayerPanel from './components/LayerPanel.svelte'
  import PropertiesPanel from './components/PropertiesPanel.svelte'
  import SplashScreen from './components/SplashScreen.svelte'
  import SaveDialog from './components/SaveDialog.svelte'
  import AIDialog from './components/AIDialog.svelte'
  import Toast from './components/Toast.svelte'
  import ZoomBar from './components/ZoomBar.svelte'
  import { elements, toast, isDirty } from './store'

  let canvasRef: Canvas
  let showAIDialog = false
  let showSplash = true
  let showSaveDialog = false
  let pendingAction: 'new' | null = null
  let pendingFileContent: string | null = null
  let pendingFilePath: string | null = null

  const w = window as unknown as {
    api?: {
      openFileDialog?: () => Promise<{ content: string; filePath: string } | null>
      onBeforeClose?: (cb: () => void) => void
      confirmClose?: () => void
      setMenuVisible?: (visible: boolean) => void
    }
  }

  onMount(() => {
    // Hide menu when splash screen is shown
    if (w.api && typeof w.api.setMenuVisible === 'function') {
      w.api.setMenuVisible(false)
    }

    if (w.api && typeof w.api.onBeforeClose === 'function') {
      w.api.onBeforeClose(() => {
        if ($isDirty) {
          showSaveDialog = true
        } else {
          // nothing to save, confirm close immediately
          w.api.confirmClose && w.api.confirmClose()
        }
      })
    }

    // Ecouter l'event envoyé par le menu "Nouveau"
    window.addEventListener('app:new-file', () => {
      handleNewRequest()
    })
  })

  function handleNewRequest(): void {
    if ($isDirty) {
      pendingAction = 'new'
      showSaveDialog = true
    } else {
      showNewFileDialog = true
    }
  }

  function handleExport(): void {
    canvasRef.exportPNG()
  }

  function handleImageGenerated(src: string): void {
    const img = new Image()
    img.onload = (): void => {
      const maxW = 400
      const maxH = 300
      let w = img.width
      let h = img.height
      if (w > maxW) {
        h = (h * maxW) / w
        w = maxW
      }
      if (h > maxH) {
        w = (w * maxH) / h
        h = maxH
      }
      const id = Math.random().toString(36).substr(2, 9)
      elements.update((els) => [
        ...els,
        {
          id,
          type: 'image',
          name: 'Image IA',
          visible: true,
          x: 100,
          y: 100,
          width: w,
          height: h,
          fill: '',
          stroke: '',
          strokeWidth: 0,
          opacity: 1,
          src
        }
      ])
    }
    img.src = src
  }

  import { canvasFormat, type CanvasFormat } from './store'
  import NewFileDialog from './components/NewFileDialog.svelte'

  let showNewFileDialog = false

  function handleNewFromSplash(): void {
    showNewFileDialog = true
  }

  function handleFormatConfirm(e: CustomEvent<CanvasFormat>): void {
    canvasFormat.set(e.detail)
    // informer le canvas de créer un nouveau document avec ce format
    window.dispatchEvent(new CustomEvent('app:create-new', { detail: e.detail }))
    // Notifier le canvas du nouveau format pour redimensionner
    window.dispatchEvent(new CustomEvent('canvas:resize', { detail: e.detail }))
    showSplash = false
    showNewFileDialog = false
    // Show menu when editor is opened
    if (w.api && typeof w.api.setMenuVisible === 'function') {
      w.api.setMenuVisible(true)
    }
  }

  function handleFormatCancel(): void {
    showNewFileDialog = false
  }

  async function handleOpen(): Promise<void> {
    const result = await w.api?.openFileDialog?.()
    if (!result) return

    pendingFileContent = result.content
    pendingFilePath = result.filePath
    showSplash = false
    // Show menu when editor is opened
    if (w.api && typeof w.api.setMenuVisible === 'function') {
      w.api.setMenuVisible(true)
    }
  }

  function onCanvasMounted(): void {
    if (pendingFileContent) {
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('canvas:load-file', {
            detail: { content: pendingFileContent, filePath: pendingFilePath }
          })
        )
        pendingFileContent = null
        pendingFilePath = null
      }, 100)
    }
  }

  async function handleSaveAndClose(): Promise<void> {
    await canvasRef.saveFile()
    showSaveDialog = false
    executePendingAction()
  }

  function handleDiscardAndClose(): void {
    showSaveDialog = false
    executePendingAction()
  }

  function handleCancelClose(): void {
    showSaveDialog = false
    pendingAction = null
  }

  function executePendingAction(): void {
    if (pendingAction === 'new') {
      showNewFileDialog = true
      pendingAction = null
    } else {
      // C'était une fermeture d'app
      w.api?.confirmClose && w.api.confirmClose()
    }
  }
</script>

{#if showSplash}
  <SplashScreen on:new={handleNewFromSplash} on:open={handleOpen} />
{:else}
  <main>
    <Toolbar onExport={handleExport} />
    <div class="canvas-wrapper">
      <Canvas bind:this={canvasRef} onMounted={onCanvasMounted} />
      <ZoomBar
        onZoomIn={() => canvasRef.zoomIn()}
        onZoomOut={() => canvasRef.zoomOut()}
        onReset={() => canvasRef.resetZoom()}
      />
    </div>
    <div class="right-panels">
      <PropertiesPanel />
      <LayerPanel />
    </div>
    <AIDialog bind:isOpen={showAIDialog} onImageGenerated={handleImageGenerated} />
  </main>
{/if}

<Toast message={$toast.message} type={$toast.type} show={$toast.show} />

<NewFileDialog
  show={showNewFileDialog}
  on:confirm={handleFormatConfirm}
  on:cancel={handleFormatCancel}
/>

<SaveDialog
  show={showSaveDialog}
  message={pendingAction === 'new'
    ? 'Voulez-vous enregistrer le fichier actuel avant de créer un nouveau fichier ?'
    : 'Vos modifications seront perdues si vous quittez sans enregistrer.'}
  on:save={handleSaveAndClose}
  on:discard={handleDiscardAndClose}
  on:cancel={handleCancelClose}
/>

<style>
  main {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    background-color: #1a1a2e;
    overflow: hidden;
  }

  .canvas-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .right-panels {
    display: flex;
    flex-direction: column;
    width: 280px;
    min-width: 280px;
    height: 100vh;
    border-left: 1px solid #2d2d4e;
    transition: border-color 0.3s ease;
  }

  .right-panels:hover {
    border-left-color: #3d3d5e;
  }
</style>
