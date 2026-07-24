# Mini Design Studio

![Version](https://img.shields.io/badge/Version-1.0.0-red) ![License](https://img.shields.io/badge/Licence-MIT-blue) ![Electron](https://img.shields.io/badge/Electron-39-9cf) ![Svelte](https://img.shields.io/badge/Svelte-5-orange) ![Konva](https://img.shields.io/badge/Konva.js-Canvas-green)

---

## 🇫🇷 Français

Un éditeur visuel desktop léger inspiré de Canva et Photoshop, développé avec Svelte, TypeScript et Electron dans le cadre du projet **Dynadoc Canvas Engineering** chez [Dashmake](https://dashmake.com/). Composez des visuels à partir de formes, textes et images avec une gestion complète des calques, des propriétés et des exports.

### ✨ Fonctionnalités

#### Canvas & Formes
- **Canvas interactif** — taille personnalisable selon le format choisi (A3, A4, A5, réseaux sociaux, personnalisé…)
- **Outils de dessin** — Rectangle, Cercle/Ellipse (déformable), Texte
- **Import d'image** — PNG, JPG et autres formats courants
- **Transformations** — Sélection, déplacement, redimensionnement, rotation, déformation libre
- **Sélection intelligente** — Clic simple, Ctrl+Clic (multi-sélection), Shift+Clic (sélection par plage), dessin d'un rectangle de sélection
- **Déplacement au clavier** — Touches directionnelles (1px), Shift+flèche (10px)

#### Gestion des calques
- **Panneau calques** — Liste visuelle de tous les éléments
- **Visibilité** — Afficher/masquer chaque calque
- **Ordre** — Monter/descendre, premier plan/arrière-plan
- **Sélection depuis le panneau** — Clic sur le calque pour sélectionner l'élément
- **Suppression** — Via le panneau, la touche Delete ou le menu Édition

#### Propriétés des éléments
- **Couleur** — Remplissage et bordure avec color picker
- **Épaisseur de bordure** — Slider de 0 à 20px
- **Opacité** — De 0 à 100%
- **Position** — X et Y modifiables
- **Rotation** — Slider de -180° à 180° ou via le transformer
- **Arrondi des bords** — Pour les rectangles (0 à 200px)
- **Texte** — Police, taille, gras, italique, souligné, majuscules/minuscules

#### Fonctionnalités avancées
- **Undo/Redo** — Historique complet (Ctrl+Z / Ctrl+Y)
- **Presse-papier persistant** — Couper, Copier, Coller entre sessions (Ctrl+X / Ctrl+C / Ctrl+V)
- **Duplication** — Ctrl+D
- **Zoom** — Ctrl+Molette, Ctrl++ / Ctrl+- / Ctrl+0, barre de zoom en bas du canvas
- **Génération IA** — Bientôt disponible ✨

#### Fichiers & Exports
- **Nouveau fichier** — Choix du format de papier (ISO, réseaux sociaux, personnalisé)
- **Ouvrir/Enregistrer** — Fichiers `.dsc` (format natif JSON)
- **Enregistrer sous** — Ctrl+Shift+S
- **Export PNG** — Ctrl+E
- **Export JPG**
- **Export PDF**
- **Sauvegarde avec feedback** — Spinner + toast de confirmation
- **Protection contre la perte de données** — Demande d'enregistrement avant fermeture ou nouveau fichier

#### Menu complet (style Photoshop)
- **Fichier** — Nouveau, Ouvrir, Enregistrer, Enregistrer sous, Exports, Quitter
- **Édition** — Annuler, Rétablir, Couper, Copier, Coller, Dupliquer, Supprimer
- **Sélection** — Tout sélectionner, Désélectionner, Inverser la sélection
- **Disposition** — Premier plan, Avancer, Reculer, Arrière-plan, Alignements (gauche, centre, droite, haut, milieu, bas), Distribution (horizontale, verticale)

### 🛠 Stack technique

| Technologie | Rôle |
|---|---|
| **Svelte 5 + TypeScript** | Framework frontend réactif |
| **Electron 39** | Application desktop cross-platform |
| **Konva.js** | Moteur canvas 2D interactif |
| **Vite + electron-vite** | Build tool |
| **jsPDF** | Export PDF |
| **Tailwind CSS + UnoCSS** | Styles utilitaires |

### 📦 Installation

**Prérequis** : Node.js 18+ et npm

```bash
# Cloner le dépôt
git clone https://github.com/LudoShenn15/mini-design-studio.git
cd mini-design-studio

# Installer les dépendances
npm install
```

### 🚀 Lancement

```bash
# Mode développement
npm run dev

# Build Windows
npm run build:win

# Build macOS
npm run build:mac

# Build Linux
npm run build:linux
```

### ⌨️ Raccourcis clavier

| Raccourci | Action |
|---|---|
| `Ctrl+N` | Nouveau fichier |
| `Ctrl+O` | Ouvrir |
| `Ctrl+S` | Enregistrer |
| `Ctrl+Shift+S` | Enregistrer sous |
| `Ctrl+E` | Exporter en PNG |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Rétablir |
| `Ctrl+C` | Copier |
| `Ctrl+X` | Couper |
| `Ctrl+V` | Coller |
| `Ctrl+D` | Dupliquer |
| `Ctrl+A` | Tout sélectionner |
| `Delete` | Supprimer la sélection |
| `Ctrl+Click` | Ajouter à la sélection |
| `Shift+Click` | Sélection par plage |
| `Flèches` | Déplacer (1px) |
| `Shift+Flèches` | Déplacer (10px) |
| `Ctrl++/-` | Zoom avant/arrière |
| `Ctrl+0` | Réinitialiser le zoom |
| `Double clic` | Éditer un texte |
| `Échap` | Fermer les dialogues |

### 📁 Structure du projet

```
mini-design-studio/
├── electron/
│   ├── main.ts          # Processus principal Electron (menu, IPC, fichiers)
│   └── preload/
│       └── index.ts     # Pont IPC renderer ↔ main
├── src/renderer/src/
│   ├── components/
│   │   ├── Canvas.svelte          # Canvas Konva + toute la logique
│   │   ├── Toolbar.svelte         # Barre d'outils gauche
│   │   ├── LayerPanel.svelte      # Panneau calques
│   │   ├── PropertiesPanel.svelte # Panneau propriétés
│   │   ├── SplashScreen.svelte    # Écran de démarrage
│   │   ├── NewFileDialog.svelte   # Choix du format
│   │   ├── SaveDialog.svelte      # Dialogue enregistrement
│   │   ├── ZoomBar.svelte         # Barre de zoom
│   │   └── Toast.svelte           # Notifications
│   ├── App.svelte       # Composant racine
│   └── store.ts         # Stores Svelte (éléments, format, zoom, toast…)
├── package.json
└── electron.vite.config.ts
```
# 🎥 Demonstration

[![Voir la démo](https://img.shields.io/badge/▶_Voir_la_démo-e94560?style=for-the-badge)](https://drive.google.com/file/d/1_vJ0dULJGZzCSYf4IEvHU6HN8AUSihe_/view?usp=drive_link)

### 👨‍💻 Auteur

**Komi Ludovic AGBO** — Creative Technologist · Développeur Frontend · Graphiste Freelance
- GitHub : [@LudoShenn15](https://github.com/LudoShenn15)
- Email : sherfeldstr@gmail.com

### 📝 Licence

Ce projet est sous licence MIT.

---

## 🇬🇧 English

A lightweight desktop visual editor inspired by Canva and Photoshop, built with Svelte, TypeScript and Electron as part of the **Dynadoc Canvas Engineering** project at [Dashmake](https://dashmake.com/). Compose visuals using shapes, text, and images with full layer management, property editing, and export capabilities.

### ✨ Features

#### Canvas & Shapes
- **Interactive canvas** — customizable size based on chosen format (A3, A4, A5, social media, custom…)
- **Drawing tools** — Rectangle, Circle/Ellipse (deformable), Text
- **Image import** — PNG, JPG and other common formats
- **Transformations** — Selection, movement, resize, rotation, free deformation
- **Smart selection** — Single click, Ctrl+click (multi-select), Shift+click (range select), rectangle selection drawing
- **Keyboard movement** — Arrow keys (1px), Shift+arrow (10px)

#### Layer Management
- Full layer panel with visibility, ordering, selection and deletion

#### Property Editing
- Fill & stroke color, opacity, position, rotation, corner radius (rect), font family, size, bold/italic/underline, text transform

#### Advanced Features
- **Undo/Redo** — Full history (Ctrl+Z / Ctrl+Y)
- **Persistent clipboard** — Cut, Copy, Paste across sessions
- **Zoom** — Ctrl+Wheel, Ctrl++ / Ctrl+- / Ctrl+0, zoom bar
- **AI Generation** — Coming soon ✨

#### Files & Exports
- New file with paper format selection, Open/Save `.dsc` files, Export PNG/JPG/PDF
- Save feedback with spinner + toast notification
- Data protection — prompt to save before closing or creating new file

#### Full Menu (Photoshop-style)
- File, Edit, Selection, Layout menus with full keyboard shortcuts

### 🛠 Tech Stack

Svelte 5 · TypeScript · Electron 39 · Konva.js · Vite · jsPDF · UnoCSS

### 📦 Installation

```bash
git clone https://github.com/LudoShenn15/mini-design-studio.git
cd mini-design-studio
npm install
npm run dev
```
## 🎥 Demonstration

[![Voir la démo](https://img.shields.io/badge/▶_Voir_la_démo-e94560?style=for-the-badge)](https://drive.google.com/file/d/1_vJ0dULJGZzCSYf4IEvHU6HN8AUSihe_/view?usp=drive_link)

### 👨‍💻 Author

**Komi Ludovic AGBO** — Creative Technologist · Frontend Developer · Freelance Graphic Designer
- GitHub : [@LudoShenn15](https://github.com/LudoShenn15)

### 📝 License

MIT License

---

*Developed using Svelte, TypeScript and Electron*