<script lang="ts">
  import Toolbar from './components/Toolbar.svelte'
  import Canvas from './components/Canvas.svelte'
  import LayerPanel from './components/LayerPanel.svelte'
  import PropertiesPanel from './components/PropertiesPanel.svelte'
  import AIDialog from './components/AIDialog.svelte'
  import { elements } from './store'

  let canvasRef: Canvas
  let showAIDialog = false

  function handleExport(): void {
    canvasRef.exportPNG()
  }

  function handleGenerateAI(): void {
    showAIDialog = true
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
</script>

<main>
  <Toolbar onExport={handleExport} onGenerateAI={handleGenerateAI} />
  <Canvas bind:this={canvasRef} />
  <div class="right-panels">
    <PropertiesPanel />
    <LayerPanel />
  </div>
  <AIDialog bind:isOpen={showAIDialog} onImageGenerated={handleImageGenerated} />
</main>

<style>
  main {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
    background-color: #1a1a2e;
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
