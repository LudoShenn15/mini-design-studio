<script lang="ts">
  import { zoomLevel } from '../store'

  export let onZoomIn: () => void
  export let onZoomOut: () => void
  export let onReset: () => void

  $: percent = Math.round($zoomLevel * 100)

  function handleSlider(e: Event): void {
    const val = Number((e.target as HTMLInputElement).value)
    const scale = val / 100
    onReset()
    // On applique via le parent
    window.dispatchEvent(new CustomEvent('zoom:set', { detail: scale }))
  }
</script>

<div class="zoombar">
  <button title="Zoom arrière (Ctrl+-)" on:click={onZoomOut}>−</button>

  <input
    type="range"
    min="10"
    max="500"
    value={percent}
    on:input={handleSlider}
    title="Zoom"
  />

  <button class="percent" on:click={onReset} title="Réinitialiser le zoom (Ctrl+0)">
    {percent}%
  </button>

  <button title="Zoom avant (Ctrl++)" on:click={onZoomIn}>+</button>
</div>

<style>
  .zoombar {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: #12122a;
    border: 1px solid #2d2d4e;
    border-radius: 20px;
    padding: 6px 14px;
    z-index: 100;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  button {
    background: transparent;
    border: none;
    color: #a0aec0;
    font-size: 16px;
    cursor: pointer;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: color 0.15s;
    padding: 0;
  }

  button:hover {
    color: #e94560;
  }

  .percent {
    font-size: 12px;
    width: 48px;
    color: #6b7280;
    font-family: monospace;
  }

  .percent:hover {
    color: #e94560;
  }

  input[type='range'] {
    width: 100px;
    accent-color: #e94560;
    cursor: pointer;
  }
</style>
