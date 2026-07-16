<script lang="ts">
  import { elements, selectedIds } from '../store'

  function toggleVisibility(id: string): void {
    elements.update((els) => els.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e)))
  }

  function deleteElement(id: string): void {
    elements.update((els) => els.filter((e) => e.id !== id))
    selectedIds.update((ids) => ids.filter((i) => i !== id))
  }

  function moveUp(index: number): void {
    elements.update((els) => {
      if (index === els.length - 1) return els
      const arr = [...els]
      ;[arr[index], arr[index + 1]] = [arr[index + 1], arr[index]]
      return arr
    })
  }

  function moveDown(index: number): void {
    elements.update((els) => {
      if (index === 0) return els
      const arr = [...els]
      ;[arr[index], arr[index - 1]] = [arr[index - 1], arr[index]]
      return arr
    })
  }

  function selectElement(id: string, shift = false, ctrl = false): void {
    if (ctrl) {
      selectedIds.update((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))
    } else if (shift) {
      const allIds = $elements.map((e) => e.id)
      const currentIds = $selectedIds
      if (currentIds.length === 0) {
        selectedIds.set([id])
        return
      }
      const lastId = currentIds[currentIds.length - 1]
      const lastIndex = allIds.indexOf(lastId)
      const currentIndex = allIds.indexOf(id)
      const start = Math.min(lastIndex, currentIndex)
      const end = Math.max(lastIndex, currentIndex)
      const rangeIds = allIds.slice(start, end + 1)
      selectedIds.update((ids) => [...new Set([...ids, ...rangeIds])])
    } else {
      selectedIds.set([id])
    }
  }

  const icons: Record<string, string> = {
    rect: '▭',
    circle: '○',
    text: 'T',
    image: '🖼'
  }
</script>

<div class="panel">
  <h3>Calques</h3>

  {#if $elements.length === 0}
    <p class="empty">Aucun calque</p>
  {:else}
    <ul role="listbox">
      {#each [...$elements].reverse() as el, i (el.id)}
        <li
          role="option"
          aria-selected={$selectedIds.includes(el.id)}
          class:selected={$selectedIds.includes(el.id)}
          on:click={(e) => selectElement(el.id, e.shiftKey, e.ctrlKey)}
          on:keydown={(e) => e.key === 'Enter' && selectElement(el.id)}
        >
          <span class="icon">{icons[el.type]}</span>
          <span class="name">{el.name}</span>
          <div class="actions">
            <button title="Monter" on:click|stopPropagation={() => moveUp($elements.length - 1 - i)}
              >↑</button
            >
            <button
              title="Descendre"
              on:click|stopPropagation={() => moveDown($elements.length - 1 - i)}>↓</button
            >
            <button
              title={el.visible ? 'Masquer' : 'Afficher'}
              on:click|stopPropagation={() => toggleVisibility(el.id)}
              >{el.visible ? '👁' : '🙈'}</button
            >
            <button
              title="Supprimer"
              class="delete"
              on:click|stopPropagation={() => deleteElement(el.id)}>✕</button
            >
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .panel {
    flex: 1;
    padding: 0 16px 16px 16px;
    overflow-y: auto;
  }

  h3 {
    color: #e94560;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0 0 12px 0;
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

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    background: #12122a;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(0);
    border-left: 2px solid transparent;
  }

  li:hover {
    background: #1e1e3a;
    transform: translateX(2px);
  }

  li.selected {
    background: #2d2d4e;
    border-left: 2px solid #e94560;
    transform: translateX(0);
  }

  .icon {
    font-size: 12px;
    color: #e94560;
    width: 16px;
    text-align: center;
  }

  .name {
    flex: 1;
    font-size: 12px;
    color: #a0aec0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .actions {
    display: flex;
    gap: 2px;
  }

  button {
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 11px;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(1);
  }

  button:hover {
    color: #e94560;
    transform: scale(1.1);
    background: rgba(233, 69, 96, 0.1);
  }

  button:active {
    transform: scale(0.95);
  }

  button.delete:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
</style>
