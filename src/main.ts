/**
 * BRAILLE EDITOR - MAIN ENTRY POINT
 * ==================================
 * Orchestrates mode management, initialization, and wiring.
 * Display, layout, keyboard, and clipboard logic are in separate modules.
 *
 * @author Hana
 * @license MIT
 */

import { LAYOUTS, DEFAULT_LAYOUT } from "./braille-data";
import { EditorState } from "./core/EditorState";
import { modeRegistry } from "./modes/ModeRegistry";
import { UEBGrade1Mode } from "./modes/ueb/UEBGrade1Mode";
import { UEBGrade2Mode } from "./modes/ueb/UEBGrade2Mode";
import { ModeSidebar } from "./components/ModeSidebar";
import { LayoutManager } from "./layout/LayoutManager";
import { DisplayUpdater } from "./display/DisplayUpdater";
import { KeyboardHandler } from "./input/KeyboardHandler";
import { ClipboardManager } from "./clipboard/ClipboardManager";
import type { ModeChangeEvent } from "./types";

// ==================== DOM HELPER ====================

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing DOM element: #${id}`);
  return el as T;
}

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

// ==================== MODULE INSTANCES ====================

const clipboard = new ClipboardManager(dom.toast);

const display = new DisplayUpdater({
  braillePreview: dom.braillePreview,
  textPreview: dom.textPreview,
  dotsPreview: dom.dotsPreview,
  brailleEditor: dom.brailleEditor,
  textEditor: dom.textEditor,
  brailleCount: dom.brailleCount,
  textCount: dom.textCount,
  alphabetGrid: dom.alphabetGrid,
  numberGrid: dom.numberGrid,
  numberModeIndicator: dom.numberModeIndicator,
  capitalModeIndicator: dom.capitalModeIndicator,
  typeformModeIndicator: dom.typeformModeIndicator,
  statusText: dom.statusText
});

let editorState: EditorState | null = null;

const layout = new LayoutManager(
  {
    layoutSelector: dom.layoutSelector,
    layoutDescription: dom.layoutDescription,
    keyboardLayout: dom.keyboardLayout
  },
  {
    onDotInput: (dot) => {
      editorState!.addDot(dot);
      display.updatePreview(editorState!);
    },
    onToast: (msg) => clipboard.showToast(msg)
  }
);

// ==================== MODE MANAGEMENT ====================

function initModes(): void {
  modeRegistry.registerCategory({
    id: "ueb",
    name: "Unified English Braille",
    description: "UEB modes for English text"
  });

  const ueb1Mode = new UEBGrade1Mode();
  modeRegistry.registerModeWithCategory(ueb1Mode, "ueb");

  const ueb2Mode = new UEBGrade2Mode();
  modeRegistry.registerModeWithCategory(ueb2Mode, "ueb");

  const savedMode = modeRegistry.loadPreference(ueb1Mode.id);
  modeRegistry.setMode(savedMode);

  editorState = new EditorState(modeRegistry.getMode()!);

  modeRegistry.addListener(handleModeChange);
}

function initModeSidebar(): void {
  try {
    const container = document.getElementById("mode-sidebar-container");
    if (container) {
      new ModeSidebar({
        containerId: "mode-sidebar-container",
        collapsed: false,
        onModeSelect: (mode) => {
          console.log(`[Main] Mode selected: ${mode.name}`);
        }
      });
    }
  } catch (e) {
    console.warn("Failed to initialize mode sidebar:", e);
  }
}

function handleModeChange(event: ModeChangeEvent): void {
  if (event.type === "modeChange") {
    editorState!.setMode(modeRegistry.getMode()!);

    updateModeSelector();
    display.buildAlphabetReference();
    display.updateEditors(editorState!);
    display.updatePreview(editorState!);

    dom.currentModeDisplay.textContent = event.currentMode.name;
    clipboard.showToast(`Mode: ${event.currentMode.name}`);
  }
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

// ==================== INPUT ACTIONS ====================

function confirmChar(): void {
  editorState!.confirmChar();
  display.updateEditors(editorState!);
}

function deleteLastChar(): void {
  editorState!.deleteLastChar();
  display.updateEditors(editorState!);
}

function addNewline(): void {
  editorState!.addNewline();
  display.updateEditors(editorState!);
}

function clearEditor(): void {
  editorState!.clearAll();
  resetDotsUI();
  display.updateEditors(editorState!);
}

function resetDotsUI(): void {
  editorState!.resetDots();
  document
    .querySelectorAll<HTMLElement>(".key")
    .forEach(k => k.classList.remove("active"));
  display.updatePreview(editorState!);
}

// ==================== INITIALIZATION ====================

function init(): void {
  try {
    initModes();
  } catch (e) {
    console.error("Failed to initialize mode system:", e);
    return;
  }

  // Keyboard handler (must be after initModes so editorState exists)
  const keyboard = new KeyboardHandler(editorState!, display, layout, {
    confirmChar,
    deleteLastChar,
    addNewline,
    resetDotsUI,
    cycleToNextMode: () => modeRegistry.cycleToNext(),
    cycleToPreviousMode: () => modeRegistry.cycleToPrevious(),
    cycleCapitalMode: () => {
      editorState!.cycleCapitalMode();
      display.updateEditors(editorState!);
    }
  });
  keyboard.init();

  try { initModeSidebar(); } catch (e) { console.error("Failed to init sidebar:", e); }
  try { layout.initSelector(); } catch (e) { console.error("Failed to init layout selector:", e); }
  try { initModeSelector(); } catch (e) { console.error("Failed to init mode selector:", e); }
  try { layout.setLayout(layout.loadSaved()); } catch (e) {
    console.error("Failed to set layout from storage, using default:", e);
    if (LAYOUTS[DEFAULT_LAYOUT]) {
      // Fallback — layout manager already has DEFAULT_LAYOUT key map
    }
  }
  try { display.buildAlphabetReference(); } catch (e) { console.error("Failed to build alphabet reference:", e); }
  try { display.updateEditors(editorState!); } catch (e) { console.error("Failed to update editors:", e); }
  try { display.updatePreview(editorState!); } catch (e) { console.error("Failed to update preview:", e); }

  // Sync scroll between editors
  dom.brailleEditor.addEventListener("scroll", () => {
    dom.textEditor.scrollTop = dom.brailleEditor.scrollTop;
  });
  dom.textEditor.addEventListener("scroll", () => {
    dom.brailleEditor.scrollTop = dom.textEditor.scrollTop;
  });

  // Wire up button click handlers
  document
    .querySelector('[data-action="confirm"]')
    ?.addEventListener("click", confirmChar);
  document
    .querySelector('[data-action="delete"]')
    ?.addEventListener("click", deleteLastChar);
  document
    .querySelector('[data-action="copy-braille"]')
    ?.addEventListener("click", () => clipboard.copyToClipboard(editorState!.brailleContent, dom.copyBrailleBtn));
  document
    .querySelector('[data-action="copy-text"]')
    ?.addEventListener("click", () => clipboard.copyToClipboard(editorState!.textContent, dom.copyTextBtn));
  document
    .querySelector('[data-action="clear"]')
    ?.addEventListener("click", clearEditor);

  const currentMode = modeRegistry.getMode();
  if (currentMode) {
    dom.currentModeDisplay.textContent = currentMode.name;
  }

  console.log("Braille editor initialized successfully");
}

init();
