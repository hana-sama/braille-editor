/**
 * DISPLAY UPDATER
 * ===============
 * Handles all display updates: preview panel, editors, indicators,
 * and alphabet/number reference grids.
 */

import { BRAILLE_START } from "../braille-data";
import { EditorState } from "../core/EditorState";
import { BrailleMode } from "../modes/BrailleMode";
import { modeRegistry } from "../modes/ModeRegistry";
import type { BrailleCode } from "../types";

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

// ==================== DISPLAY UPDATER ====================

export interface DisplayDom {
  braillePreview: HTMLSpanElement;
  textPreview: HTMLSpanElement;
  dotsPreview: HTMLSpanElement;
  brailleEditor: HTMLDivElement;
  textEditor: HTMLDivElement;
  brailleCount: HTMLSpanElement;
  textCount: HTMLSpanElement;
  alphabetGrid: HTMLDivElement;
  numberGrid: HTMLDivElement;
  numberModeIndicator: HTMLDivElement;
  capitalModeIndicator: HTMLDivElement;
  typeformModeIndicator: HTMLDivElement;
  statusText: HTMLSpanElement;
}

export class DisplayUpdater {
  private dom: DisplayDom;

  constructor(dom: DisplayDom) {
    this.dom = dom;
  }

  /** Export codeToBraille for external use (e.g., status bar). */
  codeToBraille(code: BrailleCode): string {
    return codeToBraille(code);
  }

  /** Update the preview panel showing current dot input. */
  updatePreview(editorState: EditorState): void {
    const mode = modeRegistry.getMode() as BrailleMode;

    if (!editorState.hasActiveDots()) {
      if (editorState.isPendingIndicator()) {
        const pendingCode = editorState.getPendingIndicator()!;
        this.dom.braillePreview.textContent = codeToBraille(pendingCode);
        this.dom.textPreview.textContent = "pending…";
        this.dom.dotsPreview.textContent = codeToDots(pendingCode).join("-");
        this.dom.braillePreview.classList.add("has-input");
      } else {
        this.dom.braillePreview.textContent = "\u2800";
        this.dom.textPreview.textContent = "-";
        this.dom.dotsPreview.textContent = "-";
      }
      this.clearAlphabetHighlight();
      return;
    }

    const code = editorState.getCurrentCode();
    const braille = editorState.getCurrentBraille();
    const context = editorState.getContext();
    let text = mode.codeToText(code, context);
    const dots = editorState.getDotsArray().join("-");

    // Show what the sequence would resolve to if pending
    if (editorState.isPendingIndicator()) {
      const result = mode.resolveSequence(
        editorState.getPendingIndicator()!,
        code,
        context
      );
      if (result) {
        text = `${result.text} (${result.name.toLowerCase().replace(/_/g, " ")})`;
      }
    }

    // Apply capitalization preview
    const capitalMode = editorState.getCapitalMode();
    if (capitalMode > 0 && mode.isLetter(code)) {
      text = text.toUpperCase();
    }

    this.dom.braillePreview.textContent = braille;
    this.dom.textPreview.textContent = text;
    this.dom.dotsPreview.textContent = dots;
    this.dom.braillePreview.classList.toggle(
      "has-input",
      editorState.hasActiveDots()
    );

    // Highlight in reference
    if (editorState.isInNumberMode() && mode.isLetterAtoJ(code)) {
      this.highlightNumber(code);
    } else {
      this.highlightAlphabet(code);
    }
  }

  /** Update the editor panes with current content. */
  updateEditors(editorState: EditorState): void {
    this.dom.brailleEditor.innerHTML =
      editorState.brailleContent + '<span class="cursor"></span>';
    this.dom.textEditor.innerHTML =
      editorState.textContent + '<span class="cursor"></span>';
    this.dom.brailleCount.textContent = `${editorState.length} chars`;
    this.dom.textCount.textContent = `${editorState.textLength} chars`;
    this.dom.textEditor.scrollTop = this.dom.brailleEditor.scrollTop;
    this.dom.numberModeIndicator.classList.toggle(
      "active",
      editorState.isInNumberMode()
    );

    // Status text
    if (editorState.isPendingIndicator()) {
      this.dom.statusText.textContent =
        "Pending: " + codeToBraille(editorState.getPendingIndicator()!) + " …";
    } else {
      const typeform = editorState.getTypeformMode();
      if (typeform) {
        this.dom.statusText.textContent =
          typeform.mode.charAt(0).toUpperCase() +
          typeform.mode.slice(1) +
          " (" +
          typeform.scope +
          ")";
      } else if (editorState.isInNumberMode()) {
        this.dom.statusText.textContent = "Number Mode Active";
      } else {
        this.dom.statusText.textContent = "Ready";
      }
    }

    this.updateCapitalModeIndicator(editorState);
    this.updateTypeformIndicator(editorState);
  }

  /** Update the key visual state (pressed/released). */
  updateKeyVisual(key: string, active: boolean): void {
    const el = document.querySelector<HTMLElement>(
      `.key[data-key="${key.toLowerCase()}"]`
    );
    if (el) {
      el.classList.toggle("active", active);
      el.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  /** Build the alphabet and number reference grids. */
  buildAlphabetReference(): void {
    const mode = modeRegistry.getMode() as BrailleMode;
    const alphabet = mode.getAlphabet();

    this.dom.alphabetGrid.innerHTML = Object.entries(alphabet)
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
    this.dom.numberGrid.innerHTML = Object.entries(numberMap)
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

  // ==================== PRIVATE HELPERS ====================

  private highlightAlphabet(code: number): void {
    this.clearAlphabetHighlight();
    const item = document.querySelector<HTMLElement>(
      `.alpha-item[data-code="${code}"]`
    );
    if (item) item.classList.add("highlight");
  }

  private highlightNumber(code: number): void {
    this.clearAlphabetHighlight();
    const item = document.querySelector<HTMLElement>(
      `.alpha-item[data-number-code="${code}"]`
    );
    if (item) item.classList.add("highlight");
  }

  private clearAlphabetHighlight(): void {
    document
      .querySelectorAll<HTMLElement>(".alpha-item.highlight")
      .forEach(el => el.classList.remove("highlight"));
  }

  private updateCapitalModeIndicator(editorState: EditorState): void {
    const indicator = this.dom.capitalModeIndicator;
    const capitalMode = editorState.getCapitalMode();
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

  private updateTypeformIndicator(editorState: EditorState): void {
    const indicator = this.dom.typeformModeIndicator;

    const typeform = editorState.getTypeformMode();
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
}
