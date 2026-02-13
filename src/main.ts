/**
 * BRAILLE EDITOR - MAIN ENTRY POINT
 * ==================================
 * Refactored to use TypeScript and the modular mode system.
 *
 * @author Hana
 * @license MIT
 */

import {
  BRAILLE_START,
  DEFAULT_LAYOUT,
  LAYOUTS,
  STORAGE_KEYS
} from "./braille-data";
import { EditorState } from "./core/EditorState";
import { BrailleMode } from "./modes/BrailleMode";
import { modeRegistry } from "./modes/ModeRegistry";
import { UEBGrade1Mode } from "./modes/ueb/UEBGrade1Mode";
import type { DotNumber, Layout, ModeChangeEvent } from "./types";

// ==================== DOM HELPER ====================

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing DOM element: #${id}`);
  return el as T;
}

// ==================== LAYOUT STORAGE ====================

const LayoutStorage = {
  save(layoutKey: string): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.LAYOUT, layoutKey);
      return true;
    } catch (e) {
      console.warn("Failed to save layout preference:", e);
      return false;
    }
  },

  load(defaultLayout: string): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAYOUT);
      if (saved?.trim()) return saved;
    } catch (e) {
      console.warn("Failed to load layout preference:", e);
    }
    return defaultLayout;
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.LAYOUT);
    } catch (e) {
      console.warn("Failed to clear layout preference:", e);
    }
  }
};

// ==================== GLOBALS ====================

let currentLayout: string = DEFAULT_LAYOUT;
let editorState: EditorState | null = null;

// ==================== KEY MAP BUILDER ====================

function buildKeyMap(layout: Layout): Record<string, DotNumber> {
  const map: Record<string, DotNumber> = {};
  [...layout.leftHand, ...layout.rightHand].forEach(({ key, dot }) => {
    map[key.toLowerCase()] = dot;
    map[key.toUpperCase()] = dot;
  });
  return map;
}

let KEY_MAP: Record<string, DotNumber> = LAYOUTS[DEFAULT_LAYOUT]
  ? buildKeyMap(LAYOUTS[DEFAULT_LAYOUT])
  : {};

// ==================== DOM ELEMENTS ====================

const dom = {
  braillePreview: getEl<HTMLSpanElement>("braille-preview"),
  textPreview: getEl<HTMLSpanElement>("text-preview"),
  dotsPreview: getEl<HTMLSpanElement>("dots-preview"),
  brailleEditor: getEl<HTMLDivElement>("braille-editor"),
  textEditor: getEl<HTMLDivElement>("text-editor"),
  brailleCount: getEl<HTMLSpanElement>("braille-count"),
  textCount: getEl<HTMLSpanElement>("text-count"),
  alphabetGrid: getEl<HTMLDivElement>("alphabet-grid"),
  numberGrid: getEl<HTMLDivElement>("number-grid"),
  numberModeIndicator: getEl<HTMLDivElement>("number-mode-indicator"),
  capitalModeIndicator: getEl<HTMLDivElement>("capital-mode-indicator"),
  statusText: getEl<HTMLSpanElement>("status-text"),
  layoutSelector: getEl<HTMLDivElement>("layout-selector"),
  layoutDescription: getEl<HTMLDivElement>("layout-description"),
  keyboardLayout: getEl<HTMLDivElement>("keyboard-layout"),
  toast: getEl<HTMLDivElement>("toast"),
  copyBrailleBtn: getEl<HTMLButtonElement>("btn-copy-braille"),
  copyTextBtn: getEl<HTMLButtonElement>("btn-copy-text"),
  typeformModeIndicator: getEl<HTMLDivElement>("typeform-mode-indicator"),
  modeSelector: getEl<HTMLDivElement>("mode-selector"),
  currentModeDisplay: getEl<HTMLSpanElement>("current-mode-display")
};

// ==================== TOAST NOTIFICATION ====================

function showToast(message: string, duration = 2000): void {
  dom.toast.textContent = message;
  dom.toast.classList.add("show");
  setTimeout(() => dom.toast.classList.remove("show"), duration);
}

// ==================== UTILITY FUNCTIONS ====================

function codeToBraille(code: number): string {
  return String.fromCharCode(BRAILLE_START + code);
}

function codeToDots(code: number): number[] {
  const dots: number[] = [];
  for (let i = 1; i <= 6; i++) {
    if (code & (1 << (i - 1))) dots.push(i);
  }
  return dots;
}

// ==================== MODE MANAGEMENT ====================

