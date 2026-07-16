<script lang="ts">
  import { elements, selectedId } from '../store'

  $: selected = $elements.find((e) => e.id === $selectedId) ?? null

  function update(field: string, value: string | number): void {
    if (!selected) return
    elements.update((els) => els.map((e) => (e.id === selected!.id ? { ...e, [field]: value } : e)))
  }
</script>

<div class="panel">
  <h3>Propriétés</h3>

  {#if !selected}
    <p class="empty">Sélectionne un élément</p>
  {:else}
    <div class="props">
      <div class="prop-group">
        <span class="label">Couleur</span>
        <div class="control">
          <input
            type="color"
            value={selected.fill}
            on:input={(e) => update('fill', e.currentTarget.value)}
          />
          <span class="hex">{selected.fill}</span>
        </div>
      </div>

      {#if selected.type !== 'text'}
        <div class="prop-group">
          <span class="label">Bordure</span>
          <div class="control">
            <input
              type="color"
              value={selected.stroke || '#000000'}
              on:input={(e) => update('stroke', e.currentTarget.value)}
            />
            <span class="hex">{selected.stroke || '#000000'}</span>
          </div>
        </div>

        <div class="prop-group">
          <span class="label">Épaisseur bordure</span>
          <div class="control column">
            <input
              type="range"
              min="0"
              max="20"
              value={selected.strokeWidth}
              on:input={(e) => update('strokeWidth', Number(e.currentTarget.value))}
            />
            <span class="val">{selected.strokeWidth}px</span>
          </div>
        </div>
      {/if}

      <div class="prop-group">
        <span class="label">Opacité</span>
        <div class="control column">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={selected.opacity}
            on:input={(e) => update('opacity', Number(e.currentTarget.value))}
          />
          <span class="val">{Math.round(selected.opacity * 100)}%</span>
        </div>
      </div>

      <div class="prop-group">
        <span class="label">Position X</span>
        <div class="control">
          <input
            type="number"
            value={Math.round(selected.x)}
            on:input={(e) => update('x', Number(e.currentTarget.value))}
          />
        </div>
      </div>

      <div class="prop-group">
        <span class="label">Position Y</span>
        <div class="control">
          <input
            type="number"
            value={Math.round(selected.y)}
            on:input={(e) => update('y', Number(e.currentTarget.value))}
          />
        </div>
      </div>

      {#if selected.type === 'text'}
        <div class="prop-group">
          <span class="label">Texte</span>
          <div class="control">
            <input
              type="text"
              value={selected.text ?? ''}
              on:input={(e) => update('text', e.currentTarget.value)}
            />
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .panel {
    flex: 1;
    padding: 0 16px 16px 16px;
    border-bottom: 1px solid #2d2d4e;
    overflow-y: auto;
    overflow-x: hidden;
  }

  h3 {
    color: #e94560;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 16px 0;
    position: sticky;
    top: 0;
    background-color: #1a1a2e;
    padding: 16px 0 10px 0;
    z-index: 1;
  }

  .empty {
    color: #4a4a6a;
    font-size: 12px;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .props {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .prop-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-size: 11px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .control {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .control.column {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  input[type='color'] {
    width: 36px;
    height: 28px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    background: none;
    padding: 0;
    flex-shrink: 0;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  input[type='color']:hover {
    transform: scale(1.05);
  }

  input[type='range'] {
    width: 100%;
    accent-color: #e94560;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  input[type='range']:hover {
    opacity: 0.8;
  }

  input[type='number'],
  input[type='text'] {
    width: 100%;
    background: #12122a;
    border: 1px solid #2d2d4e;
    border-radius: 6px;
    color: #a0aec0;
    padding: 6px 10px;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  input[type='number']:focus,
  input[type='text']:focus {
    border-color: #e94560;
    box-shadow: 0 0 0 3px rgba(233, 69, 96, 0.1);
  }

  input[type='number']:hover,
  input[type='text']:hover {
    border-color: #3d3d5e;
  }

  .hex {
    font-size: 11px;
    color: #6b7280;
    font-family: monospace;
  }

  .val {
    font-size: 11px;
    color: #6b7280;
    text-align: right;
  }
</style>
