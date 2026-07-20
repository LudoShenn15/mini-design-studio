<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  function newFile(): void {
    dispatch('new')
  }

  function openFile(): void {
    dispatch('open')
  }
</script>

<div class="splash">
  <div class="content">
    <div class="logo">DS</div>
    <h1>Mini Design Studio</h1>
    <p class="subtitle">Dynadoc Canvas Engineering</p>
    <div class="actions">
      <button class="primary" on:click={newFile}>
        <span>✦</span> Nouveau fichier
      </button>
      <button class="secondary" on:click={openFile}>
        <span>📂</span> Ouvrir un fichier
      </button>
    </div>
    <p class="hint">Propulsé par Svelte · Electron · Konva.js</p>
  </div>
</div>

<style>
  .splash {
    width: 100vw;
    height: 100vh;
    background-color: #1a1a2e;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .logo {
    width: 80px;
    height: 80px;
    border-radius: 20px;
    background: linear-gradient(135deg, #e94560, #1a1a2e);
    border: 2px solid #e94560;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: bold;
    color: #ffffff;
    letter-spacing: 2px;
    margin-bottom: 8px;
    box-shadow: 0 0 40px rgba(233, 69, 96, 0.3);
  }

  h1 {
    font-size: 36px;
    font-weight: bold;
    color: #ffffff;
    margin: 0;
    letter-spacing: 1px;
  }

  .subtitle {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
    width: 280px;
  }

  button {
    width: 100%;
    padding: 14px 24px;
    border-radius: 10px;
    font-size: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border: none;
    transition: all 0.2s;
  }

  .primary {
    background: #e94560;
    color: #ffffff;
    font-weight: bold;
  }

  .primary:hover {
    background: #c73652;
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(233, 69, 96, 0.4);
  }

  .secondary {
    background: #12122a;
    color: #a0aec0;
    border: 1px solid #2d2d4e;
  }

  .secondary:hover {
    background: #1e1e3a;
    color: #ffffff;
    transform: translateY(-1px);
  }

  .hint {
    font-size: 11px;
    color: #4a4a6a;
    margin-top: 24px;
    letter-spacing: 1px;
  }
</style>