function initModes(): void {
  const ueb1Mode = new UEBGrade1Mode();
  modeRegistry.register(ueb1Mode);

  const savedMode = modeRegistry.loadPreference(ueb1Mode.id);
  modeRegistry.setMode(savedMode);

  editorState = new EditorState(modeRegistry.getMode()!);

  modeRegistry.addListener(handleModeChange);
}

function handleModeChange(event: ModeChangeEvent): void {
  if (event.type === "modeChange") {
    editorState!.setMode(modeRegistry.getMode()!);

    updateModeSelector();
    buildAlphabetReference();
    updateEditors();
    updatePreview();

    // Update mode display in status bar
    dom.currentModeDisplay.textContent = event.currentMode.name;

    showToast(`Mode: ${event.currentMode.name}`);
  }
}

function cycleToNextMode(): void {
  modeRegistry.cycleToNext();
}

function initModeSelector(): void {
  const modes = modeRegistry.getModeOptions();
  const currentMode = modeRegistry.getMode();

  dom.modeSelector.innerHTML = modes
    .map(
      mode => `
    <div class="mode-option">
      <input type="radio" id="mode-${mode.id}" name="braille-mode" 
             value="${mode.id}" ${mode.id === currentMode?.id ? "checked" : ""}>
      <label for="mode-${mode.id}">${mode.name}</label>
    </div>
  `
    )
    .join("");

  document
    .querySelectorAll<HTMLInputElement>('input[name="braille-mode"]')
    .forEach(radio => {
      radio.addEventListener("change", () => {
        modeRegistry.setMode(radio.value);
      });
    });
}

function updateModeSelector(): void {
  const currentMode = modeRegistry.getMode();
  const radio = document.getElementById(
    `mode-${currentMode?.id}`
  ) as HTMLInputElement | null;
  if (radio) radio.checked = true;
}

// ==================== TEMPLATE HELPERS ====================

function renderKey(key: string, dot: DotNumber): string {
  return `<div class="key" data-key="${key.toLowerCase()}" data-dot="${dot}" 
    role="button" 
    tabindex="0"
    aria-label="Dot ${dot} - Key ${key.toUpperCase()}"
    aria-pressed="false">
    <span class="key-letter">${key.toUpperCase()}</span>
    <span class="key-dot">${dot}</span>
  </div>`;
}

function renderAlphaItem(
  braille: string,
  text: string,
  dotsStr: string,
  dataAttr: string,
  dataValue: string
): string {
  return `<div class="alpha-item" ${dataAttr}="${dataValue}" role="listitem" aria-label="${text}, dots ${dotsStr}">
    <span class="alpha-braille" aria-hidden="true">${braille}</span>
    <span class="alpha-text">${text}</span>
    <span class="alpha-dots">${dotsStr}</span>
  </div>`;
}

// ==================== LAYOUT MANAGEMENT ====================

function initLayoutSelector(): void {
  dom.layoutSelector.innerHTML = Object.entries(LAYOUTS)
    .map(
      ([key, layout]) => `
    <div class="layout-option">
      <input type="radio" id="layout-${key}" name="layout" value="${key}" ${key === currentLayout ? "checked" : ""} aria-describedby="layout-description">
      <label for="layout-${key}">${layout.name}</label>
    </div>
  `
    )
    .join("");

  document
    .querySelectorAll<HTMLInputElement>('input[name="layout"]')
    .forEach(radio => {
      radio.addEventListener("change", () => setLayout(radio.value));
    });

  updateLayoutDescription();
}

function setLayout(layoutKey: string): void {
  if (!LAYOUTS[layoutKey]) {
    console.error(`Unknown layout: ${layoutKey}`);
    return;
  }

  currentLayout = layoutKey;
  const layout = LAYOUTS[layoutKey];

  KEY_MAP = buildKeyMap(layout);

  updateLayoutDescription();
  rebuildKeyboardVisual();
  resetDotsUI();
  updateInstructions();
  LayoutStorage.save(layoutKey);

  const radio = document.getElementById(
    `layout-${layoutKey}`
  ) as HTMLInputElement | null;
  if (radio) radio.checked = true;
}

function cycleToNextLayout(): void {
  const layouts = Object.keys(LAYOUTS);
  const nextLayout =
    layouts[(layouts.indexOf(currentLayout) + 1) % layouts.length];
  setLayout(nextLayout);
  showToast(`Layout: ${LAYOUTS[nextLayout].name}`);
}

function updateLayoutDescription(): void {
  dom.layoutDescription.textContent = LAYOUTS[currentLayout].description;
}

