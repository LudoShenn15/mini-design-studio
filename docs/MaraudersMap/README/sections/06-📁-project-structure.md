<!-- Section from: d:\projects\mini-design-studio\README.md | Lines: 144-165 -->

## 📁 Project Structure

```
mini-design-studio/
├── src/
│   ├── electron/          # Electron main process
│   └── renderer/          # Svelte frontend
│       └── src/
│           ├── components/ # Svelte components
│           │   ├── Canvas.svelte
│           │   ├── Toolbar.svelte
│           │   ├── LayerPanel.svelte
│           │   ├── PropertiesPanel.svelte
│           │   └── AIDialog.svelte
│           ├── assets/     # CSS and assets
│           ├── App.svelte  # Main app component
│           └── store.ts    # Svelte stores
├── package.json
├── electron.vite.config.ts
└── tsconfig.json
```
