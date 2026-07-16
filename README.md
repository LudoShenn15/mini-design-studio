# Mini Design Studio

A lightweight desktop visual editor inspired by Canva and Photoshop, built with Svelte, TypeScript, and Electron. Create stunning visuals by composing shapes, text, and images with full layer management, property editing, and export capabilities.

![Mini Design Studio](https://img.shields.io/badge/Version-1.0.0-red) ![License](https://img.shields.io/badge/License-MIT-blue) ![Electron](https://img.shields.io/badge/Electron-Latest-9cf) ![Svelte](https://img.shields.io/badge/Svelte-4.0-orange)

## ✨ Features

### Canvas & Shapes
- **Interactive Canvas** - 800×600 pixel canvas powered by Konva.js
- **Shape Tools** - Rectangle, circle/ellipse, and text creation
- **Image Import** - Import local images (PNG, JPG, etc.)
- **Transformations** - Selection, movement, resize, rotation, and free deformation
- **Smart Selection** - Single click, Ctrl+click for multi-select, Shift+click for range selection

### Layer Management
- **Layer Panel** - Visual layer list with icons
- **Visibility Control** - Show/hide layers
- **Layer Ordering** - Move layers up/down, bring to front/back
- **Layer Selection** - Select directly from the panel
- **Delete Layers** - Remove unwanted elements

### Property Editing
- **Color Controls** - Fill and stroke color pickers
- **Stroke Width** - Adjustable border thickness
- **Opacity** - Transparency control
- **Position** - X/Y coordinate editing
- **Text Editing** - Double-click to edit text inline

### Advanced Features
- **AI Image Generation** - Generate images via Pollinations.ai (free, no API key required)
- **Undo/Redo** - Full history support (Ctrl+Z / Ctrl+Y)
- **Clipboard** - Copy/paste with persistent clipboard support
- **Keyboard Shortcuts** - Efficient workflow with hotkeys

### File Operations
- **New Project** - Start fresh
- **Open/Save** - Save and load `.dsc` project files
- **Export** - Export to PNG, JPG, or PDF
- **Auto-save** - Automatic project saving

### Menu System
- **File Menu** - New, Open, Save, Save As, Exports, Quit
- **Edit Menu** - Undo, Redo, Cut, Copy, Paste, Duplicate, Delete
- **Selection Menu** - Select All, Deselect, Invert Selection
- **Layout Menu** - Layer ordering, alignments, distribution

### UI Polish
- **Dark Theme** - Navy/red color scheme
- **Adaptive Cursors** - Context-aware cursor changes
- **Smooth Animations** - Hover effects and transitions
- **Custom Scrollbars** - Styled scrollbars matching the theme
- **Responsive Panels** - Sticky headers and smooth scrolling

## 🛠 Tech Stack

- **Frontend Framework** - Svelte 4 with TypeScript
- **Desktop Runtime** - Electron
- **Canvas Library** - Konva.js
- **PDF Generation** - jsPDF
- **Build Tool** - Vite with Electron Vite
- **Styling** - CSS with custom properties
- **AI Generation** - Pollinations.ai (free API)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Git (optional, for cloning)

### Install Dependencies

```bash
npm install
```

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

This will start the Electron app in development mode with hot-reload enabled.

### Building for Production

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

The built application will be in the `out/` directory.

## 📖 How to Use

### Creating Shapes
1. Select a tool from the left toolbar (Rectangle, Circle, or Text)
2. Click on the canvas to place the shape
3. Use the transformer handles to resize and rotate

### Importing Images
1. Click the image icon (🖼) in the toolbar
2. Select an image file from your computer
3. The image will be added to the canvas

### AI Image Generation
1. Click the AI button (✨) in the toolbar
2. Enter a description of the image you want
3. Press Enter or click "Générer"
4. The generated image will be added to your canvas

### Editing Properties
1. Select an element on the canvas or from the layer panel
2. Use the Properties panel to adjust colors, opacity, position, etc.
3. Changes are applied in real-time

### Managing Layers
1. Use the Layer panel to view all elements
2. Click the eye icon (👁/🙈) to toggle visibility
3. Use arrow buttons (↑/↓) to reorder layers
4. Click the X button to delete a layer

### Exporting
1. Click the export button (⬇) in the toolbar or use File → Export
2. Choose your preferred format (PNG, JPG, or PDF)
3. The file will be downloaded to your computer

### Keyboard Shortcuts
- `Ctrl+Z` - Undo
- `Ctrl+Y` - Redo
- `Delete` - Delete selected elements
- `Ctrl+Click` - Multi-select
- `Shift+Click` - Range select
- `Escape` - Close dialogs

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Konva.js](https://konvajs.org/) for the canvas library
- [Pollinations.ai](https://pollinations.ai/) for free AI image generation
- [Electron](https://www.electronjs.org/) for desktop app framework
- [Svelte](https://svelte.dev/) for the reactive UI framework

## 📸 Screenshots

*Add screenshots here showing the application interface*

---

Made with ❤️ using Svelte, TypeScript, and Electron
