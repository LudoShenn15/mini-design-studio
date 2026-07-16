<script lang="ts">
  import { elements } from '../store'

  export let isOpen = false
  export let onImageGenerated: (src: string) => void

  let prompt = ''
  let isGenerating = false
  let error = ''

  async function generateImage(): Promise<void> {
    if (!prompt.trim()) {
      error = 'Veuillez entrer une description'
      return
    }

    isGenerating = true
    error = ''

    try {
      // Pollinations.ai - free AI image generation without API key
      const encodedPrompt = encodeURIComponent(prompt.trim())
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true`

      // Preload the image to ensure it's ready
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = imageUrl
      })

      // Convert to base64 to avoid CORS issues
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Failed to get canvas context')
      ctx.drawImage(img, 0, 0)
      const base64 = canvas.toDataURL('image/png')

      onImageGenerated(base64)
      isOpen = false
      prompt = ''
    } catch (err) {
      error = 'Erreur lors de la génération. Veuillez réessayer.'
      console.error('AI generation error:', err)
    } finally {
      isGenerating = false
    }
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      isOpen = false
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      generateImage()
    }
  }
</script>

{#if isOpen}
  <div class="overlay" on:click={() => isOpen = false}>
    <div class="dialog" on:click|stopPropagation>
      <h2>Générer avec IA</h2>
      <p class="subtitle">Décrivez l'image que vous souhaitez créer</p>
      
      <textarea
        bind:value={prompt}
        placeholder="Ex: Un paysage futuriste avec des néons..."
        on:keydown={handleKeydown}
        disabled={isGenerating}
      ></textarea>
      
      {#if error}
        <p class="error">{error}</p>
      {/if}
      
      <div class="actions">
        <button class="cancel" on:click={() => isOpen = false} disabled={isGenerating}>
          Annuler
        </button>
        <button class="generate" on:click={generateImage} disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? 'Génération...' : 'Générer ✨'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .dialog {
    background: #1a1a2e;
    border: 1px solid #2d2d4e;
    border-radius: 12px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h2 {
    color: #e94560;
    font-size: 20px;
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  .subtitle {
    color: #6b7280;
    font-size: 13px;
    margin: 0 0 20px 0;
  }

  textarea {
    width: 100%;
    min-height: 120px;
    background: #12122a;
    border: 1px solid #2d2d4e;
    border-radius: 8px;
    color: #a0aec0;
    padding: 12px;
    font-size: 14px;
    resize: vertical;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    font-family: inherit;
  }

  textarea:focus {
    border-color: #e94560;
    box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.1);
  }

  textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error {
    color: #ef4444;
    font-size: 12px;
    margin: 12px 0 0 0;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 20px;
    justify-content: flex-end;
  }

  button {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: none;
  }

  .cancel {
    background: #2d2d4e;
    color: #a0aec0;
  }

  .cancel:hover:not(:disabled) {
    background: #3d3d5e;
    color: #ffffff;
  }

  .generate {
    background: #e94560;
    color: #ffffff;
  }

  .generate:hover:not(:disabled) {
    background: #ff5773;
    transform: scale(1.02);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
</style>
