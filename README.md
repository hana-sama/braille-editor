<p align="center">
  <img src="docs/banner.png" alt="6-Dot Braille Editor" width="600" />
</p>

<h1 align="center">6-Dot Braille Editor</h1>

<p align="center">
  A browser-based braille editor that translates keyboard input into braille dot patterns in real time.
  <br />
  Type with your keyboard — see both Unicode braille and print text side by side.
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white" />
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green" />
  <img alt="Tests" src="https://img.shields.io/badge/Tests-33%20passing-brightgreen" />
</p>

---

## ✨ Features

- **Perkins-style keyboard input** — use home-row keys (F/D/S + J/K/L) to form 6-dot braille cells
- **Dual editor view** — braille output and print text displayed side by side
- **UEB Grade 1** — full alphabet, numbers, punctuation, and indicators
- **UEB Grade 2** — contracted braille with 100+ contractions
- **Multi-cell indicators** — capital word/passage, italic, bold, underline, script
- **Multiple keyboard layouts** — Perkins standard, split-alternate, and inverted
- **Copy to clipboard** — one-click copy of braille or print text
- **Accessible** — ARIA live regions, landmark roles, skip navigation, keyboard-navigable
- **No server required** — runs entirely in the browser

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The editor opens at `http://localhost:5173`.

## ⌨️ How to Use

### Typing Braille

Press keys simultaneously to form a braille cell, then press **Space** to confirm:

| Left Hand | Right Hand |
|-----------|------------|
| **F** → dot 1 | **J** → dot 4 |
| **D** → dot 2 | **K** → dot 5 |
| **S** → dot 3 | **L** → dot 6 |

**Example:** Press **F** + **J** (dots 1, 4) → ⠉ → **c**

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Confirm character |
| `Backspace` | Clear current dots / delete last character |
| `Enter` | New line |
| `Escape` | Cancel current input |
| `Ctrl+L` | Cycle keyboard layout |
| `Ctrl+M` | Next braille mode |
| `Ctrl+Shift+M` | Previous braille mode |
| `Alt+C` | Cycle capital mode (off → next → lock) |

### Braille Indicators

| Indicator | Keys | Effect |
|-----------|------|--------|
| ⠼ Number sign | S + J + K + L | Switches to number mode (a→1, b→2, …, j→0) |
| ⠠ Capital sign | L | Next letter uppercase |
| ⠠⠠ Capital word | L, L | All letters uppercase until space |
| ⠠⠠⠠ Capital passage | L, L, L | All letters uppercase until terminator |

## 🏗️ Project Structure

```
braille-editor/
├── index.html                          # Main HTML
├── braille.css                         # Global styles
├── src/
│   ├── main.ts                         # App orchestration & init
│   ├── braille-data.ts                 # Braille lookup tables
│   ├── types.ts                        # Shared TypeScript interfaces
│   ├── core/
│   │   └── EditorState.ts              # Mode-agnostic editor state
│   ├── modes/
│   │   ├── BrailleMode.ts              # Abstract base class
│   │   ├── ModeRegistry.ts             # Singleton mode registry
│   │   └── ueb/
│   │       ├── UEBGrade1Mode.ts        # Uncontracted English braille
│   │       ├── UEBGrade2Mode.ts        # Contracted English braille
│   │       └── data/contractions.ts    # Grade 2 contraction data
│   ├── layout/LayoutManager.ts         # Keyboard layout management
│   ├── display/DisplayUpdater.ts       # Preview & editor rendering
│   ├── input/KeyboardHandler.ts        # Keyboard event handling
│   ├── clipboard/ClipboardManager.ts   # Clipboard & notifications
│   ├── components/
│   │   ├── ModeSidebar.ts              # Mode selection sidebar
│   │   └── mode-sidebar.css
│   └── tests/
│       ├── mode-system.test.ts         # 33 unit tests
│       └── setup.ts                    # Test environment setup
└── plans/
    ├── scalability-plan.md             # Feature roadmap
    └── accessibility-improvements.md   # ARIA improvements plan
```

## 🧪 Scripts

```bash
npm run dev          # Start dev server
npm run build        # Type-check + production build
npm run preview      # Preview production build
npm run typecheck    # TypeScript type-check only
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## 🔌 Adding a New Braille Mode

The mode system is designed for easy extension:

```typescript
import { BrailleMode } from "./modes/BrailleMode";
import { modeRegistry } from "./modes/ModeRegistry";

class MyBrailleMode extends BrailleMode {
  constructor() {
    super({
      name: "My Mode",
      id: "mymode",
      description: "Custom braille mode",
      language: "en"
    });
  }

  codeToText(code, context) {
    // Map braille codes to text characters
  }

  getAlphabet() {
    // Return code → letter mappings
  }
}

// Register and use
modeRegistry.register(new MyBrailleMode());
```

## 📋 Roadmap

- [x] UEB Grade 1 (uncontracted)
- [x] UEB Grade 2 (contracted)
- [x] Multi-cell sequence indicators
- [x] Typeform indicators (italic, bold, underline, script)
- [ ] Japanese Kana braille
- [ ] Nemeth Code (math braille)
- [ ] Undo/redo
- [ ] File import/export (BRF format)
- [ ] Mobile touch input

## 📄 License

MIT © [Hana](https://github.com/hana)