function rebuildKeyboardVisual(): void {
  const layout = LAYOUTS[currentLayout];
  const leftHTML = layout.leftHand
    .map(({ key, dot }) => renderKey(key, dot))
    .join("");
  const rightHTML = layout.rightHand
    .map(({ key, dot }) => renderKey(key, dot))
    .join("");

  dom.keyboardLayout.innerHTML = `
    <div class="hand">${leftHTML}</div>
    <div class="hand">${rightHTML}</div>
  `;
  attachKeyListeners();
}

function attachKeyListeners(): void {
  document.querySelectorAll<HTMLElement>(".key").forEach(keyEl => {
    keyEl.addEventListener("mousedown", e => {
      e.preventDefault();
      editorState!.addDot(parseInt(keyEl.dataset.dot!) as DotNumber);
      keyEl.classList.add("active");
      keyEl.setAttribute("aria-pressed", "true");
      updatePreview();
    });
    keyEl.addEventListener("mouseup", () => {
      keyEl.classList.remove("active");
      keyEl.setAttribute("aria-pressed", "false");
    });
    keyEl.addEventListener("mouseleave", () => {
      keyEl.classList.remove("active");
      keyEl.setAttribute("aria-pressed", "false");
    });
    keyEl.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        editorState!.addDot(parseInt(keyEl.dataset.dot!) as DotNumber);
        keyEl.classList.add("active");
        keyEl.setAttribute("aria-pressed", "true");
        updatePreview();
      }
    });
    keyEl.addEventListener("keyup", e => {
      if (e.key === "Enter" || e.key === " ") {
        keyEl.classList.remove("active");
        keyEl.setAttribute("aria-pressed", "false");
      }
    });
  });
}

function updateInstructions(): void {
  const layout = LAYOUTS[currentLayout];
  const el = document.querySelector(".instructions p:first-child");
  if (!el) return;
  const leftKeys = layout.leftHand
    .map(k => `<kbd>${k.key.toUpperCase()}</kbd>`)
    .join("");
  const rightKeys = layout.rightHand
    .map(k => `<kbd>${k.key.toUpperCase()}</kbd>`)
    .join("");
  el.innerHTML = `Hold ${leftKeys} + ${rightKeys} to form dots.`;
}

// ==================== DISPLAY FUNCTIONS ====================

function updatePreview(): void {
  const mode = modeRegistry.getMode() as BrailleMode;

  if (!editorState!.hasActiveDots()) {
    if (editorState!.isPendingIndicator()) {
      const pendingCode = editorState!.getPendingIndicator()!;
      dom.braillePreview.textContent = codeToBraille(pendingCode);
      dom.textPreview.textContent = "pending…";
      dom.dotsPreview.textContent = codeToDots(pendingCode).join("-");
      dom.braillePreview.classList.add("has-input");
    } else {
      dom.braillePreview.textContent = "\u2800";
      dom.textPreview.textContent = "-";
      dom.dotsPreview.textContent = "-";
    }
    clearAlphabetHighlight();
    return;
  }

  const code = editorState!.getCurrentCode();
  const braille = editorState!.getCurrentBraille();
  const context = editorState!.getContext();
  let text = mode.codeToText(code, context);
  const dots = editorState!.getDotsArray().join("-");

  // Show what the sequence would resolve to if pending
  if (editorState!.isPendingIndicator()) {
    const result = mode.resolveSequence(
      editorState!.getPendingIndicator()!,
      code,
      context
    );
    if (result) {
      text = `${result.text} (${result.name.toLowerCase().replace(/_/g, " ")})`;
    }
  }

  // Apply capitalization preview
  const capitalMode = editorState!.getCapitalMode();
  if (capitalMode > 0 && mode.isLetter(code)) {
    text = text.toUpperCase();
  }

  dom.braillePreview.textContent = braille;
  dom.textPreview.textContent = text;
  dom.dotsPreview.textContent = dots;
  dom.braillePreview.classList.toggle(
    "has-input",
    editorState!.hasActiveDots()
  );

  // Highlight in reference
  if (editorState!.isInNumberMode() && mode.isLetterAtoJ(code)) {
    highlightNumber(code);
  } else {
    highlightAlphabet(code);
  }
}

