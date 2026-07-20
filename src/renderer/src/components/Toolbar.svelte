<script lang="ts">
  import { activeTool, elements, showToast, type Tool } from '../store'

  export let onExport: () => void

  const tools: { id: Tool; icon: string; title: string }[] = [
    { id: 'select', icon: '▷', title: 'Sélection' },
    { id: 'rect', icon: '▭', title: 'Rectangle' },
    { id: 'circle', icon: '○', title: 'Cercle' },
    { id: 'text', icon: 'T', title: 'Texte' }
  ]

  function setTool(id: Tool): void {
    activeTool.set(id)
  }

  function importImage(): void {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (): void => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (e): void => {
        const src = e.target?.result as string
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
              name: file.name,
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
      reader.readAsDataURL(file)
    }
    input.click()
  }
</script>

<aside class="toolbar">
  <div class="logo">DS</div>
  <div class="tools">
    {#each tools as tool (tool.id)}
      <button
        title={tool.title}
        class:active={$activeTool === tool.id}
        on:click={() => setTool(tool.id)}
      >
        {tool.icon}
      </button>
    {/each}
    <div class="separator"></div>
    <button title="Importer une image" on:click={importImage}>🖼</button>
    <button
      title="Générer avec IA"
      on:click={() => showToast('✨ Génération IA — Bientôt disponible !', 'info')}
    >
      ✨
    </button>
    <div class="separator"></div>
    <button title="Exporter en PNG" on:click={onExport}>⬇</button>
  </div>
</aside>

<style>
  .toolbar {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 56px;
    min-width: 56px;
    height: 100vh;
    background-color: #12122a;
    border-right: 1px solid #2d2d4e;
    padding: 12px 0;
    gap: 8px;
  }

  .logo {
    color: #e94560;
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: default;
    user-select: none;
  }

  .logo:hover {
    transform: scale(1.1);
    text-shadow: 0 0 10px rgba(233, 69, 96, 0.5);
  }

  .tools {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    align-items: center;
  }

  .separator {
    width: 32px;
    height: 1px;
    background-color: #2d2d4e;
    margin: 6px 0;
  }

  button {
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: #a0aec0;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(1);
  }

  button:hover {
    background: #2d2d4e;
    color: #e94560;
    transform: scale(1.05);
  }

  button:active {
    transform: scale(0.95);
  }

  button.active {
    background: #2d2d4e;
    color: #e94560;
    box-shadow: 0 0 0 2px rgba(233, 69, 96, 0.3);
  }
</style>
