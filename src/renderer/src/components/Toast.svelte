<script lang="ts">
  export let message = ''
  export let type: 'info' | 'success' | 'error' | 'warning' | 'loading' = 'info'
  export let show = false
</script>

{#if show}
  <div class="toast {type}">
    <span class="icon">
      {#if type === 'info'}ℹ️{/if}
      {#if type === 'success'}✅{/if}
      {#if type === 'error'}❌{/if}
      {#if type === 'warning'}⚠️{/if}
      {#if type === 'loading'}<span class="spinner"></span>{/if}
    </span>
    <span class="message">{message}</span>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    z-index: 9999;
    animation: slidein 0.2s ease;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  }

  .info {
    background: #1e1e3a;
    border: 1px solid #2d2d4e;
    color: #a0aec0;
  }

  .success {
    background: #0f2a1a;
    border: 1px solid #22c55e;
    color: #22c55e;
  }

  .error {
    background: #2a0f0f;
    border: 1px solid #e94560;
    color: #e94560;
  }

  .warning {
    background: #2a1f0f;
    border: 1px solid #f59e0b;
    color: #f59e0b;
  }

  .loading {
    background: #1e1e3a;
    border: 1px solid #6b7280;
    color: #a0aec0;
  }

  .message {
    font-size: 13px;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #4a4a6a;
    border-top-color: #e94560;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes slidein {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
</style>
