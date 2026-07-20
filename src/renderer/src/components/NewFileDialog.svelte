<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let show = false

  const dispatch = createEventDispatcher()

  type Format = {
    name: string
    width: number
    height: number
  }

  const formats: { category: string; items: Format[] }[] = [
    {
      category: 'ISO',
      items: [
        { name: 'A3 Portrait', width: 1123, height: 1587 },
        { name: 'A3 Paysage', width: 1587, height: 1123 },
        { name: 'A4 Portrait', width: 794, height: 1123 },
        { name: 'A4 Paysage', width: 1123, height: 794 },
        { name: 'A5 Portrait', width: 559, height: 794 },
        { name: 'A5 Paysage', width: 794, height: 559 },
      ],
    },
    {
      category: 'Réseaux sociaux',
      items: [
        { name: 'Post Instagram', width: 1080, height: 1080 },
        { name: 'Story Instagram', width: 1080, height: 1920 },
        { name: 'Bannière Twitter', width: 1500, height: 500 },
        { name: 'Couverture Facebook', width: 851, height: 315 },
        { name: 'Miniature YouTube', width: 1280, height: 720 },
      ],
    },
    {
      category: 'Présentation',
      items: [
        { name: 'Slide 16:9', width: 1280, height: 720 },
        { name: 'Slide 4:3', width: 1024, height: 768 },
      ],
    },
    {
      category: 'Personnalisé',
      items: [],
    },
  ]

  let selectedFormat: Format | null = formats[0].items[2]
  let activeCategory = 'ISO'
  let customWidth = 800
  let customHeight = 600

  function selectFormat(f: Format): void {
    selectedFormat = f
  }

  function confirm(): void {
    const f =
      activeCategory === 'Personnalisé'
        ? { name: 'Personnalisé', width: customWidth, height: customHeight }
        : selectedFormat
    if (!f) return
    dispatch('confirm', f)
    show = false
  }

  function cancel(): void {
    dispatch('cancel')
    show = false
  }
</script>

{#if show}
  <div class="overlay">
    <div class="dialog">
      <h2>Nouveau fichier</h2>

      <div class="categories">
        {#each formats as group}
          <button
            class:active={activeCategory === group.category}
            on:click={() => {
              activeCategory = group.category
              if (group.items.length > 0) selectedFormat = group.items[0]
            }}
          >
            {group.category}
          </button>
        {/each}
      </div>

      <div class="body">
        {#if activeCategory !== 'Personnalisé'}
          <div class="format-list">
            {#each formats.find((g) => g.category === activeCategory)?.items ?? [] as f}
              <button
                class="format-item"
                class:selected={selectedFormat?.name === f.name}
                on:click={() => selectFormat(f)}
              >
                <div
                  class="preview"
                  style="
                    width: {f.width > f.height ? '48px' : '36px'};
                    height: {f.width > f.height ? '32px' : '48px'};
                  "
                ></div>
                <span class="fname">{f.name}</span>
                <span class="fdim">{f.width} × {f.height}</span>
              </button>
            {/each}
          </div>
        {:else}
          <div class="custom">
            <label>
              <span>Largeur (px)</span>
              <input type="number" bind:value={customWidth} min="100" max="5000" />
            </label>
            <label>
              <span>Hauteur (px)</span>
              <input type="number" bind:value={customHeight} min="100" max="5000" />
            </label>
            <div
              class="custom-preview"
              style="
                width: {customWidth > customHeight ? '96px' : `${Math.round(96 * customWidth / customHeight)}px`};
                height: {customWidth > customHeight ? `${Math.round(96 * customHeight / customWidth)}px` : '96px'};
              "
            ></div>
          </div>
        {/if}
      </div>

      <div class="footer">
        {#if selectedFormat && activeCategory !== 'Personnalisé'}
          <span class="selected-info">
            {selectedFormat.name} — {selectedFormat.width} × {selectedFormat.height} px
          </span>
        {/if}
        <div class="buttons">
          <button class="cancel" on:click={cancel}>Annuler</button>
          <button class="confirm" on:click={confirm}>Créer</button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: #12122a;
    border: 1px solid #2d2d4e;
    border-radius: 14px;
    width: 560px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  h2 {
    color: #ffffff;
    font-size: 18px;
    margin: 0;
    padding: 24px 24px 16px 24px;
    border-bottom: 1px solid #2d2d4e;
  }

  .categories {
    display: flex;
    gap: 4px;
    padding: 12px 24px;
    border-bottom: 1px solid #2d2d4e;
    flex-wrap: wrap;
  }

  .categories button {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid #2d2d4e;
    background: transparent;
    color: #6b7280;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .categories button.active {
    background: #e94560;
    border-color: #e94560;
    color: #ffffff;
  }

  .body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px;
  }

  .format-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .format-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 14px 8px;
    border-radius: 10px;
    border: 1px solid #2d2d4e;
    background: #1a1a2e;
    cursor: pointer;
    transition: all 0.15s;
  }

  .format-item:hover {
    border-color: #e94560;
    background: #1e1e3a;
  }

  .format-item.selected {
    border-color: #e94560;
    background: #2d2d4e;
  }

  .preview {
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid #4a4a6a;
  }

  .fname {
    font-size: 12px;
    color: #a0aec0;
    text-align: center;
  }

  .fdim {
    font-size: 10px;
    color: #4a4a6a;
  }

  .custom {
    display: flex;
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .custom label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  .custom label span {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
  }

  .custom input {
    background: #1a1a2e;
    border: 1px solid #2d2d4e;
    border-radius: 6px;
    color: #a0aec0;
    padding: 8px 12px;
    font-size: 14px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }

  .custom input:focus {
    border-color: #e94560;
  }

  .custom-preview {
    background: #ffffff;
    border-radius: 2px;
    border: 1px solid #4a4a6a;
    margin: 0 auto;
  }

  .footer {
    padding: 16px 24px;
    border-top: 1px solid #2d2d4e;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .selected-info {
    font-size: 12px;
    color: #6b7280;
    flex: 1;
  }

  .buttons {
    display: flex;
    gap: 8px;
  }

  .buttons button {
    padding: 10px 20px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .cancel {
    background: #1e1e3a;
    color: #a0aec0;
    border: 1px solid #2d2d4e !important;
  }

  .cancel:hover {
    background: #2d2d4e;
  }

  .confirm {
    background: #e94560;
    color: #ffffff;
    font-weight: bold;
  }

  .confirm:hover {
    background: #c73652;
  }
</style>
