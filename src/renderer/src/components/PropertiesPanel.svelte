<script lang="ts">
  import { elements, selectedId } from '../store'

  $: selected = $elements.find((e) => e.id === $selectedId) ?? null

  const fontFamilies = [
    'Arial',
    'Georgia',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Trebuchet MS',
    'Impact',
    'Comic Sans MS'
  ]

  function update(field: string, value: string | number | boolean): void {
    if (!selected) return
    elements.update((els) => els.map((e) => (e.id === selected!.id ? { ...e, [field]: value } : e)))
  }

  function toggleBold(): void {
    if (!selected) return
    const current = selected.fontStyle ?? 'normal'
    const isBold = current.includes('bold')
    const isItalic = current.includes('italic')
    update(
      'fontStyle',
      isBold ? (isItalic ? 'italic' : 'normal') : isItalic ? 'bold italic' : 'bold'
    )
  }

  function toggleItalic(): void {
    if (!selected) return
    const current = selected.fontStyle ?? 'normal'
    const isBold = current.includes('bold')
    const isItalic = current.includes('italic')
    update('fontStyle', isItalic ? (isBold ? 'bold' : 'normal') : isBold ? 'bold italic' : 'italic')
  }

  function toggleUnderline(): void {
    if (!selected) return
    update('textDecoration', selected.textDecoration === 'underline' ? '' : 'underline')
  }

  $: isBold = selected?.fontStyle?.includes('bold') ?? false
  $: isItalic = selected?.fontStyle?.includes('italic') ?? false
  $: isUnderline = selected?.textDecoration === 'underline'
</script>

<div class="panel">
  <h3>Propriétés</h3>

  {#if !selected}
    <p class="empty">Sélectionne un élément</p>
  {:else}
    <div class="props">
      <!-- COULEUR -->
      <div class="prop-group">
        <span class="label">Couleur</span>
        <div class="control">
          <input
            type="color"
            value={selected.fill || '#000000'}
            on:input={(e) => update('fill', e.currentTarget.value)}
          />
          <span class="hex">{selected.fill}</span>
        </div>
      </div>

      <!-- BORDURE (pas pour texte) -->
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

      <!-- ARRONDI (rect uniquement) -->
      {#if selected.type === 'rect'}
        <div class="prop-group">
          <span class="label">Arrondi des bords</span>
          <div class="control column">
            <input
              type="range"
              min="0"
              max="200"
              value={selected.cornerRadius ?? 0}
              on:input={(e) => update('cornerRadius', Number(e.currentTarget.value))}
            />
            <span class="val">{selected.cornerRadius ?? 0}px</span>
          </div>
        </div>
      {/if}

      <!-- OPACITÉ -->
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

      <!-- ROTATION -->
      <div class="prop-group">
        <span class="label">Rotation</span>
        <div class="control column">
          <input
            type="range"
            min="-180"
            max="180"
            value={selected.rotation ?? 0}
            on:input={(e) => update('rotation', Number(e.currentTarget.value))}
          />
          <span class="val">{selected.rotation ?? 0}°</span>
        </div>
      </div>

      <!-- POSITION -->
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

      <!-- TEXTE -->
      {#if selected.type === 'text'}
        <div class="separator"></div>

        <div class="prop-group">
          <span class="label">Police</span>
          <select
            value={selected.fontFamily ?? 'Arial'}
            on:change={(e) => update('fontFamily', e.currentTarget.value)}
          >
            {#each fontFamilies as font (font)}
              <option value={font} style="font-family: {font}">{font}</option>
            {/each}
          </select>
        </div>

        <div class="prop-group">
          <span class="label">Taille</span>
          <div class="control">
            <input
              type="number"
              min="6"
              max="200"
              value={selected.fontSize ?? 24}
              on:input={(e) => update('fontSize', Number(e.currentTarget.value))}
            />
            <span class="val">px</span>
          </div>
        </div>

        <div class="prop-group">
          <span class="label">Style</span>
          <div class="control">
            <button class="style-btn" class:active={isBold} on:click={toggleBold} title="Gras"
              ><b>G</b></button
            >
            <button
              class="style-btn"
              class:active={isItalic}
              on:click={toggleItalic}
              title="Italique"><i>I</i></button
            >
            <button
              class="style-btn"
              class:active={isUnderline}
              on:click={toggleUnderline}
              title="Souligné"><u>S</u></button
            >
          </div>
        </div>

        <div class="prop-group">
          <span class="label">Casse</span>
          <div class="control">
            <button
              class="style-btn"
              class:active={selected.textTransform === 'uppercase'}
              on:click={() =>
                update(
                  'textTransform',
                  selected?.textTransform === 'uppercase' ? 'none' : 'uppercase'
                )}
              title="MAJUSCULES">AA</button
            >
            <button
              class="style-btn"
              class:active={selected.textTransform === 'lowercase'}
              on:click={() =>
                update(
                  'textTransform',
                  selected?.textTransform === 'lowercase' ? 'none' : 'lowercase'
                )}
              title="minuscules">aa</button
            >
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
    padding: 12px 0 10px 0;
    z-index: 1;
  }

  .empty {
    color: #4a4a6a;
    font-size: 12px;
  }

  .props {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .separator {
    height: 1px;
    background: #2d2d4e;
    margin: 4px 0;
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
  }

  input[type='range'] {
    width: 100%;
    accent-color: #e94560;
  }

  input[type='number'] {
    width: 100%;
    background: #12122a;
    border: 1px solid #2d2d4e;
    border-radius: 6px;
    color: #a0aec0;
    padding: 6px 10px;
    font-size: 13px;
    outline: none;
    box-sizing: border-box;
  }

  input[type='number']:focus {
    border-color: #e94560;
  }

  select {
    width: 100%;
    background: #12122a;
    border: 1px solid #2d2d4e;
    border-radius: 6px;
    color: #a0aec0;
    padding: 6px 10px;
    font-size: 13px;
    outline: none;
    cursor: pointer;
  }

  select:focus {
    border-color: #e94560;
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

  .style-btn {
    width: 32px;
    height: 32px;
    background: #12122a;
    border: 1px solid #2d2d4e;
    border-radius: 6px;
    color: #a0aec0;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
  }

  .style-btn:hover {
    border-color: #e94560;
    color: #e94560;
  }

  .style-btn.active {
    background: #e94560;
    border-color: #e94560;
    color: #ffffff;
  }
</style>