function updateEditors(): void {
  dom.brailleEditor.innerHTML =
    editorState!.brailleContent + '<span class="cursor"></span>';
  dom.textEditor.innerHTML =
    editorState!.textContent + '<span class="cursor"></span>';
  dom.brailleCount.textContent = `${editorState!.length} chars`;
  dom.textCount.textContent = `${editorState!.textLength} chars`;
  dom.textEditor.scrollTop = dom.brailleEditor.scrollTop;
  dom.numberModeIndicator.classList.toggle(
    "active",
    editorState!.isInNumberMode()
  );

  // Status text
  if (editorState!.isPendingIndicator()) {
    dom.statusText.textContent =
      "Pending: " + codeToBraille(editorState!.getPendingIndicator()!) + " …";
  } else {
    const typeform = editorState!.getTypeformMode();
    if (typeform) {
      dom.statusText.textContent =
        typeform.mode.charAt(0).toUpperCase() +
        typeform.mode.slice(1) +
        " (" +
        typeform.scope +
        ")";
    } else if (editorState!.isInNumberMode()) {
      dom.statusText.textContent = "Number Mode Active";
    } else {
      dom.statusText.textContent = "Ready";
    }
  }

  updateCapitalModeIndicator();
  updateTypeformIndicator();
}

function updateKeyVisual(key: string, active: boolean): void {
  const el = document.querySelector<HTMLElement>(
    `.key[data-key="${key.toLowerCase()}"]`
  );
  if (el) {
    el.classList.toggle("active", active);
    el.setAttribute("aria-pressed", active ? "true" : "false");
  }
}

// ==================== ALPHABET / NUMBER REFERENCE ====================

function buildAlphabetReference(): void {
  const mode = modeRegistry.getMode() as BrailleMode;
  const alphabet = mode.getAlphabet();

  dom.alphabetGrid.innerHTML = Object.entries(alphabet)
    .map(([code, letter]) => {
      return renderAlphaItem(
        codeToBraille(parseInt(code)),
        letter,
        codeToDots(parseInt(code)).join(""),
        "data-code",
        code
      );
    })
    .join("");

  const numberMap = mode.getNumberMap();
  dom.numberGrid.innerHTML = Object.entries(numberMap)
    .map(([code, num]) => {
      return renderAlphaItem(
        codeToBraille(parseInt(code)),
        num,
        codeToDots(parseInt(code)).join(""),
        "data-number-code",
        code
      );
    })
    .join("");
}

function highlightAlphabet(code: number): void {
  clearAlphabetHighlight();
  const item = document.querySelector<HTMLElement>(
    `.alpha-item[data-code="${code}"]`
  );
  if (item) item.classList.add("highlight");
}

function highlightNumber(code: number): void {
  clearAlphabetHighlight();
  const item = document.querySelector<HTMLElement>(
    `.alpha-item[data-number-code="${code}"]`
  );
  if (item) item.classList.add("highlight");
}

function clearAlphabetHighlight(): void {
  document
    .querySelectorAll<HTMLElement>(".alpha-item.highlight")
    .forEach(el => el.classList.remove("highlight"));
}

// ==================== CAPITAL MODE INDICATOR ====================

