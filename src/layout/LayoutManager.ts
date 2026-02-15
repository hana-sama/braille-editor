/**
 * LAYOUT MANAGER
 * ==============
 * Handles keyboard layout selection, storage, visual rendering,
 * and key attachment.
 */

import { LAYOUTS, DEFAULT_LAYOUT, STORAGE_KEYS } from "../braille-data";
import type { DotNumber, Layout } from "../types";

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

// ==================== KEY MAP ====================

function buildKeyMap(layout: Layout): Record<string, DotNumber> {
  const map: Record<string, DotNumber> = {};
  [...layout.leftHand, ...layout.rightHand].forEach(({ key, dot }) => {
    map[key.toLowerCase()] = dot;
    map[key.toUpperCase()] = dot;
  });
  return map;
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

// ==================== LAYOUT MANAGER ====================

export interface LayoutDom {
  layoutSelector: HTMLDivElement;
  layoutDescription: HTMLDivElement;
  keyboardLayout: HTMLDivElement;
}

export interface LayoutManagerCallbacks {
  onDotInput: (dot: DotNumber) => void;
  onToast: (message: string) => void;
}

export class LayoutManager {
  private dom: LayoutDom;
  private callbacks: LayoutManagerCallbacks;
  private currentLayout: string = DEFAULT_LAYOUT;
  private keyMap: Record<string, DotNumber>;

  constructor(dom: LayoutDom, callbacks: LayoutManagerCallbacks) {
    this.dom = dom;
    this.callbacks = callbacks;
    this.keyMap = LAYOUTS[DEFAULT_LAYOUT]
      ? buildKeyMap(LAYOUTS[DEFAULT_LAYOUT])
      : {};
  }

  /** Get the current key-to-dot mapping. */
  getKeyMap(): Record<string, DotNumber> {
    return this.keyMap;
  }

  /** Get the current layout key string. */
  getCurrentLayout(): string {
    return this.currentLayout;
  }

  /** Initialize the layout selector UI. */
  initSelector(): void {
    this.dom.layoutSelector.innerHTML = Object.entries(LAYOUTS)
      .map(
        ([key, layout]) => `
      <div class="layout-option">
        <input type="radio" id="layout-${key}" name="layout" value="${key}" ${key === this.currentLayout ? "checked" : ""} aria-describedby="layout-description">
        <label for="layout-${key}">${layout.name}</label>
      </div>
    `
      )
      .join("");

    document
      .querySelectorAll<HTMLInputElement>('input[name="layout"]')
      .forEach(radio => {
        radio.addEventListener("change", () => this.setLayout(radio.value));
      });

    this.updateDescription();
  }

  /** Set the active layout. */
  setLayout(layoutKey: string): void {
    if (!LAYOUTS[layoutKey]) {
      console.error(`Unknown layout: ${layoutKey}`);
      return;
    }

    this.currentLayout = layoutKey;
    const layout = LAYOUTS[layoutKey];

    this.keyMap = buildKeyMap(layout);

    this.updateDescription();
    this.rebuildKeyboardVisual();
    this.resetDotsUI();
    this.updateInstructions();
    LayoutStorage.save(layoutKey);

    const radio = document.getElementById(
      `layout-${layoutKey}`
    ) as HTMLInputElement | null;
    if (radio) radio.checked = true;
  }

  /** Load saved layout from storage. */
  loadSaved(): string {
    return LayoutStorage.load(DEFAULT_LAYOUT);
  }

  /** Cycle to the next layout. */
  cycleToNext(): void {
    const layouts = Object.keys(LAYOUTS);
    const nextLayout =
      layouts[(layouts.indexOf(this.currentLayout) + 1) % layouts.length];
    this.setLayout(nextLayout);
    this.callbacks.onToast(`Layout: ${LAYOUTS[nextLayout].name}`);
  }

  /** Update the layout description text. */
  private updateDescription(): void {
    this.dom.layoutDescription.textContent = LAYOUTS[this.currentLayout].description;
  }

  /** Rebuild the keyboard visual for the current layout. */
  private rebuildKeyboardVisual(): void {
    const layout = LAYOUTS[this.currentLayout];
    const leftHTML = layout.leftHand
      .map(({ key, dot }) => renderKey(key, dot))
      .join("");
    const rightHTML = layout.rightHand
      .map(({ key, dot }) => renderKey(key, dot))
      .join("");

    this.dom.keyboardLayout.innerHTML = `
      <div class="hand">${leftHTML}</div>
      <div class="hand">${rightHTML}</div>
    `;
    this.attachKeyListeners();
  }

  /** Attach mouse/keyboard listeners to key elements. */
  private attachKeyListeners(): void {
    document.querySelectorAll<HTMLElement>(".key").forEach(keyEl => {
      keyEl.addEventListener("mousedown", e => {
        e.preventDefault();
        this.callbacks.onDotInput(parseInt(keyEl.dataset.dot!) as DotNumber);
        keyEl.classList.add("active");
        keyEl.setAttribute("aria-pressed", "true");
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
          this.callbacks.onDotInput(parseInt(keyEl.dataset.dot!) as DotNumber);
          keyEl.classList.add("active");
          keyEl.setAttribute("aria-pressed", "true");
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

  /** Reset visual key states. */
  private resetDotsUI(): void {
    document
      .querySelectorAll<HTMLElement>(".key")
      .forEach(k => k.classList.remove("active"));
  }

  /** Update keyboard instructions text. */
  private updateInstructions(): void {
    const layout = LAYOUTS[this.currentLayout];
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
}
