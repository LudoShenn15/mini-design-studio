<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let show = false
  export let message = 'Vos modifications seront perdues si vous ne les enregistrez pas.'

  const dispatch = createEventDispatcher()

  function save(): void {
    dispatch('save')
  }
  function discard(): void {
    dispatch('discard')
  }
  function cancel(): void {
    dispatch('cancel')
  }
</script>

{#if show}
  <div class="overlay">
    <div class="dialog">
      <h2>Enregistrer les modifications ?</h2>
      <p>{message}</p>
      <div class="actions">
        <button class="save" on:click={save}>Enregistrer</button>
        <button class="discard" on:click={discard}>Ne pas enregistrer</button>
        <button class="cancel" on:click={cancel}>Annuler</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    background: #12122a;
    border: 1px solid #2d2d4e;
    border-radius: 12px;
    padding: 32px;
    width: 380px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  h2 {
    color: #ffffff;
    font-size: 18px;
    margin: 0;
  }

  p {
    color: #6b7280;
    font-size: 14px;
    margin: 0;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  button {
    padding: 12px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .save {
    background: #e94560;
    color: #ffffff;
    font-weight: bold;
  }

  .save:hover {
    background: #c73652;
  }

  .discard {
    background: #1e1e3a;
    color: #a0aec0;
    border: 1px solid #2d2d4e;
  }

  .discard:hover {
    background: #2d2d4e;
  }

  .cancel {
    background: transparent;
    color: #4a4a6a;
  }

  .cancel:hover {
    color: #6b7280;
  }
</style>