function updateCapitalModeIndicator(): void {
  const indicator = dom.capitalModeIndicator;
  const capitalMode = editorState!.getCapitalMode();
  const label = indicator.querySelector("span:last-child");

  if (capitalMode === 1) {
    if (label) label.textContent = "Capital (next)";
    indicator.classList.remove("caps-lock");
    indicator.style.display = "flex";
  } else if (capitalMode === 2) {
    if (label) label.textContent = "CAPS LOCK";
    indicator.classList.add("caps-lock");
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// ==================== TYPEFORM MODE INDICATOR ====================

function updateTypeformIndicator(): void {
  const indicator = dom.typeformModeIndicator;

  const typeform = editorState!.getTypeformMode();
  if (typeform) {
    const icons: Record<string, string> = {
      italic: "𝑰",
      bold: "𝐁",
      underline: "U̲",
      script: "𝒮"
    };
    const icon = icons[typeform.mode] ?? "✦";
    const label =
      typeform.mode.charAt(0).toUpperCase() +
      typeform.mode.slice(1) +
      " (" +
      typeform.scope +
      ")";

    const firstSpan = indicator.querySelector("span:first-child");
    const lastSpan = indicator.querySelector("span:last-child");
    if (firstSpan) firstSpan.textContent = icon;
    if (lastSpan) lastSpan.textContent = label;
    indicator.className = "typeform-indicator typeform-" + typeform.mode;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// ==================== INPUT ACTIONS ====================

function confirmChar(): void {
  editorState!.confirmChar();
  updateEditors();
}

function deleteLastChar(): void {
  editorState!.deleteLastChar();
  updateEditors();
}

function addNewline(): void {
  editorState!.addNewline();
  updateEditors();
}

function clearEditor(): void {
  editorState!.clearAll();
  resetDotsUI();
  updateEditors();
}

function resetDotsUI(): void {
  editorState!.resetDots();
  document
    .querySelectorAll<HTMLElement>(".key")
    .forEach(k => k.classList.remove("active"));
  updatePreview();
}

async function copyToClipboard(type: "braille" | "text"): Promise<void> {
  const text =
    type === "braille" ? editorState!.brailleContent : editorState!.textContent;
  const btn = type === "braille" ? dom.copyBrailleBtn : dom.copyTextBtn;

  try {
    await navigator.clipboard.writeText(text);

    const original = btn.textContent;
    btn.textContent = "✓ Copied!";
    btn.style.background = "#4caf50";
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = "";
    }, 1500);
  } catch (err) {
    console.error("Copy failed:", err);
  }
}

// ==================== EVENT HANDLERS ====================

function handleBrailleDotKey(key: string): void {
  const dot = KEY_MAP[key];
  if (!editorState!.hasDot(dot)) {
    editorState!.addDot(dot);
    updateKeyVisual(key, true);
    updatePreview();
  }
}

const KEY_ACTIONS: Record<string, () => void> = {
  Space: () => confirmChar(),
  Backspace: () =>
    editorState!.hasActiveDots() ? resetDotsUI() : deleteLastChar(),
  Delete: () => deleteLastChar(),
  Escape: () => resetDotsUI(),
  Enter: () => addNewline()
};

document.addEventListener("keydown", (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();

  // Braille dot input
  if (key in KEY_MAP) {
    e.preventDefault();
    handleBrailleDotKey(key);
    return;
  }

  // Ctrl+L = cycle layout
  if (key === "l" && e.ctrlKey) {
    e.preventDefault();
    cycleToNextLayout();
    return;
  }

  // Ctrl+M or Alt+M = cycle mode
  if (key === "m" && (e.ctrlKey || e.altKey)) {
    e.preventDefault();
    cycleToNextMode();
    return;
  }

  // Alt+C or CapsLock = cycle capital mode
  if ((e.key === "c" && e.altKey) || e.key === "CapsLock") {
    e.preventDefault();
    editorState!.cycleCapitalMode();
    updateCapitalModeIndicator();
    return;
  }

  // Mapped action keys
  const action = KEY_ACTIONS[e.code] || KEY_ACTIONS[e.key];
  if (action) {
    e.preventDefault();
    action();
  }
});

document.addEventListener("keyup", (e: KeyboardEvent) => {
  const key = e.key.toLowerCase();
  if (key in KEY_MAP) updateKeyVisual(key, false);
});

// Sync scroll between editors
dom.brailleEditor.addEventListener("scroll", () => {
  dom.textEditor.scrollTop = dom.brailleEditor.scrollTop;
});
dom.textEditor.addEventListener("scroll", () => {
  dom.brailleEditor.scrollTop = dom.textEditor.scrollTop;
});

// Wire up button click handlers (replacing inline onclick attributes)
document
  .querySelector('[data-action="confirm"]')
  ?.addEventListener("click", confirmChar);
document
  .querySelector('[data-action="delete"]')
  ?.addEventListener("click", deleteLastChar);
document
  .querySelector('[data-action="copy-braille"]')
  ?.addEventListener("click", () => copyToClipboard("braille"));
document
  .querySelector('[data-action="copy-text"]')
  ?.addEventListener("click", () => copyToClipboard("text"));
document
  .querySelector('[data-action="clear"]')
  ?.addEventListener("click", clearEditor);

// ==================== INITIALIZATION ====================

function init(): void {
  try {
    initModes();
  } catch (e) {
    console.error("Failed to initialize mode system:", e);
    return;
  }

  try {
    initLayoutSelector();
  } catch (e) {
    console.error("Failed to initialize layout selector:", e);
  }

  try {
    initModeSelector();
  } catch (e) {
    console.error("Failed to initialize mode selector:", e);
  }

  try {
    setLayout(LayoutStorage.load(DEFAULT_LAYOUT));
  } catch (e) {
    console.error("Failed to set layout from storage, using default:", e);
    if (LAYOUTS[DEFAULT_LAYOUT]) {
      KEY_MAP = buildKeyMap(LAYOUTS[DEFAULT_LAYOUT]);
    }
  }

  try {
    buildAlphabetReference();
  } catch (e) {
    console.error("Failed to build alphabet reference:", e);
  }

  try {
    updateEditors();
  } catch (e) {
    console.error("Failed to update editors:", e);
  }

  try {
    updatePreview();
  } catch (e) {
    console.error("Failed to update preview:", e);
  }

  // Initial mode display update
  const currentMode = modeRegistry.getMode();
  if (currentMode) {
    dom.currentModeDisplay.textContent = currentMode.name;
  }

  console.log("Braille editor initialized successfully");
}

init();
